import * as Path from 'path';
import * as tsa from 'ts-simple-ast';
import { analyzePatternExport, getSignificantPath } from './typescript-react-analyzer';
import { getExports, TypeScriptType } from '../typescript-utils';
import { last } from 'lodash';
import { InternalPatternAnalysis, ElementCandidate } from '@meetalva/types';
import { findReactComponentType } from '../react-utils';

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
	const element = getElement(jsx);

	if (!element) {
		return;
	}

	return candidateFromJSXElement(element, { project, id });
}

function candidateFromJSXElement(
	element: tsa.JsxChild,
	{ project, id }: { project: tsa.Project; id: string }
): ElementCandidate | undefined {
	const nameElement = getNameElement(element);

	if (!nameElement) {
		return;
	}

	const tagNameNode = nameElement.getTagNameNode();

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

	const contextIdFragments = analysis.pattern.contextId.split(libraryId.join('/'));
	const patternContextId =
		contextIdFragments.length > 1 ? contextIdFragments[1].slice(1) : contextIdFragments[0];

	const children = getChildrenCandidates(element, { project, id });

	return {
		parent: id,
		id: [id, 'default'].join(':'),
		libraryId: libraryId.join('/'),
		patternContextId,
		props: nameElement
			.getAttributes()
			.filter(tsa.TypeGuards.isJsxAttribute)
			.map(attribute => ({
				propName: attribute.getName(),
				value: getInitValue(attribute.getInitializer())
			})),
		children
	};
}

function getChildrenCandidates(
	element: tsa.JsxChild,
	{ project, id }: { project: tsa.Project; id: string }
): ElementCandidate[] {
	if (tsa.TypeGuards.isJsxElement(element)) {
		return element
			.getJsxChildren()
			.map(child => candidateFromJSXElement(child, { project, id }))
			.filter((candidate): candidate is ElementCandidate => typeof candidate !== 'undefined');
	}

	return [];
}

function getInitValue(
	init?: tsa.StringLiteral | tsa.JsxExpression | tsa.Expression | undefined
): unknown {
	if (typeof init === 'undefined') {
		return;
	}

	if (tsa.TypeGuards.isLiteralExpression(init)) {
		return init.getLiteralValue();
	}

	if (tsa.TypeGuards.isJsxExpression(init)) {
		const exp = init.getExpression();
		return getInitValue(exp);
	}

	// TODO: Propagate error/warning to user for non-literal attributes
	return;
}

export function getElement(jsx: tsa.Node): tsa.JsxElement | tsa.JsxSelfClosingElement | undefined {
	if (tsa.TypeGuards.isJsxElement(jsx) || tsa.TypeGuards.isJsxSelfClosingElement(jsx)) {
		return jsx;
	}

	if (tsa.TypeGuards.isParenthesizedExpression(jsx)) {
		return getElement(jsx.getExpression());
	}
}

export function getNameElement(
	jsx: tsa.JsxChild
): tsa.JsxOpeningElement | tsa.JsxSelfClosingElement | undefined {
	if (tsa.TypeGuards.isJsxElement(jsx)) {
		return jsx.getOpeningElement();
	}

	if (tsa.TypeGuards.isJsxSelfClosingElement(jsx)) {
		return jsx;
	}
}
