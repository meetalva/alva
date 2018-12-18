import { usesChildren } from './uses-children';
import Project from 'ts-simple-ast';

const fixtures = require('fixturez')(__dirname);

let project;
let sourceFile;

beforeAll(() => {
	const fixturePath = fixtures.find('children.tsx');
	project = new Project();
	project.addExistingSourceFile(fixturePath);
	sourceFile = project.getSourceFileOrThrow('children.tsx');
});

test('detects basic props.children usage', () => {
	const basicComponent = sourceFile.getExportedDeclarations()[0];
	expect(usesChildren(basicComponent, { project })).toBe(true);
});

test('does not consider props.other as children usage', () => {
	const otherProps = sourceFile.getExportedDeclarations()[1];
	expect(usesChildren(otherProps, { project })).toBe(false);
});
