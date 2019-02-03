// tslint:disable:no-bitwise
import * as ReactUtils from '../react-utils';
import * as Types from '@meetalva/types';
import * as Ts from 'typescript';
import * as TypescriptUtils from '../typescript-utils';
import { analyzeSlotDefault } from './slot-default-analyzer';
import * as tsa from 'ts-simple-ast';
import * as Path from 'path';

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

			if (!mayBeChildren && !isImplicitSlot && !isExplicitSlot) {
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

			const defaultCode = TypescriptUtils.getJsDocValueFromSymbol(memberSymbol, 'default');

			const defaultContent =
				isImplicitSlot && defaultCode
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
				example,
				hidden,
				id,
				propertyName,
				required,
				type: propertyName === 'children' && !isExplicitSlot ? 'children' : 'property'
			};
		})
		.filter((slot): slot is Types.SerializedPatternSlot => typeof slot !== 'undefined');
}
