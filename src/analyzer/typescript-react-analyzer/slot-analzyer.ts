import * as ReactUtils from '../typescript/react-utils';
import * as Types from '../../model/types';
import * as Ts from 'typescript';
import * as TypescriptUtils from '../typescript/typescript-utils';

export interface SlotAnalyzeContext {
	program: Ts.Program;
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
			const memberType = typechecker.getTypeAtLocation(declaration as Ts.Declaration);

			if (!memberType || !ReactUtils.isSlotType(ctx.program, memberType)) {
				return;
			}

			return {
				contextId: memberSymbol.getName(),
				displayName: memberSymbol.getName(),
				id: ctx.getSlotId(memberSymbol.getName()),
				propertyName: memberSymbol.getName(),
				type: memberSymbol.getName() === 'children' ? 'children' : 'property'
			};
		})
		.filter((slot): slot is Types.SerializedPatternSlot => typeof slot !== 'undefined');
}
