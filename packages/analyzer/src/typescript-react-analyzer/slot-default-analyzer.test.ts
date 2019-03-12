import * as tsa from 'ts-simple-ast';
import { analyzeSlotDefault, getExportSpecifier } from './slot-default-analyzer';
import * as uuid from 'uuid';

interface TestContext {
	project: tsa.Project;
	pkgPath: string;
	path: string;
}

jest.mock('find-pkg', () => ({
	sync: (input: string) => '/package.json'
}));

jest.mock('../react-utils/find-react-component-type', () => ({
	findReactComponentType: () => true
}));

test('picks up string props', () => {
	const project = new tsa.Project({ useVirtualFileSystem: true, addFilesFromTsConfig: false });

	project.createSourceFile(
		'/a.ts',
		`import * as React from 'react'; export const A: React.SFC = () => null;`
	);

	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { A } from '/a';
		export default () => <A text="Hello, World!"/>
	`,
		{
			project,
			pkgPath: '/package.json',
			path: '/b.ts',
			pkg: { name: 'name' },
			id: 'string-props'
		}
	);

	expect(result).toEqual(
		expect.objectContaining({
			props: [
				{
					propName: 'text',
					value: 'Hello, World!'
				}
			]
		})
	);
});

test('picks up number props', () => {
	const project = new tsa.Project({ useVirtualFileSystem: true, addFilesFromTsConfig: false });

	project.createSourceFile(
		'/a.ts',
		`import * as React from 'react'; export const A: React.SFC = () => null;`
	);

	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { A } from '/a';
		export default () => <A num={0} />
	`,
		{ project, pkgPath: 'package.json', pkg: { name: 'name' }, id: 'number-props', path: '/b.ts' }
	);

	expect(result).toEqual(
		expect.objectContaining({
			props: expect.arrayContaining([
				{
					propName: 'num',
					value: 0
				}
			])
		})
	);
});

test('supports multiple levels of JSX elements', () => {
	const project = new tsa.Project({ useVirtualFileSystem: true, addFilesFromTsConfig: false });

	project.createSourceFile(
		'/ab.ts',
		`import * as React from 'react'; export const A: React.SFC = () => null; export const B: React.SFC = () => null`
	);

	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { A, B } from '/ab';
		export default () => <A><B/></A>
	`,
		{
			path: '/b.ts',
			project,
			pkg: { name: 'name' },
			pkgPath: '/package.json',
			id: 'nested-jsx'
		}
	);

	expect(result).toEqual(
		expect.objectContaining({
			patternContextId: 'ab.ts:A',
			children: [
				expect.objectContaining({
					patternContextId: 'ab.ts:B'
				})
			]
		})
	);
});

test('works with property access jsx tag names', () => {
	const project = new tsa.Project({ useVirtualFileSystem: true, addFilesFromTsConfig: false });

	project.createSourceFile(
		'/a.ts',
		`import * as React from 'react'; export const B: React.SFC = () => null`
	);

	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import * as A from '/a';
		export default () => <A.B />
	`,
		{
			path: '/b.ts',
			project,
			pkg: { name: 'name' },
			pkgPath: '/package.json',
			id: 'property-access'
		}
	);

	expect(result).toEqual(
		expect.objectContaining({
			patternContextId: 'a.ts:B'
		})
	);
});

test('determines export names correctly', () => {
	const project = new tsa.Project({ useVirtualFileSystem: true, addFilesFromTsConfig: false });

	const file = project.createSourceFile(
		`${uuid.v4()}`,
		`
		export const A = () => {};
		export function B() {}
		export class C {}

		const D = 'D';
		const F = D;
		export const G = F;
	`,
		{ overwrite: true }
	);

	const namedExports = file
		.getStatements()
		.filter(statement => tsa.TypeGuards.isExportableNode(statement) && statement.isNamedExport());

	expect(namedExports.map(namedExport => getExportSpecifier(namedExport))).toEqual([
		'A',
		'B',
		'C',
		'G'
	]);
});

test('determines export from aliased import', () => {
	const project = new tsa.Project({ useVirtualFileSystem: true, addFilesFromTsConfig: false });

	const file = project.createSourceFile('/aa.ts', `import { B as A } from './ab'; export { A };`);

	project.createSourceFile('/ab.ts', `export const B = () => {}`);

	const exportDeclaration = file.getStatements().filter(tsa.TypeGuards.isExportDeclaration)[0];

	const namedExport = exportDeclaration.getNamedExports()[0];
	expect(getExportSpecifier(namedExport)).toEqual('B');
});

test('determines last export from named import/export chain', () => {
	const project = new tsa.Project({ useVirtualFileSystem: true, addFilesFromTsConfig: false });

	const file = project.createSourceFile('/ba.ts', `import { A } from './bb'; export { A };`);

	project.createSourceFile('/bb.ts', `export { C as A } from './bc';`);

	project.createSourceFile('/bc.ts', `export const C = () => {}`);

	const exportDeclaration = file.getStatements().filter(tsa.TypeGuards.isExportDeclaration)[0];

	const namedExport = exportDeclaration.getNamedExports()[0];
	expect(getExportSpecifier(namedExport)).toEqual('C');
});
