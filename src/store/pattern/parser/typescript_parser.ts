// TODO: import { StringArrayProperty } from '../property/string_array_property';
import { BooleanProperty } from '../property/boolean_property';
import * as FileUtils from 'fs';
import { NumberProperty } from '../property/number_property';
// TODO: import { NumberArrayProperty } from '../property/number_array_property';
import { ObjectProperty } from '../property/object_property';
import * as PathUtils from 'path';
import { Property } from '../property';
import { StringProperty } from '../property/string_property';
// TODO: import { PatternProperty } from '../property/pattern_property';
// TODO: import { EnumProperty } from '../property/enum_property';
import * as ts from 'typescript';
import { PatternParser } from '.';
import { Pattern } from '..';

export class TypeScriptParser extends PatternParser {
	public parse(pattern: Pattern): Property[] | undefined {
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

		const sourceFile: ts.SourceFile = ts.createSourceFile(
			declarationPath,
			FileUtils.readFileSync(declarationPath).toString(),
			ts.ScriptTarget.ES2016,
			true
		);

		let typeName: string | undefined;
		sourceFile.forEachChild(node => {
			if (ts.isExportAssignment(node)) {
				const assignment: ts.ExportAssignment = node;
				typeName = assignment.expression.getText();
			}
		});

		if (!typeName) {
			console.warn(`Invalid pattern "${declarationPath}": No type name found`);
			return undefined;
		}

		let declaration: ts.InterfaceDeclaration | undefined;
		sourceFile.forEachChild(node => {
			if (ts.isInterfaceDeclaration(node)) {
				const candidate: ts.InterfaceDeclaration = node;
				if (candidate.name.escapedText === (typeName as string) + 'Props') {
					declaration = candidate;
				}
			}
		});

		if (!declaration) {
			console.warn(`Invalid pattern "${declarationPath}": No props interface found`);
			return undefined;
		}

		const properties: Property[] = [];
		declaration.forEachChild((node: ts.Node) => {
			if (ts.isPropertySignature(node)) {
				const signature: ts.PropertySignature = node;
				const id: string = signature.name.getText();

				// TODO: Replace by actual name
				const name: string = signature.name.getText();

				const required: boolean = signature.questionToken === undefined;

				const typeNode: ts.TypeNode | undefined = signature.type;
				if (!typeNode) {
					return;
				}

				let property: Property;
				switch (typeNode.kind) {
					case ts.SyntaxKind.StringKeyword:
						// TODO: if (isArray) {
						// type = PropertyType.STRING_ARRAY;
						// } else {
						property = new StringProperty(id, name, required);
						// }
						break;

					case ts.SyntaxKind.NumberKeyword:
						// TODO: if (isArray) {
						// type = PropertyType.NUMBER_ARRAY;
						// } else {
						property = new NumberProperty(id, name, required);
						// }
						break;

					case ts.SyntaxKind.BooleanKeyword:
						property = new BooleanProperty(id, name, required);
						break;

					// TODO: Pattern type

					default:
						property = new ObjectProperty(id, name, required);
				}

				properties.push(property);
			}
		});
		return properties;
	}
}
