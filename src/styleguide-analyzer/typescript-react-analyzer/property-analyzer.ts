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

interface PropertyMetadata {
	optional: boolean;
	nameOverride?: string;
	defaultValue?: string;
}

type PropertyFactory = (args: PropertyFactoryArgs) => Property | undefined;

export class PropertyAnalyzer {
	public static analyze(type: ts.Type, typechecker: ts.TypeChecker): Property[] {
		const properties: Property[] = [];
		const members = type.getApparentProperties();

		members.forEach(memberSymbol => {
			if ((memberSymbol.flags & ts.SymbolFlags.Property) !== ts.SymbolFlags.Property) {
				return;
			}

			const property = this.createProperty(memberSymbol, typechecker);
			if (property) {
				properties.push(property);
			}
		});

		return properties;
	}

	protected static createProperty(
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

		const id = symbol.name;
		const metadata = this.getPropertyMetadata(symbol);

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
				id,
				symbol,
				type,
				typechecker
			});

			if (property) {
				this.setPropertyMetaData(property, metadata);
				return property;
			}
		}

		return undefined;
	}

	private static createStringProperty(args: PropertyFactoryArgs): StringProperty | undefined {
		if ((args.type.flags & ts.TypeFlags.String) === ts.TypeFlags.String) {
			const property = new StringProperty(args.id);
			return property;
		}

		return;
	}

	private static createNumberProperty(args: PropertyFactoryArgs): NumberProperty | undefined {
		if ((args.type.flags & ts.TypeFlags.Number) === ts.TypeFlags.Number) {
			const property = new NumberProperty(args.id);
			return property;
		}

		return;
	}

	private static createBooleanProperty(args: PropertyFactoryArgs): BooleanProperty | undefined {
		if (
			(args.type.flags & ts.TypeFlags.BooleanLiteral) === ts.TypeFlags.BooleanLiteral ||
			(args.type.symbol && args.type.symbol.name === 'Boolean')
		) {
			return new BooleanProperty(args.id);
		}

		return;
	}

	private static createEnumProperty(args: PropertyFactoryArgs): EnumProperty | undefined {
		if (args.type.flags & ts.TypeFlags.EnumLiteral) {
			if (!(args.type.symbol && args.type.symbol.flags & ts.SymbolFlags.EnumMember)) {
				return;
			}

			const enumMemberDeclaration = PropertyAnalyzer.findTypeDeclaration(args.type.symbol);

			if (!(enumMemberDeclaration && enumMemberDeclaration.parent)) {
				return;
			}

			if (!ts.isEnumDeclaration(enumMemberDeclaration.parent)) {
				return;
			}

			const property = new EnumProperty(args.id);
			property.setOptions(PropertyAnalyzer.getEnumTypeOptions(enumMemberDeclaration.parent));
			return property;
		}

		return;
	}

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

	private static setPropertyMetaData(property: Property, metadata: PropertyMetadata): void {
		property.setRequired(!metadata.optional);

		if (metadata.nameOverride) {
			property.setName(metadata.nameOverride);
		}

		if (metadata.defaultValue) {
			property.setDefaultValue(metadata.defaultValue);
		}
	}

	private static getPropertyMetadata(symbol: ts.Symbol): PropertyMetadata {
		const optional = (symbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional;
		const nameOverride = PropertyAnalyzer.getJsDocValueFromSymbol(symbol, 'name');
		const defaultValue = PropertyAnalyzer.getJsDocValueFromSymbol(symbol, 'default');

		return {
			optional,
			defaultValue,
			nameOverride
		};
	}

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

	private static getEnumTypeOptions(declaration: ts.EnumDeclaration): Option[] {
		return declaration.members.map((enumMember, index) => {
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
	}

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
