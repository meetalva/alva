import * as FileUtils from 'fs';
import * as PathUtils from 'path';
import { Property } from '../property';
import * as ts from 'typescript';
import { PatternParser } from '.';
import { Pattern } from '..';

export class TypeScriptParser extends PatternParser {
	private static kinds: { [kind: number]: string };

	public constructor() {
		super();
	}

	public parse(pattern: Pattern): boolean {
		const folderPath: string = pattern.getPath();
		const declarationPath = PathUtils.join(folderPath, 'index.d.ts');
		const implementationPath = PathUtils.join(folderPath, 'index.js');

		if (!FileUtils.existsSync(declarationPath)) {
			console.warn(`Invalid pattern "${declarationPath}": No index.d.ts found`);
			return false;
		}

		if (!FileUtils.existsSync(implementationPath)) {
			console.warn(`Invalid pattern "${declarationPath}": No index.js found`);
			return false;
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
			return false;
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

		if (!TypeScriptParser.kinds) {
			const kinds: { [kind: number]: string } = {};
			// tslint:disable-next-line:no-any
			const syntaxKind: any = ts.SyntaxKind as any;
			Object.keys(ts.SyntaxKind).map((value: string, index: number, array: string[]) => {
				kinds[syntaxKind[value]] = value;
			});
			TypeScriptParser.kinds = kinds;
		}

		if (!declaration) {
			console.warn(`Invalid pattern "${declarationPath}": No props interface found`);
			return false;
		}

		const properties: Property[] = [];
		declaration.forEachChild((node: ts.Node) => {
			if (ts.isPropertySignature(node)) {
				const signature: ts.PropertySignature = node;
				const property: Property = new Property();
				property.name = signature.name.getText();
				property.required = signature.questionToken === undefined;

				// TODO: const signatureType: ts.TypeNode | undefined = signature.type;
				// TODO: signatureType.getFullText());

				properties.push(property);
			}
		});
		pattern.properties = properties;

		return true;
	}
}
