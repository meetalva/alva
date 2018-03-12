// tslint:disable:no-bitwise

import { Property } from '../../store/styleguide/property/property';
import * as ts from 'typescript';

import { BooleanProperty } from '../../store/styleguide/property/boolean-property';
import { EnumProperty, Option } from '../../store/styleguide/property/enum-property';
import { NumberArrayProperty } from '../../store/styleguide/property/number-array-property';
import { NumberProperty } from '../../store/styleguide/property/number-property';
import { ObjectProperty } from '../../store/styleguide/property/object-property';
import { StringArrayProperty } from '../../store/styleguide/property/string-array-property';
import { StringProperty } from '../../store/styleguide/property/string-property';

interface PropertyFactoryArgs {
	id: string;
	symbol: ts.Symbol;
	type: ts.Type;
	typechecker: ts.TypeChecker;
}

type PropertyFactory = (args: PropertyFactoryArgs) => Property | undefined;

/**
 * A utility to analyze the Props types of components (like React components) and to map them to
 * Alva supported pattern properties.
 */
export class PropertyAnalyzer {
	/**
	 * Analyzes a given Props type and returns all Alva-supported properties found.
	 * @param type The TypeScript Props type.
	 * @param typechecker The type checker used when creating the type.
	 * @return The Alva-supported properties.
	 */
	public static analyze(type: ts.Type, typechecker: ts.TypeChecker): Property[] {
		const properties: Property[] = [];
		const members = type.getApparentProperties();

		members.forEach(memberSymbol => {
			if ((memberSymbol.flags & ts.SymbolFlags.Property) !== ts.SymbolFlags.Property) {
				return;
			}

			const property = this.analyzeProperty(memberSymbol, typechecker);
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
	protected static analyzeProperty(
		symbol: ts.Symbol,
		typechecker: ts.TypeChecker
	): Property | undefined {
		const declaration = this.findTypeDeclaration(symbol) as ts.Declaration;

		let type = symbol.type
			? symbol.type
			: declaration && typechecker.getTypeAtLocation(declaration);

		if (!type) {
			return;
		}

		if (type.flags & ts.TypeFlags.Union) {
			type = (type as ts.UnionType).types[0];
		}

		const PROPERTY_FACTORIES: PropertyFactory[] = [
			this.createBooleanProperty,
			this.createEnumProperty,
			this.createStringProperty,
			this.createNumberProperty,
			this.createArrayProperty,
			this.createObjectProperty
		];

		for (const propertyFactory of PROPERTY_FACTORIES) {
			const property: Property | undefined = propertyFactory({
				id: symbol.name,
				symbol,
				type,
				typechecker
			});

			if (property) {
				this.setPropertyMetaData(property, symbol);
				return property;
			}
		}

		return undefined;
	}

	/**
	 * Analyzes a TypeScript symbol and tries to interpret it as a array property.
	 * On success, returns a new array property instance.
	 * @param args The property ID to use, the TypeScript symbol, the TypeScript type, and the type
	 * checker.
	 * @return The Alva-supported property or undefined, if the symbol is not supported.
	 */
	private static createArrayProperty(args: PropertyFactoryArgs): Property | undefined {
		if (args.typechecker.isArrayLikeType(args.type)) {
			const arrayType: ts.GenericType = args.type as ts.GenericType;

			if (!arrayType.typeArguments) {
				return;
			}

			const itemType = arrayType.typeArguments[0];

			if ((itemType.flags & ts.TypeFlags.String) === ts.TypeFlags.String) {
				const property = new StringArrayProperty(args.id);
				return property;
			}

			if ((itemType.flags & ts.TypeFlags.Number) === ts.TypeFlags.Number) {
				const property = new NumberArrayProperty(args.id);
				return property;
			}
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
	private static createBooleanProperty(args: PropertyFactoryArgs): BooleanProperty | undefined {
		if (
			(args.type.flags & ts.TypeFlags.BooleanLiteral) === ts.TypeFlags.BooleanLiteral ||
			(args.type.symbol && args.type.symbol.name === 'Boolean')
		) {
			return new BooleanProperty(args.id);
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
	private static createEnumProperty(args: PropertyFactoryArgs): EnumProperty | undefined {
		if (args.type.flags & ts.TypeFlags.EnumLiteral) {
			if (!(args.type.symbol && args.type.symbol.flags & ts.SymbolFlags.EnumMember)) {
				return;
			}

			const enumMemberDeclaration = PropertyAnalyzer.findTypeDeclaration(args.type.symbol);
			if (!enumMemberDeclaration || !enumMemberDeclaration.parent) {
				return;
			}

			const enumDeclaration = enumMemberDeclaration.parent;
			if (!ts.isEnumDeclaration(enumDeclaration)) {
				return;
			}

			const options: Option[] = enumDeclaration.members.map((enumMember, index) => {
				const enumMemberId = enumMember.name.getText();
				let enumMemberName = PropertyAnalyzer.getJsDocValue(enumMember, 'name');
				if (enumMemberName === undefined) {
					enumMemberName = enumMemberId;
				}
				const enumMemberOrdinal: number = enumMember.initializer
					? parseInt(enumMember.initializer.getText(), 10)
					: index;

				return new Option(enumMemberId, enumMemberName, enumMemberOrdinal);
			});

			const property = new EnumProperty(args.id);
			property.setOptions(options);
			return property;
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
	private static createNumberProperty(args: PropertyFactoryArgs): NumberProperty | undefined {
		if ((args.type.flags & ts.TypeFlags.Number) === ts.TypeFlags.Number) {
			const property = new NumberProperty(args.id);
			return property;
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
	private static createObjectProperty(args: PropertyFactoryArgs): ObjectProperty | undefined {
		if (args.type.flags & ts.TypeFlags.Object) {
			const objectType = args.type as ts.ObjectType;

			if (objectType.objectFlags & ts.ObjectFlags.Interface) {
				const property = new ObjectProperty(args.id);
				property.setProperties(PropertyAnalyzer.analyze(args.type, args.typechecker));
				return property;
			}
		}

		return;
	}

	/**
	 * Analyzes a TypeScript symbol and tries to interpret it as a string property.
	 * On success, returns a new string property instance.
	 * @param args The property ID to use, the TypeScript symbol, the TypeScript type, and the type
	 * checker.
	 * @return The Alva-supported property or undefined, if the symbol is not supported.
	 */
	private static createStringProperty(args: PropertyFactoryArgs): StringProperty | undefined {
		if ((args.type.flags & ts.TypeFlags.String) === ts.TypeFlags.String) {
			const property = new StringProperty(args.id);
			return property;
		}

		return;
	}

	/**
	 * Returns a TypeScript type declaration for a given symbol.
	 * @param symbol The symbol to return the declaration for.
	 * @return TypeScript type declaration.
	 */
	private static findTypeDeclaration(symbol: ts.Symbol): ts.Declaration | undefined {
		if (symbol.valueDeclaration) {
			return symbol.valueDeclaration;
		}

		if (symbol.declarations) {
			return symbol.declarations[0];
		}

		if (symbol.type && symbol.type.symbol) {
			return PropertyAnalyzer.findTypeDeclaration(symbol.type.symbol);
		}

		return;
	}

	/**
	 * Updates a created property from the meta-data found in the declaration file, such as required
	 * flag, name-override, and default value.
	 * @param property The property to enrich
	 * @param symbol The TypeScript symbol of the Props property.
	 */
	private static setPropertyMetaData(property: Property, symbol: ts.Symbol): void {
		property.setRequired((symbol.flags & ts.SymbolFlags.Optional) !== ts.SymbolFlags.Optional);

		const nameOverride = PropertyAnalyzer.getJsDocValueFromSymbol(symbol, 'name');
		if (nameOverride) {
			property.setName(nameOverride);
		}

		const defaultValue = PropertyAnalyzer.getJsDocValueFromSymbol(symbol, 'default');
		if (defaultValue) {
			property.setDefaultValue(defaultValue);
		}
	}

	/**
	 * Searches a TypeScript AST (syntactic) node for a named JSDoc tag, and returns its value if
	 * found. This is used to read Alva declaration annotations.
	 * @param node The node to scan.
	 * @param tagName The JsDoc tag name, or undefined if the tag has not been found.
	 */
	private static getJsDocValue(node: ts.Node, tagName: string): string | undefined {
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
	private static getJsDocValueFromSymbol(symbol: ts.Symbol, tagName: string): string | undefined {
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
}
