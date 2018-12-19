import * as Tsa from 'ts-simple-ast';
import { getExportedNode } from './get-exported-node';

const fixtures = require('fixturez')(__dirname);

let project: Tsa.Project;
let sourceFile: Tsa.SourceFile;

beforeAll(() => {
	const fixturePath = fixtures.find('children.tsx');
	project = new Tsa.Project();
	project.addExistingSourceFile(fixturePath);
	sourceFile = project.getSourceFileOrThrow('children.tsx');
});

test('extracts class correctly', () => {
	const basicClass = sourceFile.getClass('BasicClassComponent')!;
	const actual = getExportedNode(basicClass.getSymbol());

	expect(actual).not.toBeUndefined();
	expect(actual).toBe(basicClass.getSymbol()!.getDeclarations()[0]);
});
