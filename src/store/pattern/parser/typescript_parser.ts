import { BooleanProperty } from '../property/boolean_property';
// TODO: import { PatternProperty } from '../property/pattern_property';
import { EnumProperty, Option } from '../property/enum_property';
import * as FileUtils from 'fs';
import { NumberArrayProperty } from '../property/number_array_property';
import { NumberProperty } from '../property/number_property';
import { ObjectProperty } from '../property/object_property';
import * as PathUtils from 'path';
import { Property } from '../property';
import { StringArrayProperty } from '../property/string_array_property';
import { StringProperty } from '../property/string_property';
import * as ts from 'typescript';
import { PatternParser } from '.';
import { Pattern } from '..';

export class TypeScriptParser extends PatternParser {
	protected enums: { [name: string]: ts.EnumDeclaration } = {};
	protected propsDeclaration?: ts.InterfaceDeclaration;
	protected properties: Property[] = [];
	protected sourceFile?: ts.SourceFile;
	protected typeName?: string;

	protected analyzeDeclarations(): void {
		this.enums = {};
		this.propsDeclaration = undefined;
		this.typeName = undefined;

		// Phase one: Find type name
		(this.sourceFile as ts.SourceFile).forEachChild(node => {
			if (ts.isExportAssignment(node)) {
				const assignment: ts.ExportAssignment = node;
				this.typeName = assignment.expression.getText();
			}
		});

		// Phase two: find props interface, enums, and pattern props imports
		(this.sourceFile as ts.SourceFile).forEachChild(node => {
			if (ts.isInterfaceDeclaration(node)) {
				const declaration: ts.InterfaceDeclaration = node;
				if (declaration.name.getText() === this.getPropsTypeName()) {
					this.propsDeclaration = declaration;
				}
			} else if (ts.isEnumDeclaration(node)) {
				const declaration: ts.EnumDeclaration = node;
				this.enums[declaration.name.getText()] = declaration;
			}
		});
	}

	protected getJsDocValue(node: ts.Node, tagName: string): string | undefined {
		const jsDocTags: ReadonlyArray<ts.JSDocTag> | undefined = ts.getJSDocTags(node);
		let result: string | undefined;
		if (jsDocTags) {
			jsDocTags.forEach(jsDocTag => {
				if (jsDocTag.tagName && jsDocTag.tagName.text === tagName) {
					result = jsDocTag.comment;
				}
			});
		}

		return result;
	}

	protected getPropsTypeName(): string {
		return `${this.typeName}Props`;
	}

	public parse(pattern: Pattern): Property[] | undefined {
		this.sourceFile = undefined;
		this.properties = [];

		const folderPath: string = pattern.getAbsolutePath();
		const declarationPath = PathUtils.join(folderPath, 'index.d.ts');
		const implementationPath = PathUtils.join(folderPath, 'index.js');

		if (!FileUtils.existsSync(declarationPath)) {
			console.warn(`Invalid pattern "${declarationPath}": No index.d.ts found`);
			return undefined;
		}

		if (!FileUtils.existsSync(implementationPath)) {
			console.warn(`Invalid pattern "${declarationPath}": No index.js found`);
			return undefined;
		}

		this.sourceFile = ts.createSourceFile(
			declarationPath,
			FileUtils.readFileSync(declarationPath).toString(),
			ts.ScriptTarget.ES2016,
			true
		);

		this.analyzeDeclarations();
		if (!this.typeName) {
			console.warn(`Invalid pattern "${declarationPath}": No type name found`);
			return undefined;
		}
		if (!this.propsDeclaration) {
			console.warn(`Invalid pattern "${declarationPath}": No props interface found`);
			return undefined;
		}

		this.propsDeclaration.forEachChild((node: ts.Node) => {
			if (ts.isPropertySignature(node)) {
				this.processProperty(node);
			}
		});

		return this.properties;
	}

	protected processProperty(signature: ts.PropertySignature): void {
		const required: boolean = signature.questionToken === undefined;

		const id: string = signature.name.getText();
		let name: string | undefined = this.getJsDocValue(signature, 'name');
		if (name === undefined) {
			name = id;
		}

		const typeNode: ts.TypeNode | undefined = signature.type;
		if (!typeNode) {
			return;
		}

		let property: Property | undefined;
		switch (typeNode.kind) {
			case ts.SyntaxKind.StringKeyword:
				property = new StringProperty(id, name, required);
				break;

			case ts.SyntaxKind.NumberKeyword:
				property = new NumberProperty(id, name, required);
				break;

			case ts.SyntaxKind.BooleanKeyword:
				property = new BooleanProperty(id, name, required);
				break;

			case ts.SyntaxKind.ArrayType:
				switch ((typeNode as ts.ArrayTypeNode).elementType.kind) {
					case ts.SyntaxKind.StringKeyword:
						property = new StringArrayProperty(id, name, required);
						break;

					case ts.SyntaxKind.NumberKeyword:
						property = new NumberArrayProperty(id, name, required);
				}
				break;

			case ts.SyntaxKind.TypeReference:
				const referenceNode = typeNode as ts.TypeReferenceNode;
				property = this.processTypeProperty(id, name, required, referenceNode);
		}

		if (!property) {
			property = new ObjectProperty(id, name, required);
			// TODO: Parse properties
		}

		this.properties.push(property);
	}

	protected processTypeProperty(
		id: string,
		name: string,
		required: boolean,
		referenceNode: ts.TypeReferenceNode
	): Property | undefined {
		if (!referenceNode.typeName) {
			return undefined;
		}

		// TODO: Pattern type

		const enumTypeName: string = referenceNode.typeName.getText();
		const enumDeclaration: ts.EnumDeclaration | undefined = this.enums[enumTypeName];
		if (!enumDeclaration) {
			return undefined;
		}

		const options: Option[] = [];
		enumDeclaration.members.forEach((enumMember, index) => {
			const enumMemberId = enumMember.name.getText();
			// TODO: Replace by actual name
			const enumMemberName = enumMemberId;
			const enumMemberOrdinal: number = enumMember.initializer
				? parseInt(enumMember.initializer.getText(), 10)
				: index;
			options.push(new Option(enumMemberId, enumMemberName, enumMemberOrdinal));
		});

		return new EnumProperty(id, name, required, options);
	}
}
