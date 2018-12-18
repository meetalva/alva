import * as TypeScript from 'typescript';

export function getJsDocValueFromNode(node: TypeScript.Node, tagName: string): string | undefined {
	const jsdocTag = (TypeScript.getJSDocTags(node) || []).find(
		tag => tag.tagName && tag.tagName.text === tagName
	);
	return jsdocTag ? (jsdocTag.comment || '').trim() : undefined;
}

export function getJsDocValueFromSymbol(
	symbol: TypeScript.Symbol,
	tagName: string
): string | undefined {
	const jsdocTag = symbol.getJsDocTags().find(tag => tag.name === tagName);
	return jsdocTag ? (jsdocTag.text || '').trim() : undefined;
}

export function hasJsDocTagFromSymbol(symbol: TypeScript.Symbol, tagName: string): boolean {
	return symbol.getJsDocTags().some(tag => tag.name === tagName);
}
