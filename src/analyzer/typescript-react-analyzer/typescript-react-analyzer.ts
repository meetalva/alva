import { createCompiler } from '../../compiler';
import * as Fs from 'fs';
import * as Path from 'path';
import * as PropertyAnalyzer from './property-analyzer';
import * as ReactUtils from '../typescript/react-utils';
import * as SlotAnalyzer from './slot-analzyer';
import * as Types from '../../model/types';
import * as TypeScript from '../typescript';
import * as ts from 'typescript';
import * as TypescriptUtils from '../typescript/typescript-utils';
import * as Util from 'util';
import * as uuid from 'uuid';

const loadPatternplateConfig = require('@patternplate/load-config');
const loadPatternplateMeta = require('@patternplate/load-meta');

export interface PatternCandidate {
	artifactPath: string;
	displayName: string;
	id: string;
	sourcePath: string;
}

interface AnalyzeContext {
	candidate: PatternCandidate;
	program: ts.Program;
}

type PatternAnalyzer = (candidate: PatternCandidate, predicate: PatternAnalyzerPredicate) => Types.PatternAnalysis[];
type PatternAnalyzerPredicate = (ex: TypeScript.TypescriptExport, ctx: AnalyzeContext) => Types.PatternAnalysis | undefined;

export async function analyze(path: string): Promise<Types.LibraryAnalysis> {
	const patternCandidates = await findPatternCandidates(path);
	const sourcePaths = patternCandidates.map(p => p.sourcePath);
	const analyzePattern = getPatternAnalyzer(ts.createProgram(sourcePaths, {}));

	const patterns = patternCandidates
		.reduce((acc, candidate) => [...acc, ...analyzePattern(candidate, analyzePatternExport)], []);

	const compilerPatterns = patterns.map(({path: patternPath, pattern}) => ({
		id: pattern.id,
		path: patternPath
	}));

	const compiler = createCompiler(compilerPatterns, { cwd: path });
	await Util.promisify(compiler.run).bind(compiler)();

	return {
		patterns,
		path,
		bundle: (compiler.outputFileSystem as typeof Fs).readFileSync('/components.js').toString()
	};
}

function getPatternAnalyzer(program: ts.Program): PatternAnalyzer {
	return (candidate: PatternCandidate, predicate: PatternAnalyzerPredicate): Types.PatternAnalysis[] => {
		const sourceFile = program.getSourceFile(candidate.sourcePath);

		if (!sourceFile) {
			return [];
		}

		return TypescriptUtils.getExports(sourceFile, program)
			.map(ex => predicate(ex, { program, candidate }))
			.filter((p): p is Types.PatternAnalysis => typeof p !== 'undefined');
	};
}

function analyzePatternExport(ex: TypeScript.TypescriptExport, ctx: AnalyzeContext): Types.PatternAnalysis | undefined {
	const reactType = ReactUtils.findReactComponentType(
		ctx.program,
		ex.type
	);

	if (!reactType) {
		return;
	}

	const reactTypeArguments = reactType.getTypeArguments();

	if (reactTypeArguments.length === 0) {
		return;
	}

	const [propTypes] = reactTypeArguments;
	const properties = PropertyAnalyzer.analyze(propTypes.type, ctx.program);
	const slots = SlotAnalyzer.analyzeSlots(propTypes.type, ctx.program);

	return {
		path: ctx.candidate.artifactPath,
		pattern: {
			contextId: ctx.candidate.id,
			exportName: ex.name || 'default',
			id: uuid.v4(),
			name: ctx.candidate.displayName,
			propertyIds: properties.map(p => p.id),
			slots,
			type: 'pattern'
		},
		properties
	};
}

async function findPatternCandidates(path: string): Promise<PatternCandidate[]> {
	const patternplateConfig = await loadPatternplateConfig({ cwd: path });
	const { config, filePath } = patternplateConfig;
	const cwd = filePath ? Path.dirname(filePath) : path;

	const {patterns} = await loadPatternplateMeta({ entry: config.entry, cwd });

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
