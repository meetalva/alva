import * as Path from 'path';
import * as tsa from 'ts-simple-ast';
import { analyzeSlotDefault } from './slot-default-analyzer';

interface TestContext {
	project: tsa.Project;
	pkgPath: string;
	path: string;
}

const ctx = ({
	path: __dirname,
	pkgPath: Path.join(__dirname, 'package.json')
} as any) as TestContext;

beforeAll(() => {
	ctx.project = new tsa.Project();
});

test('works with Text from @meetalva/essentials', () => {
	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { Text } from '@meetalva/essentials';
		export default () => <Text text="Hello, World!"/>
	`,
		{ ...ctx, pkg: { name: 'name' }, id: 'meetalva-essentials-text' }
	);

	expect(result).toEqual(
		expect.objectContaining({
			id: 'meetalva-essentials-text:default',
			parent: 'meetalva-essentials-text'
		})
	);
});

test('works with JSX.IntrinsicElement', () => {
	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		export default () => <div>Hello, World</div>;
	`,
		{ ...ctx, pkg: { name: 'name' }, id: 'jsxintrinsic' }
	);

	expect(result).toBeUndefined();
});

test('ignores modules without default export', () => {
	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { Text } from '@meetalva/essentials';
		export const HelloWorld () => <Text/>;
	`,
		{ ...ctx, pkg: { name: 'name' }, id: 'no-default-export' }
	);

	expect(result).toBeUndefined();
});

test('picks up string props', () => {
	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { Text } from '@meetalva/essentials';
		export default () => <Text text="Hello, World!"/>
	`,
		{ ...ctx, pkg: { name: 'name' }, id: 'meetalva-essentials-text' }
	);

	expect(result).toEqual(
		expect.objectContaining({
			id: 'meetalva-essentials-text:default',
			parent: 'meetalva-essentials-text',
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
	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { Box } from '@meetalva/essentials';
		export default () => <Box flex={0} />
	`,
		{ ...ctx, pkg: { name: 'name' }, id: 'meetalva-essentials-box' }
	);

	expect(result).toEqual(
		expect.objectContaining({
			props: expect.arrayContaining([
				{
					propName: 'flex',
					value: 0
				}
			])
		})
	);
});

test('exposes pattern id via .patternContextId', () => {
	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { Text } from '@meetalva/essentials';
		export default () => <Text text="Hello, World!"/>
	`,
		{ ...ctx, pkg: { name: 'name' }, id: 'meetalva-essentials-text-id' }
	);

	expect(result).toEqual(
		expect.objectContaining({
			patternContextId: 'lib/text.d.ts:Text'
		})
	);
});

test('determines library id with scopes', () => {
	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { Text } from '@meetalva/essentials';
		export default () => <Text text="Hello, World!"/>
	`,
		{
			...ctx,
			pkg: { name: '@meetalva/essentials' },
			id: 'meetalva-essentials-text-library-id-scopes'
		}
	);

	expect(result).toEqual(
		expect.objectContaining({
			libraryId: '@meetalva/essentials'
		})
	);
});

test('supports multiple levels of JSX elements', () => {
	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { Box, Text } from '@meetalva/essentials';
		export default () => <Box><Text text="Hello, World!"/></Box>
	`,
		{ ...ctx, pkg: { name: 'name' }, id: 'meetalva-essentials-nested' }
	);

	expect(result).toEqual(
		expect.objectContaining({
			patternContextId: 'lib/box.d.ts:Box',
			children: expect.arrayContaining([
				expect.objectContaining({
					patternContextId: 'lib/text.d.ts:Text'
				})
			])
		})
	);
});
