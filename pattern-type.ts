import * as path from 'path';
import * as optimist from 'optimist';
import * as ts from 'typescript';
import { readFileSync } from "fs";

export class PatternType {
	public property: Property[];

	public static parse(path: string): PatternType {
		let type: PatternType = new PatternType();

		let declaraction = ts.createSourceFile(path,
			readFileSync(path).toString(), ts.ScriptTarget.ES2016);

		declaraction.getChildren().forEach((node) => {
			this.output(node, ' ');
		});

		return type;
	}

	public static output(node: ts.Node, indentation: string) {
		let anonNode: any = node;
		if (anonNode.name && anonNode.name.escapedText) {
			console.log(indentation + '[' + kinds[anonNode.kind] + '] ' + anonNode.name.escapedText);
		} else {
			console.log(indentation + '[' + kinds[anonNode.kind] + ']');
		}
		let childCount = node.getChildCount();
		for (let childNo = 0; childNo < childCount; childNo++) {
			try {
				this.output(node.getChildAt(childNo), indentation + '  ');
			} catch (error) {
			}
		}
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

let kinds: {[kind: number]: string} = {};
Object.keys(ts.SyntaxKind).map((value: string, index: number, array: string[]) => {
	kinds[ts.SyntaxKind[value]] = value;
});

let [styleGuidePath, projectName, pageName] = optimist.argv._;
let declarationPath = path.join(styleGuidePath, 'lib', 'patterns', 'atoms', 'button', 'index.d.ts');
console.log(declarationPath);
PatternType.parse(declarationPath);
