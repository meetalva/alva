import * as path from 'path';
import * as optimist from 'optimist';
import * as ts from 'typescript';
import * as fs from 'fs';

export class PatternType {
	public property: Property[];
	public name: string;

	public static parse(path: string): PatternType {
		let type: PatternType = new PatternType();

		let sourceFile: ts.SourceFile = ts.createSourceFile(path,
			fs.readFileSync(path).toString(), ts.ScriptTarget.ES2016, true);

		sourceFile.forEachChild((node) => {
			if (ts.isExportAssignment(node)) {
				let assignment: ts.ExportAssignment = node;
				type.name = assignment.expression.getText();
			}
		});

		let declaration: ts.InterfaceDeclaration;
		sourceFile.forEachChild((node) => {
			if (ts.isInterfaceDeclaration(node)) {
				let candidate: ts.InterfaceDeclaration = node;
				if (candidate.name.escapedText === type.name + 'Props') {
					declaration = candidate;
				}
			}
		});

		declaration.forEachChild((node) => {
			console.log(kinds[node.kind]);
			if (ts.isPropertySignature(node)) {
				let signature: ts.PropertySignature = node;
				let property: Property = new Property();
				property.name = signature.name.getText();
				property.required = signature.questionToken === undefined;
				console.log("Name: " + property.name);
				console.log("Required: " + property.required);
				console.log("Type: " + signature.type.getFullText());
			}
			console.log('');
		});

		return type;
	}
}

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

let kinds: { [kind: number]: string } = {};
Object.keys(ts.SyntaxKind).map((value: string, index: number, array: string[]) => {
	kinds[ts.SyntaxKind[value]] = value;
});

let [styleGuidePath, projectName, pageName] = optimist.argv._;
let declarationPath = path.join(styleGuidePath, 'lib', 'patterns', 'atoms', 'button', 'index.d.ts');
let patternType: PatternType = PatternType.parse(declarationPath);
