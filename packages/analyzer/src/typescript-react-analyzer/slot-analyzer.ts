// tslint:disable:no-bitwise
import * as ReactUtils from '../react-utils';
import * as Types from '@meetalva/types';
import * as Ts from 'typescript';
import * as TypescriptUtils from '../typescript-utils';
import { analyzeSlotDefault } from './slot-default-analyzer';
import * as tsa from 'ts-simple-ast';
import * as Path from 'path';

const extractComments = require('extract-comments');

export interface SlotAnalyzeContext {
	program: Ts.Program;
	project: tsa.Project;
	getSlotId(contextId: string): string;
}

export function analyzeSlots(
	type: Ts.Type,
	ctx: SlotAnalyzeContext
): Types.SerializedPatternSlot[] {
	const typechecker = ctx.program.getTypeChecker();

	return type
		.getApparentProperties()
		.map(memberSymbol => {
			const declaration = TypescriptUtils.findTypeDeclaration(memberSymbol, {
				typechecker: ctx.program.getTypeChecker()
			});

			if (!declaration) {
				return;
			}

			const memberDeclarations = memberSymbol.getDeclarations();
			const memberDeclaration = memberDeclarations ? memberDeclarations[0] : undefined;
			const path = memberDeclaration ? memberDeclaration.getSourceFile().fileName : undefined;
			const memberType = typechecker.getTypeAtLocation(declaration as Ts.Declaration);

			const mayBeChildren =
				memberSymbol.name === 'children' &&
				(memberType.flags & Ts.TypeFlags.Any) === Ts.TypeFlags.Any;

			const isImplicitSlot =
				memberType && ReactUtils.isReactSlotType(memberType, { program: ctx.program });

			const isExplicitSlot = memberSymbol.getJsDocTags().some(tag => tag.name === 'slot');
			const isSlot = isImplicitSlot || isExplicitSlot;

			if (!mayBeChildren && !isSlot) {
				return;
			}

			const propertyName = memberSymbol.getName();
			const label = TypescriptUtils.getJsDocValueFromSymbol(memberSymbol, 'name');
			const example = TypescriptUtils.getJsDocValueFromSymbol(memberSymbol, 'example') || '';
			const required =
				(memberSymbol.flags & Ts.SymbolFlags.Optional) !== Ts.SymbolFlags.Optional;
			const description =
				TypescriptUtils.getJsDocValueFromSymbol(memberSymbol, 'description') || '';
			const hidden = TypescriptUtils.hasJsDocTagFromSymbol(memberSymbol, 'ignore');

			const id = ctx.getSlotId(propertyName);
			/**
			 * Instead of reading from the @default tag we parse the comments ourselves
			 * We introduce this to avoid two TSDoc bugs:
			 * - code blocks in backticks contain the leading asterisk signs of the surroundig comment
			 * - code blocks in tilde do not escape the at sign. Causing cropped blocks for code with e.g. scoped imports (e.g.: @meetalva/essentials)
			 **/
			const comment = getCommentValue(declaration);
			const defaultCode = getDefaultCode(comment);

			const defaultValue =
				isSlot && defaultCode
					? analyzeSlotDefault(defaultCode, {
							id,
							project: ctx.project,
							path: path
								? Path.dirname(path)
								: ctx.project.getRootDirectories()[0]!.getPath()
					  })
					: undefined;

			return {
				contextId: propertyName,
				label: label || propertyName,
				description,
				defaultValue,
				example,
				hidden,
				id,
				propertyName,
				required,
				quantity:
					ReactUtils.getReactSlotType(memberType, { program: ctx.program }) || 'multiple',
				type: propertyName === 'children' && !isExplicitSlot ? 'children' : 'property'
			};
		})
		.filter((slot): slot is Types.SerializedPatternSlot => typeof slot !== 'undefined');
}

export function getCommentValue(declaration: Ts.Declaration): string | undefined {
	const jsDoc = (declaration as any).jsDoc ? (declaration as any).jsDoc[0] : undefined;
	const comments = extractComments(jsDoc ? jsDoc.getFullText() : '');
	const comment = comments[0];
	return comment ? comment.value : undefined;
}

const remark = require('remark');
const select = require('unist-util-select');
const mdProcessor = remark().use(() => (tree: any, file: any) => {
	const blocks = select.selectAll('paragraph:has(text[value="@default"]) + code', tree);
	const block = blocks[blocks.length - 1] || { value: undefined };
	file.data.defaultCode = block.value;
	return tree;
});

export function getDefaultCode(input: string | undefined): string | undefined {
	if (typeof input === 'undefined') {
		return;
	}

	const processedFile = mdProcessor.processSync(input);

	return processedFile.data.defaultCode;
}
