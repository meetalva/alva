// tslint:disable:no-bitwise
import * as Types from '../../../types';
import { PropertyInit, PropertyAnalyzeContext } from './types';
import * as Ts from 'typescript';
import * as TypescriptUtils from '../../typescript-utils';

export function createEnumProperty(
	args: PropertyInit,
	ctx: PropertyAnalyzeContext
): Types.SerializedPatternEnumProperty | undefined {
	if (typeof args.type.symbol === 'undefined') {
		return;
	}

	const isEnumMember = args.type.symbol.flags & Ts.SymbolFlags.EnumMember;
	const isEnum = args.type.symbol.flags & Ts.SymbolFlags.RegularEnum;

	if (!isEnum && !isEnumMember) {
		return;
	}

	const enumDeclaration = TypescriptUtils.findTypeDeclaration(args.type.symbol, {
		typechecker: args.typechecker
	});

	if (typeof enumDeclaration === 'undefined') {
		return;
	}

	const declaration = isEnum ? enumDeclaration : enumDeclaration.parent;

	if (!Ts.isEnumDeclaration(declaration)) {
		return;
	}

	const enumId = ctx.getPropertyId(args.symbol.name);

	return {
		model: Types.ModelName.PatternProperty,
		contextId: args.symbol.name,
		description: '',
		example: '',
		group: '',
		hidden: false,
		id: enumId,
		inputType: Types.PatternPropertyInputType.Default,
		label: args.symbol.name,
		options: declaration.members.map((enumMember, index) => {
			const optionContextId = enumMember.initializer
				? String(enumMember.initializer.getText())
				: String(index);

			const value =
				optionContextId.charAt(0) === '"'
					? optionContextId.slice(1, -1)
					: parseInt(optionContextId, 10);

			const name =
				TypescriptUtils.getJsDocValueFromNode(enumMember, 'name') || enumMember.name.getText();

			const option: Types.SerializedEnumOption = {
				model: Types.ModelName.PatternEnumPropertyOption,
				contextId: name,
				icon: undefined,
				id: ctx.getEnumOptionId(enumId, name),
				name,
				ordinal: optionContextId,
				value
			};

			return option;
		}),
		propertyName: args.symbol.name,
		required: false,
		type: Types.PatternPropertyType.Enum
	};
}
