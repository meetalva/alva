// tslint:disable:no-bitwise
import * as Types from '../../../model/types';
import * as ts from 'typescript';
import * as TypescriptUtils from '../../typescript/typescript-utils';
import * as uuid from 'uuid';

export interface PropertyFactoryArgs {
	symbol: ts.Symbol;
	type: ts.Type;
	typechecker: ts.TypeChecker;
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
export function analyze(
	type: ts.Type,
	typechecker: ts.TypeChecker
): Types.SerializedPatternProperty[] {
	const properties: Types.SerializedPatternProperty[] = [];
	const members = type.getApparentProperties();

	members.forEach(memberSymbol => {
		if ((memberSymbol.flags & ts.SymbolFlags.Property) !== ts.SymbolFlags.Property) {
			return;
		}

		const property = analyzeProperty(memberSymbol, typechecker);
		if (property) {
			properties.push(property);
		}
	});

	return properties;
}

/**
 * Analyzes a TypeScript symbol and tries to interpret it as a Alva-supported property.
 * On success, returns a new property instance.
 * @param symbol The TypeScript symbol to analyze (a Props property or subproperty).
 * @param typechecker The type checker used when creating the symbol's type.
 * @return The Alva-supported property or undefined, if the symbol is not supported.
 */
function analyzeProperty(
	symbol: ts.Symbol,
	typechecker: ts.TypeChecker
): Types.SerializedPatternProperty | undefined {
	const declaration = TypescriptUtils.findTypeDeclaration(symbol) as ts.Declaration;

	let type = symbol.type ? symbol.type : declaration && typechecker.getTypeAtLocation(declaration);

	if (!type) {
		return;
	}

	if (type.flags & ts.TypeFlags.Union) {
		type = (type as ts.UnionType).types[0];
	}

	for (const propertyFactory of PROPERTY_FACTORIES) {
		const property: Types.SerializedPatternProperty | undefined = propertyFactory({
			symbol,
			type,
			typechecker
		});
		if (property) {
			setPropertyMetaData(property, symbol);
			return property;
		}
	}

	return;
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

	const arrayType: ts.GenericType = args.type as ts.GenericType;

	if (!arrayType.typeArguments) {
		return;
	}

	const [itemType] = arrayType.typeArguments;

	if ((itemType.flags & ts.TypeFlags.String) === ts.TypeFlags.String) {
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

	if ((itemType.flags & ts.TypeFlags.Number) === ts.TypeFlags.Number) {
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
		(args.type.flags & ts.TypeFlags.BooleanLiteral) === ts.TypeFlags.BooleanLiteral ||
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
	if (args.type.flags & ts.TypeFlags.EnumLiteral) {
		if (!(args.type.symbol && args.type.symbol.flags & ts.SymbolFlags.EnumMember)) {
			return;
		}

		const enumMemberDeclaration = TypescriptUtils.findTypeDeclaration(args.type.symbol);
		if (!enumMemberDeclaration || !enumMemberDeclaration.parent) {
			return;
		}

		const enumDeclaration = enumMemberDeclaration.parent;
		if (!ts.isEnumDeclaration(enumDeclaration)) {
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
					value: String(enumMemberOrdinal)
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
	if ((args.type.flags & ts.TypeFlags.Number) === ts.TypeFlags.Number) {
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
	if ((args.type.flags & ts.TypeFlags.String) === ts.TypeFlags.String) {
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
function getJsDocValue(node: ts.Node, tagName: string): string | undefined {
	const jsDocTags: ReadonlyArray<ts.JSDocTag> | undefined = ts.getJSDocTags(node);
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
function getJsDocValueFromSymbol(symbol: ts.Symbol, tagName: string): string | undefined {
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
	symbol: ts.Symbol
): Types.SerializedPatternProperty {
	property.required = (symbol.flags & ts.SymbolFlags.Optional) !== ts.SymbolFlags.Optional;
	property.label = getJsDocValueFromSymbol(symbol, 'name') || property.label;
	property.defaultValue = getJsDocValueFromSymbol(symbol, 'default') || property.defaultValue;
	return property;
}
