// tslint:disable:no-bitwise
import * as ReactUtils from '../../react-utils';
import * as Types from '../../../types';
import * as Ts from 'typescript';
import * as TypescriptUtils from '../../typescript-utils';
import { PropertyInit, PropertyAnalyzeContext } from './types';
import * as PropertyCreators from './property-creators';

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
			const declaration = TypescriptUtils.findTypeDeclaration(symbol, {
				typechecker
			}) as Ts.Declaration;

			if (!declaration) {
				return;
			}

			if (!Ts.isPropertySignature(declaration) && !Ts.isMethodSignature(declaration)) {
				return;
			}

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
		return PropertyCreators.createEnumProperty(init, ctx);
	}

	if ((init.type.flags & Ts.TypeFlags.String) === Ts.TypeFlags.String) {
		return createStringProperty(init, ctx);
	}

	if ((init.type.flags & Ts.TypeFlags.Number) === Ts.TypeFlags.Number) {
		return createNumberProperty(init, ctx);
	}

	if (ReactUtils.isReactEventHandlerType(init.type, { program: ctx.program })) {
		return createEventHandlerProperty(init, ctx);
	}

	return createUnknownProperty(init, ctx);
}

function createUnknownProperty(
	args: PropertyInit,
	ctx: PropertyAnalyzeContext
): Types.SerializedPatternUnknownProperty {
	const printer = Ts.createPrinter({
		removeComments: true
	});

	const print = (node: Ts.Declaration) => {
		if (!node) {
			return '';
		}

		return printer.printNode(Ts.EmitHint.Unspecified, node, node.getSourceFile());
	};

	return {
		model: Types.ModelName.PatternProperty,
		contextId: args.symbol.name,
		description: '',
		example: '',
		group: '',
		hidden: false,
		id: ctx.getPropertyId(args.symbol.name),
		inputType: Types.PatternPropertyInputType.Default,
		label: args.symbol.name,
		origin: 'user-provided',
		propertyName: args.symbol.name,
		required: false,
		type: Types.PatternPropertyType.Unknown,
		typeText: print(args.symbol.valueDeclaration)
	};
}

function createBooleanProperty(
	args: PropertyInit,
	ctx: PropertyAnalyzeContext
): Types.SerializedPatternBooleanProperty {
	return {
		model: Types.ModelName.PatternProperty,
		contextId: args.symbol.name,
		description: '',
		example: '',
		group: '',
		hidden: false,
		id: ctx.getPropertyId(args.symbol.name),
		inputType: Types.PatternPropertyInputType.Default,
		label: args.symbol.name,
		origin: 'user-provided',
		propertyName: args.symbol.name,
		required: false,
		type: Types.PatternPropertyType.Boolean
	};
}

function createNumberProperty(
	args: PropertyInit,
	ctx: PropertyAnalyzeContext
): Types.SerializedPatternNumberProperty {
	return {
		model: Types.ModelName.PatternProperty,
		contextId: args.symbol.name,
		description: '',
		example: '',
		group: '',
		hidden: false,
		id: ctx.getPropertyId(args.symbol.name),
		inputType: Types.PatternPropertyInputType.Default,
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
	| Types.SerializedPatternHrefProperty
	| Types.SerializedPatternStringProperty {
	if (TypescriptUtils.hasJsDocTagFromSymbol(args.symbol, 'asset')) {
		return {
			model: Types.ModelName.PatternProperty,
			contextId: args.symbol.name,
			description: '',
			example: '',
			group: '',
			hidden: false,
			id: ctx.getPropertyId(args.symbol.name),
			inputType: Types.PatternPropertyInputType.Default,
			label: args.symbol.name,
			origin: 'user-provided',
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.Asset
		};
	}

	if (TypescriptUtils.hasJsDocTagFromSymbol(args.symbol, 'href')) {
		return {
			model: Types.ModelName.PatternProperty,
			contextId: args.symbol.name,
			description: '',
			example: '',
			group: '',
			hidden: false,
			id: ctx.getPropertyId(args.symbol.name),
			inputType: Types.PatternPropertyInputType.Default,
			label: args.symbol.name,
			origin: 'user-provided',
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.Href
		};
	}

	return {
		model: Types.ModelName.PatternProperty,
		contextId: args.symbol.name,
		description: '',
		example: '',
		group: '',
		hidden: false,
		id: ctx.getPropertyId(args.symbol.name),
		inputType: Types.PatternPropertyInputType.Default,
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
	const eventType = ReactUtils.getEventType(args, { typechecker: ctx.program.getTypeChecker() });

	return {
		model: Types.ModelName.PatternProperty,
		contextId: args.symbol.name,
		description: '',
		example: '',
		// TODO: Allow TSDoc override
		event: { type: eventType },
		group: '',
		hidden: false,
		id: ctx.getPropertyId(args.symbol.name),
		inputType: Types.PatternPropertyInputType.Default,
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
	property.group = TypescriptUtils.getJsDocValueFromSymbol(symbol, 'group') || '';

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
