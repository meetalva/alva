import * as ReactUtils from '../typescript/react-utils';
import * as Types from '../../model/types';
import * as Ts from 'typescript';
import * as TypescriptUtils from '../typescript/typescript-utils';
import * as uuid from 'uuid';

export function analyzeSlots(type: Ts.Type, program: Ts.Program): Types.SerializedPatternSlot[] {
	const members = type.getApparentProperties();
	const typechecker = program.getTypeChecker();

	return members
		.map(memberSymbol => {
			const declaration = TypescriptUtils.findTypeDeclaration(memberSymbol) as Ts.Declaration;

			const memberType = memberSymbol.type
				? memberSymbol.type
				: declaration && typechecker.getTypeAtLocation(declaration);

			if (!memberType || !ReactUtils.isSlotType(program, memberType)) {
				return;
			}

			return {
				displayName: memberSymbol.getName(),
				id: uuid.v4(),
				propertyName: memberSymbol.getName(),
				type: 'property'
			};
		})
		.filter((slot): slot is Types.SerializedPatternSlot => typeof slot !== 'undefined');
}
