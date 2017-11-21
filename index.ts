import * as path from 'path';
import * as optimist from 'optimist';
import * as readts from 'readts';
import * as ts from 'typescript';
import {readFileSync} from "fs";

let [styleGuidePath, projectName, pageName] = optimist.argv._;
let pagePath = path.join(styleGuidePath, 'stacked', projectName, pageName + '.json');

let declarationPath = path.join(styleGuidePath, 'lib', 'patterns', 'atoms', 'button', 'index.d.ts');

console.log("Path: " + declarationPath);

console.log(
	ts.createSourceFile(
		declarationPath, readFileSync(declarationPath).toString(), ts.ScriptTarget.ES2016
	).forEachChild((child) => {
		console.log('child', child);
	})
);

console.log("Pattern: ");
let tsConfig: ts.ParsedCommandLine = {options:{}, fileNames: [declarationPath], errors: []};
console.log(new readts.Parser().parse(tsConfig));
