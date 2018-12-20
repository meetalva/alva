import { usesChildren } from './uses-children';
import * as Tsa from 'ts-simple-ast';

const fixtures = require('fixturez')(__dirname);

let project: Tsa.Project;
let sourceFile: Tsa.SourceFile;

beforeAll(() => {
	const fixturePath = fixtures.find('children.tsx');
	project = new Tsa.Project();
	project.addExistingSourceFile(fixturePath);
	sourceFile = project.getSourceFileOrThrow('children.tsx');
});

test('detects basic props.children usage', () => {
	const basic = getNamedExport(sourceFile, 'BasicComponent');
	expect(usesChildren(basic, { project })).toBe(true);
});

test('considers props.other not as children usage', () => {
	const other = getNamedExport(sourceFile, 'OtherProperty');
	expect(usesChildren(other, { project })).toBe(false);
});

test('detects children usage in function declaration', () => {
	const functionDeclaration = getNamedExport(sourceFile, 'FunctionDeclarationComponent');
	expect(usesChildren(functionDeclaration, { project })).toBe(true);
});

test('detects children usage in basic class', () => {
	const classComponent = getNamedExport(sourceFile, 'BasicClassComponent');
	expect(usesChildren(classComponent, { project })).toBe(true);
});

test('detects children usage in SFC with destructuring parameter', () => {
	const destructuringComponent = getNamedExport(sourceFile, 'DestructuringSFC');
	expect(usesChildren(destructuringComponent, { project })).toBe(true);
});

test('detects children usage in SFC with aliasing', () => {
	const aliasingComponent = getNamedExport(sourceFile, 'AliasingSFC');
	expect(usesChildren(aliasingComponent, { project })).toBe(true);
});

test('detects children usage in Class with destructuring parameter', () => {
	const destructuringComponent = getNamedExport(sourceFile, 'DestructuringClassComponent');
	expect(usesChildren(destructuringComponent, { project })).toBe(true);
});

test('detects children usage in Class with aliasing', () => {
	const aliasingComponent = getNamedExport(sourceFile, 'AliasingClassComponent');
	expect(usesChildren(aliasingComponent, { project })).toBe(true);
});

test('detects children usage in decorated component', () => {
	const decoratedComponent = getNamedExport(sourceFile, 'DecoratedComponent');
	expect(usesChildren(decoratedComponent, { project })).toBe(true);
});

function getNamedExport(sourceFile: Tsa.SourceFile, name: string) {
	const symbols = sourceFile.getExportSymbols();
	const symbol = symbols.find(s => s.getName() === name);

	if (!symbol) {
		throw new Error(
			`No symbol with name ${name} found. Available symbols: ${symbols
				.map(s => s.getName())
				.join(', ')}`
		);
	}

	return symbol.getValueDeclarationOrThrow();
}
