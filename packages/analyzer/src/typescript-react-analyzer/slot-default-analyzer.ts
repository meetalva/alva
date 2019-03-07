import * as Path from 'path';
import * as tsa from 'ts-simple-ast';
import { analyzePatternExport, getSignificantPath } from './typescript-react-analyzer';
import { getExports, TypeScriptType } from '../typescript-utils';
import { last } from 'lodash';
import { InternalPatternAnalysis } from '@meetalva/types';
import { findReactComponentType } from '../react-utils';

export interface ElementCandidate {
	parent: string;
	patternContextId: string;
	libraryId: string;
	id: string;
	props: ElementProp[];
	children: ElementCandidate[];
}

export interface ElementProp {
	propName: string;
	value: any;
}

export interface SlotDefaultContext {
	project: tsa.Project;
	id: string;
	path: string;
}

export function analyzeSlotDefault(
	code: string,
	{ project, path, id }: SlotDefaultContext
): ElementCandidate | undefined {
	const file = project.createSourceFile(Path.join(path, `${id}.tsx`), code, { overwrite: true });
	const defaultExport = file.getDefaultExportSymbol();

	if (!defaultExport) {
		return;
	}

	const assignment = defaultExport.getValueDeclaration();

	if (!assignment || !tsa.TypeGuards.isExportAssignment(assignment)) {
		return;
	}

	const fn = assignment.getExpression();

	if (!tsa.TypeGuards.isArrowFunction(fn)) {
		return;
	}

	const jsx = fn.getBody();

	if (!tsa.TypeGuards.isJsxElement(jsx) && !tsa.TypeGuards.isJsxSelfClosingElement(jsx)) {
		return;
	}

	const element = tsa.TypeGuards.isJsxSelfClosingElement(jsx) ? jsx : jsx.getOpeningElement();

	const tagNameNode = element.getTagNameNode();

	if (!tsa.TypeGuards.isIdentifier(tagNameNode)) {
		return;
	}

	const definition = tagNameNode.getDefinitionNodes()[0];

	if (!definition) {
		return;
	}

	const symbol = definition.getSymbol();

	if (!symbol) {
		return;
	}

	const program = project.getProgram().compilerObject;

	const symbolType = definition.getType();
	const typeChecker = project.getTypeChecker().compilerObject;
	const boxedSymbolType = new TypeScriptType(symbolType.compilerType, typeChecker);

	const reactType = findReactComponentType(boxedSymbolType, {
		program
	});

	if (!reactType) {
		return;
	}

	const propType = reactType.getTypeArguments()[0];

	if (!propType) {
		return;
	}

	const tsaFile = definition.getSourceFile();
	const declarationPath = tsaFile.getFilePath();
	const cwd = project.getFileSystem().getCurrentDirectory();
	const sourceFile = tsaFile.compilerNode;

	const analysedExports = getExports(sourceFile, project.getProgram().compilerObject)
		.map(ex => {
			const significantPath = getSignificantPath(Path.relative(cwd, declarationPath));
			const dName = last(significantPath);

			return analyzePatternExport(ex, {
				candidate: {
					artifactPath: '',
					declarationPath: tsaFile.getFilePath(),
					description: '',
					displayName: dName ? Path.basename(dName, Path.extname(dName)) : 'Unknown Pattern',
					id: significantPath.join('/'),
					sourcePath: Path.dirname(declarationPath)
				},
				knownPatterns: [],
				knownProperties: [],
				program,
				project,
				options: {
					analyzeBuiltins: false
				}
			});
		})
		.filter((a): a is InternalPatternAnalysis => typeof a !== 'undefined');

	const analysis = analysedExports.find(a => a.symbol === propType.type.symbol);

	if (!analysis) {
		return;
	}

	const fragments = analysis.pattern.contextId.split('node_modules');
	const pkgNameAndPath = fragments[fragments.length - 1];
	const pkgFragments = pkgNameAndPath.split('/').filter(Boolean);
	const libraryId = pkgNameAndPath.startsWith('/@')
		? pkgFragments.slice(0, 2)
		: pkgFragments.slice(0, 1);

	return {
		parent: id,
		id: [id, 'default'].join(':'),
		libraryId: libraryId.join('/'),
		patternContextId: analysis.pattern.contextId,
		props: element
			.getAttributes()
			.filter(tsa.TypeGuards.isJsxAttribute)
			.map(attribute => {
				const init = attribute.getInitializer();
				return {
					propName: attribute.getName(),
					value: init ? init.getText() : 'true'
				};
			}),
		children: []
	};
}
