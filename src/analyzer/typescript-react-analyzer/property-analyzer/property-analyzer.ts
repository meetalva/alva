// tslint:disable:no-bitwise
import * as ReactUtils from '../../react-utils';
import * as Types from '../../../types';
import * as Ts from 'typescript';
import * as TypescriptUtils from '../../typescript-utils';

export interface PropertyAnalyzeContext {
	program: Ts.Program;
	getEnumOptionId(enumId: string, contextId: string): string;
	getPropertyId(contextId: string): string;
}

export interface PropertyInit {
	symbol: Ts.Symbol;
	type: Ts.Type;
	typechecker: Ts.TypeChecker;
}

/**
 * Analyzes a given Props type and returns all Alva-supported properties found.
 * @param type The TypeScript Props type.
 * @param typechecker The type checker used when creating the type.
 * @return The Alva-supported properties.
 */
export function analyze(
	type: Ts.Type,
	ctx: PropertyAnalyzeContext
): Types.SerializedPatternProperty[] {
	const typechecker = ctx.program.getTypeChecker();

	return type
		.getApparentProperties()
		.map(symbol => {
			if ((symbol.flags & Ts.SymbolFlags.Property) !== Ts.SymbolFlags.Property) {
				return;
			}

			const declaration = TypescriptUtils.findTypeDeclaration(symbol, {
				typechecker
			}) as Ts.Declaration;
			const memberType = typechecker.getTypeAtLocation(declaration);

			if (ReactUtils.isReactSlotType(memberType, { program: ctx.program })) {
				return;
			}

			if (symbol.getJsDocTags().some(tag => tag.name === 'slot')) {
				return;
			}

			const symbolType = getSymbolType(symbol, { typechecker });

			if (!symbolType) {
				return;
			}

			const property = createProperty(
				{
					symbol,
					type: symbolType,
					typechecker
				},
				ctx
			);

			return setPropertyMetaData({ property, symbol });
		})
		.filter((p): p is Types.SerializedPatternProperty => typeof p !== 'undefined');
}

function getSymbolType(
	symbol: Ts.Symbol,
	ctx: { typechecker: Ts.TypeChecker }
): Ts.Type | undefined {
	const declaration = TypescriptUtils.findTypeDeclaration(symbol, ctx) as Ts.Declaration;
	const type = ctx.typechecker.getTypeAtLocation(declaration);

	if (!type) {
		return;
	}

	if (type.flags & Ts.TypeFlags.Union) {
		return (type as Ts.UnionType).types[0];
	}

	return type;
}

function createProperty(
	init: PropertyInit,
	ctx: PropertyAnalyzeContext
): Types.SerializedPatternProperty | undefined {
	if ((init.type.flags & Ts.TypeFlags.BooleanLiteral) === Ts.TypeFlags.BooleanLiteral) {
		return createBooleanProperty(init, ctx);
	}

	if ((init.type.flags & Ts.TypeFlags.EnumLiteral) === Ts.TypeFlags.EnumLiteral) {
		return createEnumProperty(init, ctx);
	}

	if ((init.type.flags & Ts.TypeFlags.String) === Ts.TypeFlags.String) {
		return createStringProperty(init, ctx);
	}

	if ((init.type.flags & Ts.TypeFlags.Number) === Ts.TypeFlags.Number) {
		return createNumberProperty(init, ctx);
	}

	if (init.typechecker.isArrayLikeType(init.type)) {
		return createArrayProperty(init, ctx);
	}

	if (ReactUtils.isReactEventHandlerType(init.type, { program: ctx.program })) {
		return createEventHandlerProperty(init, ctx);
	}

	return;
}

function createArrayProperty(
	args: PropertyInit,
	ctx: PropertyAnalyzeContext
):
	| Types.SerializedPatternNumberArrayProperty
	| Types.SerializedPatternStringArrayProperty
	| undefined {
	const arrayType: Ts.GenericType = args.type as Ts.GenericType;

	if (!arrayType.typeArguments) {
		return;
	}

	const [itemType] = arrayType.typeArguments;

	if ((itemType.flags & Ts.TypeFlags.String) === Ts.TypeFlags.String) {
		return {
			contextId: args.symbol.name,
			defaultValue: [],
			description: '',
			example: '',
			hidden: false,
			id: ctx.getPropertyId(args.symbol.name),
			label: args.symbol.name,
			origin: 'user-provided',
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.StringArray
		};
	}

	if ((itemType.flags & Ts.TypeFlags.Number) === Ts.TypeFlags.Number) {
		return {
			contextId: args.symbol.name,
			defaultValue: [],
			description: '',
			example: '',
			hidden: false,
			id: ctx.getPropertyId(args.symbol.name),
			label: args.symbol.name,
			origin: 'user-provided',
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.NumberArray
		};
	}

	return;
}

function createBooleanProperty(
	args: PropertyInit,
	ctx: PropertyAnalyzeContext
): Types.SerializedPatternBooleanProperty | undefined {
	return {
		contextId: args.symbol.name,
		description: '',
		example: '',
		hidden: false,
		id: ctx.getPropertyId(args.symbol.name),
		label: args.symbol.name,
		origin: 'user-provided',
		propertyName: args.symbol.name,
		required: false,
		type: Types.PatternPropertyType.Boolean
	};
}

function createEnumProperty(
	args: PropertyInit,
	ctx: PropertyAnalyzeContext
): Types.SerializedPatternEnumProperty | undefined {
	if (!(args.type.symbol && args.type.symbol.flags & Ts.SymbolFlags.EnumMember)) {
		return;
	}

	const enumMemberDeclaration = TypescriptUtils.findTypeDeclaration(args.type.symbol, {
		typechecker: ctx.program.getTypeChecker()
	});
	if (!enumMemberDeclaration || !enumMemberDeclaration.parent) {
		return;
	}

	const enumDeclaration = enumMemberDeclaration.parent;
	if (!Ts.isEnumDeclaration(enumDeclaration)) {
		return;
	}

	const enumId = ctx.getPropertyId(args.symbol.name);

	return {
		contextId: args.symbol.name,
		description: '',
		example: '',
		hidden: false,
		id: enumId,
		label: args.symbol.name,
		origin: 'user-provided',
		options: enumDeclaration.members.map((enumMember, index) => {
			const init = enumMember.initializer
				? String(enumMember.initializer.getText())
				: String(index);

			const value = init.charAt(0) === '"' ? init.slice(1, -1) : parseInt(init, 10);

			const name =
				TypescriptUtils.getJsDocValueFromNode(enumMember, 'name') || enumMember.name.getText();

			return {
				contextId: init,
				id: ctx.getEnumOptionId(enumId, name),
				name,
				ordinal: init,
				value
			};
		}),
		propertyName: args.symbol.name,
		required: false,
		type: Types.PatternPropertyType.Enum
	};
}

function createNumberProperty(
	args: PropertyInit,
	ctx: PropertyAnalyzeContext
): Types.SerializedPatternNumberProperty {
	return {
		contextId: args.symbol.name,
		description: '',
		example: '',
		hidden: false,
		id: ctx.getPropertyId(args.symbol.name),
		label: args.symbol.name,
		origin: 'user-provided',
		propertyName: args.symbol.name,
		required: false,
		type: Types.PatternPropertyType.Number
	};
}

function createStringProperty(
	args: PropertyInit,
	ctx: PropertyAnalyzeContext
):
	| Types.SerializedPatternAssetProperty
	| Types.SerializedHrefProperty
	| Types.SerializedStringProperty {
	if (TypescriptUtils.hasJsDocTagFromSymbol(args.symbol, 'asset')) {
		return {
			contextId: args.symbol.name,
			description: '',
			example: '',
			hidden: false,
			id: ctx.getPropertyId(args.symbol.name),
			label: args.symbol.name,
			origin: 'user-provided',
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.Asset
		};
	}

	if (TypescriptUtils.hasJsDocTagFromSymbol(args.symbol, 'href')) {
		return {
			contextId: args.symbol.name,
			description: '',
			example: '',
			hidden: false,
			id: ctx.getPropertyId(args.symbol.name),
			label: args.symbol.name,
			origin: 'user-provided',
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.Href
		};
	}

	return {
		contextId: args.symbol.name,
		description: '',
		example: '',
		hidden: false,
		id: ctx.getPropertyId(args.symbol.name),
		label: args.symbol.name,
		origin: 'user-provided',
		propertyName: args.symbol.name,
		required: false,
		type: Types.PatternPropertyType.String
	};
}

function createEventHandlerProperty(
	args: PropertyInit,
	ctx: PropertyAnalyzeContext
): Types.SerializedPatternEventHandlerProperty {
	return {
		contextId: args.symbol.name,
		description: '',
		example: '',
		// TODO: Determine event type from static information, allow TSDoc override
		event: { type: 'MouseEvent' },
		hidden: false,
		id: ctx.getPropertyId(args.symbol.name),
		label: args.symbol.name,
		origin: 'user-provided',
		propertyName: args.symbol.name,
		required: false,
		type: Types.PatternPropertyType.EventHandler
	};
}

function setPropertyMetaData(init: {
	property?: Types.SerializedPatternProperty;
	symbol?: Ts.Symbol;
}): Types.SerializedPatternProperty | undefined {
	if (!init.property || !init.symbol) {
		return;
	}

	const { property, symbol } = init;

	property.example = TypescriptUtils.getJsDocValueFromSymbol(symbol, 'example') || '';
	property.required = (symbol.flags & Ts.SymbolFlags.Optional) !== Ts.SymbolFlags.Optional;
	property.label = TypescriptUtils.getJsDocValueFromSymbol(symbol, 'name') || property.label;
	property.description = TypescriptUtils.getJsDocValueFromSymbol(symbol, 'description') || '';
	property.hidden = TypescriptUtils.hasJsDocTagFromSymbol(symbol, 'ignore');

	switch (property.type) {
		case 'enum':
			const defaultOption = property.options.find(
				option => option.name === TypescriptUtils.getJsDocValueFromSymbol(symbol, 'default')
			);
			property.defaultOptionId = defaultOption ? defaultOption.id : undefined;
			break;
		case 'EventHandler':
			break;
		default:
			const defaultValue =
				TypescriptUtils.getJsDocValueFromSymbol(symbol, 'default') || property.defaultValue;
			property.defaultValue = defaultValue;
	}

	return property;
}
