import * as chokidar from 'chokidar';
import { createCompiler } from '../../compiler';
import * as Fs from 'fs';
import { debounce } from 'lodash';
import * as Path from 'path';
import * as PropertyAnalyzer from './property-analyzer';
import * as ReactUtils from '../typescript/react-utils';
import * as readPkg from 'read-pkg';
import * as SlotAnalyzer from './slot-analzyer';
import * as Types from '../../model/types';
import * as TypeScript from '../typescript';
import * as ts from 'typescript';
import * as TypescriptUtils from '../typescript/typescript-utils';
import * as Util from 'util';
import { Compiler } from 'webpack';

const loadPatternplateConfig = require('@patternplate/load-config');
const loadPatternplateMeta = require('@patternplate/load-meta');
const commonDir = require('common-dir');
const globParent = require('glob-parent');

export interface PatternCandidate {
	artifactPath: string;
	displayName: string;
	id: string;
	sourcePath: string;
}

export interface AnalyzeOptions {
	withBundle?: boolean;
	getGlobalPatternId(contextId: string): string;
	getGlobalPropertyId(patternContextId: string, propertyContextId: string): string;
	getGlobalSlotId(patternContextId: string, slotContextId: string): string;
	getGobalEnumOptionId(enumId: string, optionContextId: string): string;
}

interface AnalyzeContext {
	candidate: PatternCandidate;
	options: AnalyzeOptions;
	program: ts.Program;
}

type PatternAnalyzer = (
	candidate: PatternCandidate,
	predicate: PatternAnalyzerPredicate
) => Types.PatternAnalysis[];
type PatternAnalyzerPredicate = (
	ex: TypeScript.TypescriptExport,
	ctx: AnalyzeContext
) => Types.PatternAnalysis | undefined;

export async function analyze(
	path: string,
	options: AnalyzeOptions
): Promise<Types.LibraryAnalysis> {
	const pkg = await readPkg(path);
	const patterns = await analyzePatterns({ cwd: path, options });

	const getBundle = async () => {
		const compiler = await createPatternCompiler(patterns, { cwd: path });
		await Util.promisify(compiler.run).bind(compiler)();
		return (compiler.outputFileSystem as typeof Fs).readFileSync('/components.js').toString();
	};

	const bundle = options.withBundle ? await getBundle() : '';

	return {
		bundle,
		name: pkg.name || 'Unnamed Library',
		patterns,
		path,
		version: pkg.version || '1.0.0'
	};
}

export async function watch(
	path: string,
	options: AnalyzeOptions,
	onChange: (analyis: Types.LibraryAnalysis) => void
): Promise<Types.Watcher> {
	let active = false;
	let running = deferrable();

	const patterns = await analyzePatterns({ cwd: path, options });
	const compiler = await createPatternCompiler(patterns, { cwd: path });

	let parents = await getParents(path);

	const watcher = chokidar.watch(parents, {
		ignoreInitial: true
	});

	const analysis = await analyze(path, options);

	watcher.on(
		'all',
		debounce(async () => {
			await running;
			const updatedParents = await getParents(path);

			const addedParents = updatedParents.filter(u => !parents.includes(u));
			const removedParents = parents.filter(p => !updatedParents.includes(p));

			watcher.add(addedParents);
			watcher.unwatch(removedParents);

			parents = updatedParents;

			const update = await analyze(path, { ...options, withBundle: false });

			analysis.name = update.name;
			analysis.path = update.path;
			analysis.patterns = update.patterns;
			analysis.version = update.version;

			onChange(analysis);
		}, 300)
	);

	compiler.hooks.watchRun.tap('typescript-react-analyzer', () => {
		running = deferrable();
	});

	compiler.watch({}, async () => {
		running.resolve();
		analysis.bundle = (compiler.outputFileSystem as typeof Fs)
			.readFileSync('/components.js')
			.toString();
		onChange(analysis);
	});

	return {
		getPath(): string {
			return path;
		},
		isActive(): boolean {
			return active;
		},
		stop(): void {
			watcher.close();
			active = false;
		}
	};
}

// tslint:disable-next-line:no-any
function deferrable(): any {
	let resolve;
	const promise = new Promise(r => (resolve = r));
	// tslint:disable-next-line:no-any
	(promise as any).resolve = resolve;
	return promise;
}

async function analyzePatterns(context: {
	cwd: string;
	options: AnalyzeOptions;
}): Promise<Types.PatternAnalysis[]> {
	const patternCandidates = await findPatternCandidates(context.cwd);
	const sourcePaths = patternCandidates.map(p => p.sourcePath);
	const program = ts.createProgram(sourcePaths, {});
	const analyzePattern = getPatternAnalyzer(program, context.options);
	return patternCandidates.reduce(
		(acc, candidate) => [...acc, ...analyzePattern(candidate, analyzePatternExport)],
		[]
	);
}

async function createPatternCompiler(
	patterns: Types.PatternAnalysis[],
	context: { cwd: string }
): Promise<Compiler> {
	const compilerPatterns = patterns.map(({ path: patternPath, pattern }) => ({
		id: pattern.id,
		path: patternPath
	}));

	return createCompiler(compilerPatterns, { cwd: context.cwd, infrastructure: false });
}

async function getParents(path: string): Promise<string[]> {
	const patternplateConfig = await loadPatternplateConfig({ cwd: path });
	const { config, filepath } = patternplateConfig;
	const cwd = filepath ? Path.dirname(filepath) : path;
	const { patterns } = await loadPatternplateMeta({ entry: config.entry, cwd });

	const globParents = config.entry
		.filter(e => !e.startsWith('!'))
		.map(e => Path.join(cwd, globParent(e)));

	const metaParents =
		patterns.length === 0 ? [] : [commonDir(patterns.map(p => Path.join(cwd, p.path)))];

	return [filepath, ...globParents, ...metaParents].filter(p => typeof p === 'string');
}

function getPatternAnalyzer(program: ts.Program, options: AnalyzeOptions): PatternAnalyzer {
	return (
		candidate: PatternCandidate,
		predicate: PatternAnalyzerPredicate
	): Types.PatternAnalysis[] => {
		const sourceFile = program.getSourceFile(candidate.sourcePath);

		if (!sourceFile) {
			return [];
		}

		return TypescriptUtils.getExports(sourceFile, program)
			.map(ex => predicate(ex, { program, candidate, options }))
			.filter((p): p is Types.PatternAnalysis => typeof p !== 'undefined');
	};
}

function analyzePatternExport(
	ex: TypeScript.TypescriptExport,
	ctx: AnalyzeContext
): Types.PatternAnalysis | undefined {
	const reactType = ReactUtils.findReactComponentType(ctx.program, ex.type);

	if (!reactType) {
		return;
	}

	const reactTypeArguments = reactType.getTypeArguments();

	if (reactTypeArguments.length === 0) {
		return;
	}

	const [propTypes] = reactTypeArguments;
	const exportName = ex.name || 'default';
	const contextId = `${ctx.candidate.id}:${exportName}`;
	const id = ctx.options.getGlobalPatternId(contextId);

	const properties = PropertyAnalyzer.analyze(propTypes.type, {
		program: ctx.program,
		getPropertyId(propertyContextId: string): string {
			return ctx.options.getGlobalPropertyId(id, propertyContextId);
		},
		getEnumOptionId: (enumId, optionContextId) =>
			ctx.options.getGobalEnumOptionId(enumId, optionContextId)
	});

	const slots = SlotAnalyzer.analyzeSlots(propTypes.type, {
		program: ctx.program,
		getSlotId(slotContextId: string): string {
			return ctx.options.getGlobalSlotId(id, slotContextId);
		}
	});

	return {
		path: ctx.candidate.artifactPath,
		pattern: {
			contextId,
			exportName,
			id,
			name: exportName !== 'default' ? exportName : ctx.candidate.displayName,
			origin: 'user-provided',
			propertyIds: properties.map(p => p.id),
			slots,
			type: 'pattern'
		},
		properties
	};
}

async function findPatternCandidates(path: string): Promise<PatternCandidate[]> {
	const patternplateConfig = await loadPatternplateConfig({ cwd: path });
	const { config, filepath } = patternplateConfig;
	const cwd = filepath ? Path.dirname(filepath) : path;

	const { patterns } = await loadPatternplateMeta({ entry: config.entry, cwd });

	return patterns.map(pattern => {
		const sourceDirname = Path.dirname(pattern.source);
		const sourceExtname = Path.extname(pattern.source);

		const sourcePath = pattern.manifest.main
			? Path.resolve(cwd, Path.dirname(pattern.path), pattern.manifest.main)
			: Path.resolve(cwd, sourceDirname, `index${sourceExtname}`);

		const relSourcePath = Path.relative(Path.join(cwd, pattern.source), sourcePath);
		const artifactDirname = Path.dirname(Path.resolve(cwd, pattern.artifact, relSourcePath));
		const artifactBasename = Path.basename(sourcePath, Path.extname(sourcePath));
		const artifactExtname = Path.extname(pattern.artifact);

		return {
			artifactPath: Path.join(artifactDirname, `${artifactBasename}${artifactExtname}`),
			displayName: pattern.manifest.displayName || pattern.manifest.name,
			id: pattern.id,
			sourcePath
		};
	});
}
