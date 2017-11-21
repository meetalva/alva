import * as path from 'path';
import * as optimist from 'optimist';
import * as dtsParser from 'dts-parser';

let [styleGuidePath, projectName, pageName] = optimist.argv();
let pagePath = path.join(styleGuidePath, 'stacked', projectName, pageName + '.json');

let declarationPath = path.join(styleGuidePath, 'pattern', 'atom', 'button');

console.log("Path: " + declarationPath);
console.log("Pattern: ");
console.log(dtsParser.parse(declarationPath));
