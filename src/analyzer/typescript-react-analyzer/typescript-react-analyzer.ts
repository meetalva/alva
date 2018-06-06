import { createCompiler } from '../../compiler';
import * as Fs from 'fs';
import * as Path from 'path';
import * as PropertyAnalyzer from './property-analyzer';
import * as ReactUtils from '../react-utils';
import * as readPkg from 'read-pkg';
import * as SlotAnalyzer from './slot-analzyer';
import * as Types from '../../types';
import * as TypeScriptUtils from '../typescript-utils';
import * as ts from 'typescript';
import * as Util from 'util';
import { Compiler } from 'webpack';

const loadPatternplateConfig = require('@patternplate/load-config');
const loadPatternplateMeta = require('@patternplate/load-meta');

export interface PatternCandidate {
	artifactPath: string;
	declarationPath: string | undefined;
	description: string;
	displayName: string;
	id: string;
	sourcePath: string;
}

export interface AnalyzeOptions {
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
	ex: TypeScriptUtils.TypescriptExport,
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

	return {
		bundle: await getBundle(),
		name: pkg.name || 'Unnamed Library',
		patterns,
		path,
		version: pkg.version || '1.0.0'
	};
}

async function analyzePatterns(context: {
	cwd: string;
	options: AnalyzeOptions;
}): Promise<Types.PatternAnalysis[]> {
	const patternCandidates = await findPatternCandidates(context.cwd);
	const declarationPaths = patternCandidates.map(p => p.declarationPath || p.sourcePath);

	const optionsPath = ts.findConfigFile(context.cwd, Fs.existsSync);
	const options = optionsPath
		? ts.readConfigFile(optionsPath, path => String(Fs.readFileSync(path)))
		: { config: {} };

	const compilerHost = ts.createCompilerHost(options.config);
	compilerHost.getCurrentDirectory = () => context.cwd;

	const program = ts.createProgram(declarationPaths, options.config, compilerHost);

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

function getPatternAnalyzer(program: ts.Program, options: AnalyzeOptions): PatternAnalyzer {
	return (
		candidate: PatternCandidate,
		predicate: PatternAnalyzerPredicate
	): Types.PatternAnalysis[] => {
		const sourceFile = program.getSourceFile(candidate.declarationPath || candidate.sourcePath);

		if (!sourceFile) {
			return [];
		}

		return TypeScriptUtils.getExports(sourceFile, program)
			.map(ex => predicate(ex, { program, candidate, options }))
			.filter((p): p is Types.PatternAnalysis => typeof p !== 'undefined');
	};
}

function analyzePatternExport(
	ex: TypeScriptUtils.TypescriptExport,
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
			description: ctx.candidate.description,
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

		const artifactPath = Path.join(artifactDirname, `${artifactBasename}${artifactExtname}`);
		const declarationPath = Path.join(artifactDirname, `${artifactBasename}.d.ts`);

		return {
			artifactPath: Fs.existsSync(artifactPath) ? artifactPath : undefined,
			declarationPath: Fs.existsSync(declarationPath) ? declarationPath : undefined,
			description: pattern.manifest.description || '',
			displayName: pattern.manifest.displayName || pattern.manifest.name,
			id: pattern.id,
			sourcePath
		};
	});
}
