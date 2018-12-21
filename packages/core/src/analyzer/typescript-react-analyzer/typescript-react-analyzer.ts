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
import * as uuid from 'uuid';
import { Compiler } from 'webpack';
import * as resolve from 'resolve';
import { last } from 'lodash';
import { PatternAnalysis } from '../../types';
import * as Tsa from 'ts-simple-ast';
import { usesChildren } from '../react-utils/uses-children';
import { getTsaExport } from '../typescript-utils/get-tsa-export';
import { setExtname } from '../typescript-utils/set-extname';
import { getExportedNode } from '../typescript-utils/get-exported-node';

const precinct = require('precinct');

export interface PatternCandidate {
	artifactPath: string;
	declarationPath: string;
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
	project: Tsa.Project;
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
	pkgPath: string,
	options: AnalyzeOptions
): Promise<Types.LibraryAnalysisResult> {
	try {
		const id = uuid.v4();
		const pkg = await readPkg(pkgPath);
		const cwd = Path.dirname(pkgPath);
		const patterns = await analyzePatterns({ pkgPath, options, pkg, cwd });

		const getBundle = async () => {
			const compiler = await createPatternCompiler(patterns, { cwd, id });
			await Util.promisify(compiler.run).bind(compiler)();
			return (compiler.outputFileSystem as any).readFileSync(`/${id}.js`).toString();
		};

		return {
			type: Types.LibraryAnalysisResultType.Success,
			result: {
				id,
				bundle: await getBundle(),
				name: pkg.name || 'Unnamed Library',
				description: pkg.description || '',
				patterns,
				path: pkgPath,
				version: pkg.version || '1.0.0'
			}
		};
	} catch (error) {
		return {
			type: Types.LibraryAnalysisResultType.Error,
			error
		};
	}
}

async function analyzePatterns(context: {
	cwd: string;
	pkgPath: string;
	options: AnalyzeOptions;
	pkg: unknown;
}): Promise<Types.PatternAnalysis[]> {
	const patternCandidates = await findPatternCandidates({ cwd: context.cwd, pkg: context.pkg });

	const declarationPaths = patternCandidates.map(p => p.declarationPath);

	const optionsPath = ts.findConfigFile(context.cwd, Fs.existsSync);
	const options = optionsPath
		? ts.readConfigFile(optionsPath, path => String(Fs.readFileSync(path)))
		: { config: {} };

	const compilerHost = ts.createCompilerHost(options.config);
	compilerHost.getCurrentDirectory = () => context.cwd;

	const program = ts.createProgram(declarationPaths, options.config, compilerHost);

	const project = new Tsa.Project({
		tsConfigFilePath: optionsPath
	});

	const analyzePattern = getPatternAnalyzer(program, project, context.options);
	return patternCandidates.reduce<PatternAnalysis[]>(
		(acc, candidate) => [...acc, ...analyzePattern(candidate, analyzePatternExport)],
		[]
	);
}

async function createPatternCompiler(
	patterns: Types.PatternAnalysis[],
	context: { cwd: string; id: string }
): Promise<Compiler> {
	const compilerPatterns = patterns.map(({ path: patternPath, pattern }) => ({
		id: pattern.id,
		path: patternPath
	}));

	return createCompiler(compilerPatterns, {
		cwd: context.cwd,
		infrastructure: false,
		id: context.id
	});
}

function getPatternAnalyzer(
	program: ts.Program,
	project: Tsa.Project,
	options: AnalyzeOptions
): PatternAnalyzer {
	return (
		candidate: PatternCandidate,
		predicate: PatternAnalyzerPredicate
	): Types.PatternAnalysis[] => {
		const sourceFile = program.getSourceFile(candidate.declarationPath);

		if (!sourceFile) {
			return [];
		}

		const result = TypeScriptUtils.getExports(sourceFile, program)
			.map(ex => predicate(ex, { program, project, candidate, options }))
			.filter((p): p is Types.PatternAnalysis => typeof p !== 'undefined');

		return result;
	};
}

function analyzePatternExport(
	ex: TypeScriptUtils.TypescriptExport,
	ctx: AnalyzeContext
): Types.PatternAnalysis | undefined {
	const reactType = ReactUtils.findReactComponentType(ex.type, { program: ctx.program });

	if (!reactType) {
		return;
	}

	const reactTypeArguments = reactType.getTypeArguments();

	if (reactTypeArguments.length === 0) {
		return;
	}

	const [propTypes] = reactTypeArguments;
	const exportName = ex.exportName || 'default';

	const contextId = `${ctx.candidate.id}:${exportName}`;
	const id = ctx.options.getGlobalPatternId(contextId);

	if (ex.ignore) {
		return;
	}

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

	// Try to find out if children are used if they are not typed explicitly
	if (!slots.some(slot => slot.type === 'children')) {
		const exp = getTsaExport(ex, { project: ctx.project });
		const expNode = getExportedNode(exp);

		if (expNode && usesChildren(expNode, { project: ctx.project })) {
			slots.push({
				model: Types.ModelName.PatternSlot,
				contextId: 'children',
				description: 'Element that render inside this element',
				example: '',
				hidden: false,
				id: ctx.options.getGlobalSlotId(id, 'children'),
				label: 'children',
				propertyName: 'children',
				required: false,
				type: 'children'
			});
		}
	}

	return {
		path: ctx.candidate.artifactPath,
		pattern: {
			model: Types.ModelName.Pattern,
			contextId,
			description: ex.description ? ex.description : ctx.candidate.description,
			exportName,
			icon: ex.icon,
			id,
			name:
				ex.displayName || (exportName !== 'default' ? exportName : ctx.candidate.displayName),
			origin: 'user-provided',
			propertyIds: properties.map(p => p.id),
			slots,
			type: 'pattern'
		},
		properties
	};
}

async function findPatternCandidates({
	cwd,
	pkg
}: {
	cwd: string;
	// tslint:disable-next-line:no-any
	pkg: any;
}): Promise<PatternCandidate[]> {
	const entry = Path.join(cwd, getTypingsEntry(pkg));
	const declarationsList = getImportsFromPath(entry, {
		extensions: ['.d.ts'],
		deep: true,
		init: new Set()
	});

	return [...declarationsList].map(declarationPath => {
		const artifactPath = setExtname(declarationPath, '.js');
		const significantPath = getSignificantPath(Path.relative(cwd, declarationPath));
		const dName = last(significantPath);

		return {
			artifactPath,
			declarationPath,
			description: '',
			displayName: dName ? Path.basename(dName, Path.extname(dName)) : 'Unknown Pattern',
			id: significantPath.join('/'),
			sourcePath: Path.dirname(declarationPath)
		};
	});
}

function getImportsFromPath(
	path: string,
	config: { extensions: string[]; init: Set<string>; deep: boolean } = {
		init: new Set(),
		deep: true,
		extensions: []
	}
): Set<string> {
	const basedir = Path.dirname(path);

	const dependencyList: string[] = precinct
		.paperwork(path)
		.filter((p: string) => p.startsWith('.'))
		.map((p: string) =>
			resolve.sync(p, {
				basedir,
				extensions: config.extensions
			})
		);

	if (!config.deep) {
		return new Set(dependencyList);
	}

	return dependencyList.reduce((acc: Set<string>, dependency: string) => {
		if (config.init.has(dependency)) {
			return acc;
		}
		acc.add(dependency);
		getImportsFromPath(dependency, { ...config, init: acc });
		return acc;
	}, config.init);
}

function getSignificantPath(input: string): string[] {
	const stripped = Path.basename(input, Path.extname(input));

	if (stripped === 'index' || stripped === 'index.d') {
		return Path.dirname(input)
			.split(Path.sep)
			.filter(p => p !== '..');
	}

	return input.split(Path.sep).filter(p => p !== '..');
}

// tslint:disable-next-line:no-any
function getTypingsEntry(pkg: { [key: string]: unknown }): string {
	if (typeof pkg['alva:typings'] === 'string') {
		return pkg['alva:typings'] as string;
	}

	if (typeof pkg.typings === 'string') {
		return pkg.typings;
	}

	if (typeof pkg['alva:main'] === 'string') {
		return setExtname(pkg['alva:main'] as string, '.d.ts');
	}

	if (typeof pkg.main === 'string') {
		return setExtname(pkg.main, '.d.ts');
	}

	return './index.d.ts';
}
