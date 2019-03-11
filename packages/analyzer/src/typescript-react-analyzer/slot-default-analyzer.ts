import * as Path from 'path';
import * as tsa from 'ts-simple-ast';
import { analyzePatternExport, getSignificantPath } from './typescript-react-analyzer';
import { getExports, TypeScriptType } from '../typescript-utils';
import { last } from 'lodash';
import { InternalPatternAnalysis, ElementCandidate } from '@meetalva/types';
import { findReactComponentType } from '../react-utils';

const findPkg = require('find-pkg');

export interface SlotDefaultContext {
	project: tsa.Project;
	id: string;
	path: string;
	pkg: unknown;
}

export function analyzeSlotDefault(
	code: string,
	{ project, path, pkg, id }: SlotDefaultContext
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

	return candidateFromJSXElement(element, { project, id, pkg });
}

function candidateFromJSXElement(
	element: tsa.JsxChild,
	{ project, id, pkg }: { project: tsa.Project; id: string; pkg: unknown }
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
	const sourceFile = tsaFile.compilerNode;

	const analysedExports = getExports(sourceFile, project.getProgram().compilerObject)
		.map(ex => {
			const pkgPath = findPkg.sync(ex.filePath);
			const significantPath = getSignificantPath(Path.relative(pkgPath, ex.filePath));
			const dName = last(significantPath);

			return analyzePatternExport(ex, {
				candidate: {
					artifactPath: '',
					declarationPath: tsaFile.getFilePath(),
					description: '',
					displayName: dName ? Path.basename(dName, Path.extname(dName)) : 'Unknown Pattern',
					id: significantPath.join('/'),
					sourcePath: Path.dirname(ex.filePath)
				},
				knownPatterns: [],
				knownProperties: [],
				program,
				project,
				pkg,
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

	const children = getChildrenCandidates(element, { project, pkg, id });

	return {
		parent: id,
		id: [id, 'default'].join(':'),
		libraryId: (pkg as { name: string }).name,
		patternContextId: analysis.pattern.contextId,
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
	{ project, pkg, id }: { project: tsa.Project; pkg: unknown; id: string }
): ElementCandidate[] {
	if (tsa.TypeGuards.isJsxElement(element)) {
		return element
			.getJsxChildren()
			.map(child => candidateFromJSXElement(child, { project, pkg, id }))
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
