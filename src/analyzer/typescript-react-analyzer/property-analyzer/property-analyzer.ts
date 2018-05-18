// tslint:disable:no-bitwise
import * as ReactUtils from '../../typescript/react-utils';
import * as Types from '../../../model/types';
import * as Ts from 'typescript';
import * as TypescriptUtils from '../../typescript/typescript-utils';
import * as uuid from 'uuid';

export interface PropertyFactoryArgs {
	symbol: Ts.Symbol;
	type: Ts.Type;
	typechecker: Ts.TypeChecker;
}

export type PropertyFactory = (
	args: PropertyFactoryArgs
) => Types.SerializedPatternProperty | undefined;

const PROPERTY_FACTORIES: PropertyFactory[] = [
	createBooleanProperty,
	createEnumProperty,
	createStringProperty,
	createNumberProperty,
	createArrayProperty
];

/**
 * Analyzes a given Props type and returns all Alva-supported properties found.
 * @param type The TypeScript Props type.
 * @param typechecker The type checker used when creating the type.
 * @return The Alva-supported properties.
 */
export function analyze(type: Ts.Type, program: Ts.Program): Types.SerializedPatternProperty[] {
	const typechecker = program.getTypeChecker();

	return type
		.getApparentProperties()
		.map(memberSymbol => {
			if ((memberSymbol.flags & Ts.SymbolFlags.Property) !== Ts.SymbolFlags.Property) {
				return;
			}

			const declaration = TypescriptUtils.findTypeDeclaration(memberSymbol) as Ts.Declaration;

			const memberType = memberSymbol.type
				? memberSymbol.type
				: declaration && typechecker.getTypeAtLocation(declaration);

			if (ReactUtils.isSlotType(program, memberType)) {
				return;
			}

			return analyzeProperty(memberSymbol, typechecker);
		})
		.filter((p): p is Types.SerializedPatternProperty => typeof p !== 'undefined');
}

/**
 * Analyzes a TypeScript symbol and tries to interpret it as a Alva-supported property.
 * On success, returns a new property instance.
 * @param symbol The TypeScript symbol to analyze (a Props property or subproperty).
 * @param typechecker The type checker used when creating the symbol's type.
 * @return The Alva-supported property or undefined, if the symbol is not supported.
 */
function analyzeProperty(
	symbol: Ts.Symbol,
	typechecker: Ts.TypeChecker
): Types.SerializedPatternProperty | undefined {
	const type = getSymbolType(symbol, { typechecker });

	if (!type) {
		return;
	}

	const property = PROPERTY_FACTORIES.reduce((result, propertyFactory) => {
		if (result) {
			return result;
		}

		return propertyFactory({
			symbol,
			type,
			typechecker
		});
	}, undefined);

	if (property) {
		setPropertyMetaData(property, symbol);
	}

	return property;
}

function getSymbolType(
	symbol: Ts.Symbol,
	ctx: { typechecker: Ts.TypeChecker }
): Ts.Type | undefined {
	const declaration = TypescriptUtils.findTypeDeclaration(symbol) as Ts.Declaration;
	const type = symbol.type
		? symbol.type
		: declaration && ctx.typechecker.getTypeAtLocation(declaration);

	if (!type) {
		return;
	}

	if (type.flags & Ts.TypeFlags.Union) {
		return (type as Ts.UnionType).types[0];
	}

	return type;
}

/**
 * Analyzes a TypeScript symbol and tries to interpret it as a array property.
 * On success, returns a new array property instance.
 * @param args The property ID to use, the TypeScript symbol, the TypeScript type, and the type
 * checker.
 * @return The Alva-supported property or undefined, if the symbol is not supported.
 */
function createArrayProperty(
	args: PropertyFactoryArgs
):
	| Types.SerializedPatternNumberArrayProperty
	| Types.SerializedPatternStringArrayProperty
	| undefined {
	if (!args.typechecker.isArrayLikeType(args.type)) {
		return;
	}

	const arrayType: Ts.GenericType = args.type as Ts.GenericType;

	if (!arrayType.typeArguments) {
		return;
	}

	const [itemType] = arrayType.typeArguments;

	if ((itemType.flags & Ts.TypeFlags.String) === Ts.TypeFlags.String) {
		return {
			defaultValue: [],
			hidden: false,
			id: uuid.v4(),
			label: args.symbol.name,
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.StringArray
		};
	}

	if ((itemType.flags & Ts.TypeFlags.Number) === Ts.TypeFlags.Number) {
		return {
			defaultValue: [],
			hidden: false,
			id: uuid.v4(),
			label: args.symbol.name,
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.NumberArray
		};
	}

	return;
}

/**
 * Analyzes a TypeScript symbol and tries to interpret it as a boolean property.
 * On success, returns a new boolean property instance.
 * @param args The property ID to use, the TypeScript symbol, the TypeScript type, and the type
 * checker.
 * @return The Alva-supported property or undefined, if the symbol is not supported.
 */
function createBooleanProperty(
	args: PropertyFactoryArgs
): Types.SerializedPatternBooleanProperty | undefined {
	if (
		(args.type.flags & Ts.TypeFlags.BooleanLiteral) === Ts.TypeFlags.BooleanLiteral ||
		(args.type.symbol && args.type.symbol.name === 'Boolean')
	) {
		return {
			hidden: false,
			id: uuid.v4(),
			label: args.symbol.name,
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.Boolean
		};
	}

	return;
}

/**
 * Analyzes a TypeScript symbol and tries to interpret it as a enum property.
 * On success, returns a new enum property instance.
 * @param args The property ID to use, the TypeScript symbol, the TypeScript type, and the type
 * checker.
 * @return The Alva-supported property or undefined, if the symbol is not supported.
 */
function createEnumProperty(
	args: PropertyFactoryArgs
): Types.SerializedPatternEnumProperty | undefined {
	if (args.type.flags & Ts.TypeFlags.EnumLiteral) {
		if (!(args.type.symbol && args.type.symbol.flags & Ts.SymbolFlags.EnumMember)) {
			return;
		}

		const enumMemberDeclaration = TypescriptUtils.findTypeDeclaration(args.type.symbol);
		if (!enumMemberDeclaration || !enumMemberDeclaration.parent) {
			return;
		}

		const enumDeclaration = enumMemberDeclaration.parent;
		if (!Ts.isEnumDeclaration(enumDeclaration)) {
			return;
		}

		return {
			hidden: false,
			id: uuid.v4(),
			label: args.symbol.name,
			options: enumDeclaration.members.map((enumMember, index) => {
				const enumMemberId = enumMember.name.getText();
				const enumMemberName = getJsDocValue(enumMember, 'name') || enumMemberId;
				const enumMemberOrdinal = enumMember.initializer
					? parseInt(enumMember.initializer.getText(), 10)
					: index;

				return {
					id: uuid.v4(),
					name: enumMemberName,
					ordinal: enumMemberOrdinal,
					value: enumMemberOrdinal
				};
			}),
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.Enum
		};
	}

	return;
}

/**
 * Analyzes a TypeScript symbol and tries to interpret it as a number property.
 * On success, returns a new number property instance.
 * @param args The property ID to use, the TypeScript symbol, the TypeScript type, and the type
 * checker.
 * @return The Alva-supported property or undefined, if the symbol is not supported.
 */
function createNumberProperty(
	args: PropertyFactoryArgs
): Types.SerializedPatternNumberProperty | undefined {
	if ((args.type.flags & Ts.TypeFlags.Number) === Ts.TypeFlags.Number) {
		return {
			hidden: false,
			id: uuid.v4(),
			label: args.symbol.name,
			propertyName: args.symbol.name,
			required: false,
			type: Types.PatternPropertyType.Number
		};
	}

	return;
}

/**
 * Analyzes a TypeScript symbol and tries to interpret it as a object property.
 * On success, returns a new object property instance.
 * @param args The property ID to use, the TypeScript symbol, the TypeScript type, and the type
 * checker.
 * @return The Alva-supported property or undefined, if the symbol is not supported.
 */
/* function createObjectProperty(args: PropertyFactoryArgs): ObjectProperty | undefined {
	if (args.type.flags & ts.TypeFlags.Object) {
		const objectType = args.type as ts.ObjectType;

		if (objectType.objectFlags & ts.ObjectFlags.Interface) {
			const property = new ObjectProperty(args.symbol.name);
			property.setPropertyResolver(() =>
				analyze(args.type, args.typechecker)
			);
			return property;
		}
	}

	return;
} */

/**
 * Analyzes a TypeScript symbol and tries to interpret it as a string property.
 * On success, returns a new string property instance.
 * @param args The property ID to use, the TypeScript symbol, the TypeScript type, and the type
 * checker.
 * @return The Alva-supported property or undefined, if the symbol is not supported.
 */
function createStringProperty(
	args: PropertyFactoryArgs
): Types.SerializedPatternAssetProperty | Types.SerializedStringProperty | undefined {
	if ((args.type.flags & Ts.TypeFlags.String) === Ts.TypeFlags.String) {
		if (getJsDocValueFromSymbol(args.symbol, 'asset') !== undefined) {
			// return new AssetProperty(args.symbol.name);
			return {
				hidden: false,
				id: uuid.v4(),
				label: args.symbol.name,
				propertyName: args.symbol.name,
				required: false,
				type: Types.PatternPropertyType.Asset
			};
		} else {
			return {
				hidden: false,
				id: uuid.v4(),
				label: args.symbol.name,
				propertyName: args.symbol.name,
				required: false,
				type: Types.PatternPropertyType.String
			};
		}
	}

	return;
}

/**
 * Searches a TypeScript AST (syntactic) node for a named JSDoc tag, and returns its value if
 * found. This is used to read Alva declaration annotations.
 * @param node The node to scan.
 * @param tagName The JsDoc tag name, or undefined if the tag has not been found.
 */
function getJsDocValue(node: Ts.Node, tagName: string): string | undefined {
	const jsDocTags: ReadonlyArray<Ts.JSDocTag> | undefined = Ts.getJSDocTags(node);
	let result: string | undefined;
	if (jsDocTags) {
		jsDocTags.forEach(jsDocTag => {
			if (jsDocTag.tagName && jsDocTag.tagName.text === tagName) {
				if (result === undefined) {
					result = '';
				}
				result += ` ${jsDocTag.comment}`;
			}
		});
	}

	return result !== undefined ? result.trim() : undefined;
}

/**
 * Searches a TypeScript type-checker (semantic) symbol for a named JSDoc tag, and returns its
 * value if found. This is used to read Alva declaration annotations.
 * @param node The node to scan.
 * @param tagName The JsDoc tag name, or undefined if the tag has not been found.
 */
function getJsDocValueFromSymbol(symbol: Ts.Symbol, tagName: string): string | undefined {
	const jsDocTags = symbol.getJsDocTags();
	let result: string | undefined;
	if (jsDocTags) {
		jsDocTags.forEach(jsDocTag => {
			if (jsDocTag.name === tagName) {
				if (result === undefined) {
					result = '';
				}
				result += ` ${jsDocTag.text}`;
			}
		});
	}

	return result !== undefined ? result.trim() : undefined;
}

/**
 * Updates a created property from the meta-data found in the declaration file, such as required
 * flag, name-override, and default value.
 * @param property The property to enrich
 * @param symbol The TypeScript symbol of the Props property.
 */
function setPropertyMetaData(
	property: Types.SerializedPatternProperty,
	symbol: Ts.Symbol
): Types.SerializedPatternProperty {
	property.required = (symbol.flags & Ts.SymbolFlags.Optional) !== Ts.SymbolFlags.Optional;
	property.label = getJsDocValueFromSymbol(symbol, 'name') || property.label;
	property.defaultValue = getJsDocValueFromSymbol(symbol, 'default') || property.defaultValue;
	return property;
}
