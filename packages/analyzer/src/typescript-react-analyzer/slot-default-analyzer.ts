import * as Path from 'path';
import * as tsa from 'ts-simple-ast';
import { TypeScriptType } from '../typescript-utils';
import { ElementCandidate } from '@meetalva/types';
import { findReactComponentType } from '../react-utils';
import { flatMap } from 'lodash';

const findPkg = require('find-pkg');
const readPkg = require('read-pkg');

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
	if (tsa.TypeGuards.isJsxFragment(element)) {
		return {
			parent: id,
			id: [id, 'default'].join(':'),
			libraryId: '',
			patternContextId: '',
			props: [],
			slotContent: [],
			jsxFragment: true,
			children: getChildrenCandidates(element, { project, id })
		};
	}

	const nameElement = getNameElement(element);

	if (!nameElement) {
		return;
	}

	const tagNameNode = nameElement.getTagNameNode();
	const tagNameIdentifier = getNameIdentifier(tagNameNode);

	if (!tagNameIdentifier) {
		return;
	}

	const definition = tagNameIdentifier.getDefinitionNodes()[0];
	const exportable = getExportableNode(definition);

	if (!definition || !exportable) {
		return;
	}

	const exportableNode = (exportable as unknown) as tsa.Node<tsa.ts.Node>;

	if (
		!tsa.TypeGuards.isVariableStatement(exportableNode) &&
		!tsa.TypeGuards.isClassDeclaration(exportableNode) &&
		!tsa.TypeGuards.isFunctionDeclaration(exportableNode)
	) {
		return;
	}

	const program = project.getProgram().compilerObject;
	const filePath = exportableNode.getSourceFile().getFilePath();
	const pkgPath = findPkg.sync(Path.dirname(filePath));
	const pkg = readPkg.sync({ cwd: Path.dirname(pkgPath) });

	const patternContextBase = Path.relative(
		Path.dirname(pkgPath),
		exportableNode.getSourceFile().getFilePath()
	);

	const exportSpecifier = getExportSpecifier(definition);

	const symbolType = (exportableNode as any).getDeclarations
		? (exportableNode as any).getDeclarations()[0].getType()
		: exportableNode.getType();

	const reactType = findReactComponentType(
		new TypeScriptType(symbolType.compilerType, project.getTypeChecker().compilerObject),
		{ program }
	);

	if (!reactType) {
		return;
	}

	const children = getChildrenCandidates(element, { project, id });

	const props = nameElement
		.getAttributes()
		.filter(tsa.TypeGuards.isJsxAttribute)
		.map(attribute => ({
			propName: attribute.getName(),
			value: getInitValue(attribute.getInitializer(), { project, id })
		}));

	const slotContent = nameElement
		.getAttributes()
		.filter(tsa.TypeGuards.isJsxAttribute)
		.map(attribute => ({
			slotName: attribute.getName(),
			value: getInitValue(attribute.getInitializer(), { project, id })
		}));

	return {
		parent: id,
		id: [id, 'default'].join(':'),
		libraryId: pkg.name,
		patternContextId: [patternContextBase, exportSpecifier].join(':'),
		jsxFragment: false,
		props,
		slotContent,
		children
	};
}

function getChildrenCandidates(
	element: tsa.JsxChild,
	{ project, id }: { project: tsa.Project; id: string }
): ElementCandidate[] {
	if (tsa.TypeGuards.isJsxElement(element) || tsa.TypeGuards.isJsxFragment(element)) {
		return element
			.getJsxChildren()
			.map(child => candidateFromJSXElement(child, { project, id }))
			.filter((candidate): candidate is ElementCandidate => typeof candidate !== 'undefined');
	}

	return [];
}

function getInitValue(
	init: tsa.StringLiteral | tsa.JsxExpression | tsa.Expression | undefined,
	{ project, id }: { project: tsa.Project; id: string }
): unknown {
	if (typeof init === 'undefined') {
		return;
	}

	if (tsa.TypeGuards.isLiteralExpression(init)) {
		return init.getLiteralValue();
	}

	if (isElement(init)) {
		const element = getElement(init);

		if (element) {
			return candidateFromJSXElement(element, { id, project });
		}
	}

	if (tsa.TypeGuards.isJsxExpression(init)) {
		const exp = init.getExpression();
		return getInitValue(exp, { id, project });
	}

	// TODO: Propagate error/warning to user for non-literal attributes
	return;
}

export function isElement(element: tsa.Node): boolean {
	if (
		tsa.TypeGuards.isJsxOpeningElement(element) ||
		tsa.TypeGuards.isJsxSelfClosingElement(element)
	) {
		return true;
	}
	return false;
}

export function getElement(
	jsx: tsa.Node
): tsa.JsxElement | tsa.JsxSelfClosingElement | tsa.JsxFragment | undefined {
	if (
		tsa.TypeGuards.isJsxElement(jsx) ||
		tsa.TypeGuards.isJsxSelfClosingElement(jsx) ||
		tsa.TypeGuards.isJsxFragment(jsx)
	) {
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

export function getExportSpecifier(definition: tsa.Node<tsa.ts.Node>): string | undefined {
	const exportable = getExportableNode(definition);

	if (!exportable) {
		return;
	}

	if (exportable.isDefaultExport()) {
		return 'default';
	}

	const node = (exportable as unknown) as tsa.Node<tsa.ts.Node>;

	if (tsa.TypeGuards.isVariableStatement(node)) {
		return node.getDeclarations()![0].getName();
	}

	if (tsa.TypeGuards.isClassDeclaration(node) || tsa.TypeGuards.isFunctionDeclaration(node)) {
		return node.getName();
	}
}

function getNameIdentifier(tagNameNode: tsa.JsxTagNameExpression): tsa.Identifier | undefined {
	if (tsa.TypeGuards.isIdentifier(tagNameNode)) {
		return tagNameNode;
	}

	if (tsa.TypeGuards.isPropertyAccessExpression(tagNameNode)) {
		return tagNameNode.getNameNode();
	}
}

function getExportableNode(definition?: tsa.Node<tsa.ts.Node>): tsa.ExportableNode | undefined {
	if (!definition || tsa.TypeGuards.isSourceFile(definition)) {
		return;
	}

	if (
		tsa.TypeGuards.isImportSpecifier(definition) ||
		tsa.TypeGuards.isExportSpecifier(definition)
	) {
		const decl = tsa.TypeGuards.isImportSpecifier(definition)
			? definition.getImportDeclaration()
			: definition.getExportDeclaration();

		const sourceFile = decl.getModuleSpecifierSourceFile();

		if (sourceFile) {
			const namedExportSpecifiers = flatMap(
				sourceFile.getExportDeclarations().map(d => d.getNamedExports())
			);

			const matchingExportSpecifier = namedExportSpecifiers.find(ne => {
				const aliasNode = ne.getAliasNode();

				if (aliasNode) {
					return aliasNode.getText() === definition.getName();
				}

				return ne.getName() === definition.getName();
			});

			if (matchingExportSpecifier) {
				return getExportableNode(matchingExportSpecifier);
			}

			const exportedSymbols = sourceFile.getExportSymbols().map(d => d.getDeclarations()[0]);

			const matchingExportedSymbol = exportedSymbols.find(s => {
				if (tsa.TypeGuards.isVariableDeclaration(s)) {
					return s.getName() === definition.getName();
				}

				return false;
			});

			if (matchingExportedSymbol) {
				return getExportableNode(matchingExportedSymbol);
			}
		}
	}

	if (tsa.TypeGuards.isExportSpecifier(definition)) {
		const localTarget = definition.getLocalTargetDeclarations()[0];

		if (localTarget) {
			return getExportableNode(localTarget);
		} else {
			const sourceFile = definition.getSourceFile();
			const namedImportSpecifiers = flatMap(
				sourceFile.getImportDeclarations().map(d => d.getNamedImports())
			);

			const matchingImportSpecifier = namedImportSpecifiers.find(ni => {
				const aliasNode = ni.getAliasNode();

				if (aliasNode) {
					return aliasNode.getText() === definition.getName();
				}

				return ni.getName() === definition.getName();
			});

			if (matchingImportSpecifier) {
				return getExportableNode(matchingImportSpecifier);
			}
		}
	}

	if (tsa.TypeGuards.isExportableNode(definition) && definition.isExported()) {
		return definition;
	}

	return getExportableNode(definition.getParent());
}
