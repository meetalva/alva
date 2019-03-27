import { createCompiler } from '../compiler';
import * as Fs from 'fs';
import * as Path from 'path';
import * as PropertyAnalyzer from './property-analyzer';
import * as ReactUtils from '../react-utils';
import * as SlotAnalyzer from './slot-analzyer';
import * as Types from '@meetalva/types';
import * as TypeScriptUtils from '../typescript-utils';
import * as ts from 'typescript';
import * as Util from 'util';
import * as uuid from 'uuid';
import { Compiler } from 'webpack';
import * as resolve from 'resolve';
import { last, merge } from 'lodash';
import * as Tsa from 'ts-simple-ast';
import { usesChildren } from '../react-utils/uses-children';
import { getTsaExport } from '../typescript-utils/get-tsa-export';
import { setExtname } from '../typescript-utils/set-extname';
import { getExportedNode } from '../typescript-utils/get-exported-node';
import * as IdHasher from '../id-hasher';

const precinct = require('precinct');
const readPkg = require('read-pkg');

export interface PatternCandidate {
	artifactPath: string;
	declarationPath: string;
	description: string;
	displayName: string;
	id: string;
	sourcePath: string;
}

export interface AnalyzeOptions {
	analyzeBuiltins: boolean;
}

interface AnalyzeContext {
	candidate: PatternCandidate;
	options: AnalyzeOptions;
	program: ts.Program;
	project: Tsa.Project;
	pkg: unknown;
	pkgPath: string;
	knownProperties: Types.PropertyAnalysis[];
	knownPatterns: Types.InternalPatternAnalysis[];
}

type PatternAnalyzer = (
	candidate: PatternCandidate,
	previous: Types.InternalPatternAnalysis[],
	predicate: PatternAnalyzerPredicate
) => Types.InternalPatternAnalysis[];

type PatternAnalyzerPredicate = (
	ex: TypeScriptUtils.TypescriptExport,
	ctx: AnalyzeContext
) => Types.InternalPatternAnalysis | undefined;

export const analyzeDefaults = {
	analyzeBuiltins: false,
	ids: {
		patterns: [],
		properties: [],
		enumOptions: [],
		slots: []
	}
};

export async function analyze(
	pkgPath: string,
	rawOptions: Partial<AnalyzeOptions> = analyzeDefaults
): Promise<Types.LibraryAnalysisResult> {
	try {
		const id = uuid.v4();
		// readPkg is typed faultily
		const pkg = await readPkg({ cwd: Path.dirname(pkgPath) });
		const cwd = Path.dirname(pkgPath);
		const options = merge({}, analyzeDefaults, rawOptions) as AnalyzeOptions;
		const patterns = await analyzePatterns({ pkgPath, options, pkg, cwd });

		const getBundle = async () => {
			if (patterns.length === 0) {
				return '';
			}

			const compiler = await createPatternCompiler(patterns, { cwd, id });
			const stats = await Util.promisify(compiler.run).bind(compiler)();

			if (stats.hasErrors()) {
				const message = stats.toString({
					chunks: false,
					colors: false
				});

				console.error(message);
				throw new Error();
			}

			if (stats.hasWarnings()) {
				console.warn(
					stats.toString({
						chunks: false,
						colors: false
					})
				);
			}

			return (compiler.outputFileSystem as any).readFileSync(`/${id}.js`).toString();
		};

		return {
			type: Types.LibraryAnalysisResultType.Success,
			result: {
				bundle: await getBundle(),
				id,
				packageFile: pkg,
				path: pkgPath,
				patterns: patterns.map(p => ({
					path: p.path,
					pattern: p.pattern,
					properties: p.properties.map(prop => prop.property)
				}))
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
}): Promise<Types.InternalPatternAnalysis[]> {
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

	const analyzePattern = getPatternAnalyzer(
		program,
		project,
		context.pkg,
		context.pkgPath,
		context.options
	);

	return patternCandidates.reduce<Types.InternalPatternAnalysis[]>(
		(acc, candidate) => [...acc, ...analyzePattern(candidate, acc, analyzePatternExport)],
		[]
	);
}

async function createPatternCompiler(
	patterns: Types.InternalPatternAnalysis[],
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

export function getPatternAnalyzer(
	program: ts.Program,
	project: Tsa.Project,
	pkg: unknown,
	pkgPath: string,
	options: AnalyzeOptions
): PatternAnalyzer {
	return (
		candidate: PatternCandidate,
		previous: Types.InternalPatternAnalysis[],
		predicate: PatternAnalyzerPredicate
	): Types.InternalPatternAnalysis[] => {
		const sourceFile = program.getSourceFile(candidate.declarationPath);
		const knownProperties = previous.reduce<Types.PropertyAnalysis[]>(
			(a, p) => [...a, ...p.properties],
			[]
		);

		if (!sourceFile) {
			return [];
		}

		return TypeScriptUtils.getExports(sourceFile, program)
			.map(ex =>
				predicate(ex, {
					program,
					project,
					pkg,
					pkgPath,
					candidate,
					options,
					knownProperties,
					knownPatterns: previous
				})
			)
			.filter((p): p is Types.InternalPatternAnalysis => typeof p !== 'undefined');
	};
}

export function analyzePatternExport(
	ex: TypeScriptUtils.TypescriptExport,
	ctx: AnalyzeContext
): Types.InternalPatternAnalysis | undefined {
	const reactType = ReactUtils.findReactComponentType(ex.type, { program: ctx.program });

	if (!reactType) {
		return;
	}

	const reactTypeArguments = reactType.getTypeArguments();

	if (reactTypeArguments.length === 0) {
		return;
	}

	const [propTypes] = reactTypeArguments;

	if (!propTypes) {
		return;
	}

	const symbol = propTypes.type.symbol;

	if (!symbol) {
		return;
	}

	if (ctx.knownPatterns.some(p => p.symbol === symbol)) {
		return;
	}

	const exportName = ex.exportName || 'default';

	const contextId = `${ctx.candidate.id}:${exportName}`;
	const id = IdHasher.getGlobalPatternId(contextId);

	if (ex.ignore) {
		return;
	}

	const properties = PropertyAnalyzer.analyze(propTypes.type, {
		program: ctx.program,
		getPropertyId: (propertyContextId: string) =>
			IdHasher.getGlobalPropertyId(id, propertyContextId),
		getEnumOptionId: (enumId, optionContextId) =>
			IdHasher.getGlobalEnumOptionId(enumId, optionContextId)
	});

	const slots = SlotAnalyzer.analyzeSlots(propTypes.type, {
		program: ctx.program,
		project: ctx.project,
		getSlotId: (slotContextId: string) => IdHasher.getGlobalSlotId(id, slotContextId)
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
				defaultValue: undefined,
				example: '',
				hidden: false,
				id: IdHasher.getGlobalSlotId(id, 'children'),
				label: 'children',
				propertyName: 'children',
				required: false,
				type: 'children'
			});
		}
	}

	return {
		symbol,
		path: ctx.candidate.artifactPath,
		libraryName: (ctx.pkg as { name: string }).name,
		pattern: {
			model: Types.ModelName.Pattern,
			contextId,
			description: ex.description ? ex.description : ctx.candidate.description,
			exportName,
			icon: ex.icon,
			group: ex.group,
			id,
			name:
				ex.displayName || (exportName !== 'default' ? exportName : ctx.candidate.displayName),
			propertyIds: properties.map(p => {
				const known = ctx.knownProperties.find(k => k.symbol === p.symbol);
				return known ? known.property.id : p.property.id;
			}),
			slots,
			type: ctx.options.analyzeBuiltins ? ex.patternType : 'pattern'
		},
		properties: properties.filter(p => {
			const unique = !ctx.knownProperties.some(k => k.symbol === p.symbol);
			return unique;
		})
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

export function getSignificantPath(input: string): string[] {
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
