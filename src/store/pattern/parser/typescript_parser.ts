import { BooleanProperty } from '../property/boolean_property';
// TODO: import { PatternProperty } from '../property/pattern_property';
import { EnumProperty, Option } from '../property/enum_property';
import * as FileUtils from 'fs';
import { NumberArrayProperty } from '../property/number_array_property';
import { NumberProperty } from '../property/number_property';
import { ObjectProperty } from '../property/object_property';
import * as PathUtils from 'path';
import { Pattern } from '../pattern';
import { PatternParser } from './pattern_parser';
import { Property } from '../property/property';
import { StringArrayProperty } from '../property/string_array_property';
import { StringProperty } from '../property/string_property';
import * as ts from 'typescript';

/**
 * Pattern parser implementation for TypeScript patterns.
 * The TypeScript pattern parser expects directories in the following structure:
 * <ul>
 * <li>A directory named 'patterns' at styleguide top-level.</li>
 * <li>Inside that, a directory per pattern folder</li>
 * <li>Inside that, maybe a deeper structure of pattern folders</li>
 * <li>Finally inside that, a directory per pattern</li>
 * </ul>
 * Each pattern directory must have an 'index.js' and an 'index.d.ts' file,
 * containing the implementation, and the typings.
 * Each pattern typing must have a props interface with the same name as the pattern, plus 'Props'.
 * Each property must be of one of the following types:
 * <ul>
 * <li>string</li>
 * <li>string[]</li>
 * <li>number</li>
 * <li>number[]</li>
 * <li>boolean</li>
 * <li>enum (with a TypeScript enum type declared in the same file)</li>
 * </ul>
 * All other properties are ignored for now.
 * Properties may be optional ('?'), and the parser considers that.
 * Additionally, you may add JSDoc annotations to signal meta-data:
 * <ul>
 * <li>@name to override the human-friendly name</li>
 * <li>@default to provide an initial value for Alva</li>
 * <li>@hidden to hide the property from Alva</li>
 * </ul>
 * You can also specify the @name annotation on enum members,
 * and you can add it to the props interface to rename the entire pattern.
 */
export class TypeScriptParser extends PatternParser {
	protected enums: { [name: string]: ts.EnumDeclaration } = {};
	protected propsDeclaration?: ts.InterfaceDeclaration;
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

	protected createProperty(signature: ts.PropertySignature): Property | undefined {
		const typeNode: ts.TypeNode | undefined = signature.type;
		if (!typeNode) {
			return undefined;
		}

		const id: string = signature.name.getText();

		let property: Property | undefined;
		switch (typeNode.kind) {
			case ts.SyntaxKind.StringKeyword:
				return new StringProperty(id);

			case ts.SyntaxKind.NumberKeyword:
				return new NumberProperty(id);

			case ts.SyntaxKind.BooleanKeyword:
				return new BooleanProperty(id);

			case ts.SyntaxKind.ArrayType:
				switch ((typeNode as ts.ArrayTypeNode).elementType.kind) {
					case ts.SyntaxKind.StringKeyword:
						return new StringArrayProperty(id);

					case ts.SyntaxKind.NumberKeyword:
						return new NumberArrayProperty(id);
				}
				break;

			case ts.SyntaxKind.TypeReference:
				const referenceNode = typeNode as ts.TypeReferenceNode;
				property = this.processTypeProperty(id, referenceNode);
		}

		if (!property) {
			property = new ObjectProperty(id);
			// TODO: Parse properties
		}

		return property;
	}

	protected getJsDocValue(node: ts.Node, tagName: string): string | undefined {
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

	protected getPropsTypeName(): string {
		return `${this.typeName}Props`;
	}

	/**
	 * @inheritDoc
	 */
	public parse(pattern: Pattern): boolean {
		this.sourceFile = undefined;

		const folderPath: string = pattern.getAbsolutePath();
		const declarationPath = PathUtils.join(folderPath, 'index.d.ts');
		const implementationPath = PathUtils.join(folderPath, 'index.js');

		let iconPath: string = PathUtils.join(folderPath, 'icon.svg');
		if (FileUtils.existsSync(iconPath)) {
			pattern.setIconPath(iconPath);
		} else {
			const sourceFolderPath: string = pattern.getAbsoluteSourcePath();
			iconPath = PathUtils.join(sourceFolderPath, 'icon.svg');
			if (FileUtils.existsSync(iconPath)) {
				pattern.setIconPath(iconPath);
			}
		}

		if (!FileUtils.existsSync(declarationPath)) {
			console.warn(`Invalid pattern "${declarationPath}": No index.d.ts found`);
			return false;
		}

		if (!FileUtils.existsSync(implementationPath)) {
			console.warn(`Invalid pattern "${declarationPath}": No index.js found`);
			return false;
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
			return false;
		}
		if (!this.propsDeclaration) {
			console.warn(`Invalid pattern "${declarationPath}": No props interface found`);
			return false;
		}

		const patternName: string | undefined = this.getJsDocValue(this.propsDeclaration, 'name');
		if (patternName !== undefined && patternName !== '') {
			pattern.setName(patternName);
		}

		this.propsDeclaration.forEachChild((node: ts.Node) => {
			if (ts.isPropertySignature(node)) {
				this.processProperty(node, pattern);
			}
		});

		return true;
	}

	protected processProperty(signature: ts.PropertySignature, pattern: Pattern): void {
		let property: Property | undefined = pattern.getProperty(signature.name.getText());
		if (!property) {
			property = this.createProperty(signature);
			if (!property) {
				return;
			}

			pattern.addProperty(property);
		}

		const name: string | undefined = this.getJsDocValue(signature, 'name');
		if (name !== undefined && name !== '') {
			property.setName(name);
		}

		property.setRequired(signature.questionToken === undefined);
		property.setHidden(this.getJsDocValue(signature, 'hidden') !== undefined);

		const defaultValue: string | undefined = this.getJsDocValue(signature, 'default');
		if (defaultValue !== undefined) {
			property.setDefaultValue(defaultValue);
		}
	}

	protected processTypeProperty(
		id: string,
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
			let enumMemberName = this.getJsDocValue(enumMember, 'name');
			if (enumMemberName === undefined) {
				enumMemberName = enumMemberId;
			}
			const enumMemberOrdinal: number = enumMember.initializer
				? parseInt(enumMember.initializer.getText(), 10)
				: index;
			options.push(new Option(enumMemberId, enumMemberName, enumMemberOrdinal));
		});

		const result: EnumProperty = new EnumProperty(id);
		result.setOptions(options);
		return result;
	}
}
