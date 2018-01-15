// tslint:disable:no-bitwise

import { Property } from '../../pattern/property/property';
import * as ts from 'typescript';

import { BooleanProperty } from '../../pattern/property/boolean-property';
import { EnumProperty, Option } from '../../pattern/property/enum-property';
import { NumberArrayProperty } from '../../pattern/property/number-array-property';
import { NumberProperty } from '../../pattern/property/number-property';
import { ObjectProperty } from '../../pattern/property/object-property';
import { StringArrayProperty } from '../../pattern/property/string-array-property';
import { StringProperty } from '../../pattern/property/string-property';

const PropertyFactories: PropertyFactory[] = [
	createBooleanProperty,
	createEnumProperty,
	createStringProperty,
	createNumberProperty,
	createArrayProperty,
	createObjectProperty
];

export function getProperties(type: ts.Type, typechecker: ts.TypeChecker): Map<string, Property> {
	const properties = new Map<string, Property>();
	const members = type.getApparentProperties();

	members.forEach(memberSymbol => {
		if ((memberSymbol.flags & ts.SymbolFlags.Property) !== ts.SymbolFlags.Property) {
			return;
		}

		const property = createProperty(memberSymbol, typechecker);

		if (property) {
			properties.set(property.getId(), property);
		}
	});

	return properties;
}

function createProperty(symbol: ts.Symbol, typechecker: ts.TypeChecker): Property | undefined {
	const declaration = findTypeDeclaration(symbol) as ts.Declaration;

	let type = symbol.type ? symbol.type : declaration && typechecker.getTypeAtLocation(declaration);

	if (!type) {
		return;
	}

	if (type.flags & ts.TypeFlags.Union) {
		type = (type as ts.UnionType).types[0];
	}

	const id = symbol.name;
	const metadata = getPropertyMetadata(symbol);

	for (const propertyFactory of PropertyFactories) {
		const property: Property | undefined = propertyFactory({
			id,
			symbol,
			type,
			typechecker
		});

		if (property) {
			setPropertyMetaData(property, metadata);
			return property;
		}
	}

	return undefined;
}

interface PropertyFactoryArgs {
	id: string;
	symbol: ts.Symbol;
	type: ts.Type;
	typechecker: ts.TypeChecker;
}

type PropertyFactory = (args: PropertyFactoryArgs) => Property | undefined;

function createStringProperty(args: PropertyFactoryArgs): StringProperty | undefined {
	if ((args.type.flags & ts.TypeFlags.String) === ts.TypeFlags.String) {
		const property = new StringProperty(args.id);
		return property;
	}

	return;
}

function createNumberProperty(args: PropertyFactoryArgs): NumberProperty | undefined {
	if ((args.type.flags & ts.TypeFlags.Number) === ts.TypeFlags.Number) {
		const property = new NumberProperty(args.id);
		return property;
	}

	return;
}

function createBooleanProperty(args: PropertyFactoryArgs): BooleanProperty | undefined {
	if (
		(args.type.flags & ts.TypeFlags.BooleanLiteral) === ts.TypeFlags.BooleanLiteral ||
		(args.type.symbol && args.type.symbol.name === 'Boolean')
	) {
		const property = new BooleanProperty(args.id);
		return property;
	}

	return;
}

function createEnumProperty(args: PropertyFactoryArgs): EnumProperty | undefined {
	if (args.type.flags & ts.TypeFlags.EnumLiteral) {
		if (!(args.type.symbol && args.type.symbol.flags & ts.SymbolFlags.EnumMember)) {
			return;
		}

		const enumMemberDeclaration = findTypeDeclaration(args.type.symbol);

		if (!(enumMemberDeclaration && enumMemberDeclaration.parent)) {
			return;
		}

		if (!ts.isEnumDeclaration(enumMemberDeclaration.parent)) {
			return;
		}

		const property = new EnumProperty(args.id);
		property.setOptions(getEnumTypeOptions(enumMemberDeclaration.parent));
		return property;
	}

	return;
}

function createArrayProperty(args: PropertyFactoryArgs): Property | undefined {
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

function createObjectProperty(args: PropertyFactoryArgs): ObjectProperty | undefined {
	if (args.type.flags & ts.TypeFlags.Object) {
		const objectType = args.type as ts.ObjectType;

		if (objectType.objectFlags & ts.ObjectFlags.Interface) {
			const property = new ObjectProperty(args.id);
			property.setProperties(getProperties(args.type, args.typechecker));
			return property;
		}
	}

	return;
}

function setPropertyMetaData(property: Property, metadata: PropertyMetadata): void {
	property.setRequired(!metadata.optional);

	if (metadata.nameOverride) {
		property.setName(metadata.nameOverride);
	}

	if (metadata.defaultValue) {
		property.setDefaultValue(metadata.defaultValue);
	}
}

interface PropertyMetadata {
	optional: boolean;
	nameOverride?: string;
	defaultValue?: string;
}

function getPropertyMetadata(symbol: ts.Symbol): PropertyMetadata {
	const optional = (symbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional;
	const nameOverride = getJsDocValueFromSymbol(symbol, 'name');
	const defaultValue = getJsDocValueFromSymbol(symbol, 'default');

	return {
		optional,
		defaultValue,
		nameOverride
	};
}

function findTypeDeclaration(symbol: ts.Symbol): ts.Declaration | undefined {
	if (symbol.valueDeclaration) {
		return symbol.valueDeclaration;
	}

	if (symbol.declarations) {
		return symbol.declarations[0];
	}

	if (symbol.type && symbol.type.symbol) {
		return findTypeDeclaration(symbol.type.symbol);
	}

	return;
}

function getEnumTypeOptions(declaration: ts.EnumDeclaration): Option[] {
	return declaration.members.map((enumMember, index) => {
		const enumMemberId = enumMember.name.getText();
		let enumMemberName = getJsDocValue(enumMember, 'name');
		if (enumMemberName === undefined) {
			enumMemberName = enumMemberId;
		}
		const enumMemberOrdinal: number = enumMember.initializer
			? parseInt(enumMember.initializer.getText(), 10)
			: index;

		return new Option(enumMemberId, enumMemberName, enumMemberOrdinal);
	});
}

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

	return result === undefined ? undefined : result.trim();
}

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

	return result === undefined ? undefined : result.trim();
}
