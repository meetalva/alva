import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// TODO: Integrate this file into "Pattern"

export class Property {
	public name: string;
	public displayName: string;
	public type: string;
	public required: boolean;
}

export class EnumProperty extends Property {
	public options: Option[];
}

export class Option {
	public name: string;
	public displayName: string;
}

export class PatternType {
	private static kinds: { [kind: number]: string };
	public property: Property[];
	public name: string;

	public static parse(patternPath: string): PatternType {
		const type: PatternType = new PatternType();

		const sourceFile: ts.SourceFile = ts.createSourceFile(
			patternPath,
			fs.readFileSync(patternPath).toString(),
			ts.ScriptTarget.ES2016,
			true
		);

		sourceFile.forEachChild(node => {
			if (ts.isExportAssignment(node)) {
				const assignment: ts.ExportAssignment = node;
				type.name = assignment.expression.getText();
			}
		});

		let declaration: ts.InterfaceDeclaration | undefined;
		sourceFile.forEachChild(node => {
			if (ts.isInterfaceDeclaration(node)) {
				const candidate: ts.InterfaceDeclaration = node;
				if (candidate.name.escapedText === type.name + 'Props') {
					declaration = candidate;
				}
			}
		});

		if (!PatternType.kinds) {
			// tslint:disable-next-line:no-any
			const syntaxKind: any = ts.SyntaxKind as any;
			Object.keys(ts.SyntaxKind).map((value: string, index: number, array: string[]) => {
				PatternType.kinds[syntaxKind[value]] = value;
			});
		}

		if (!declaration) {
			throw new Error(`Invalid pattern "${patternPath}": No interface found`);
		}

		declaration.forEachChild((node: ts.Node) => {
			console.log(PatternType.kinds[node.kind]);
			if (ts.isPropertySignature(node)) {
				const signature: ts.PropertySignature = node;
				const signatureType: ts.TypeNode | undefined = signature.type;
				const property: Property = new Property();
				property.name = signature.name.getText();
				property.required = signature.questionToken === undefined;
				console.log('Name: ' + property.name);
				console.log('Required: ' + String(property.required));
				if (signatureType) {
					console.log('Type: ' + signatureType.getFullText());
				}
			}
			console.log('');
		});

		return type;
	}
}

const styleGuidePath = '../stacked-example';
const declarationPath = path.join(
	styleGuidePath,
	'lib',
	'patterns',
	'atoms',
	'button',
	'index.d.ts'
);
PatternType.parse(declarationPath);
