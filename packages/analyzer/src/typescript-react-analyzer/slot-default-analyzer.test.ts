import * as tsa from 'ts-simple-ast';
import { analyzeSlotDefault } from './slot-default-analyzer';

interface TestContext {
	project: tsa.Project;
	path: string;
}

const ctx = ({ path: __dirname } as any) as TestContext;

beforeAll(() => {
	ctx.project = new tsa.Project();
});

/* test('should work with Text from @meetalva/essentials', () => {
	const result = analyzeSlotDefault(`
		import * as React from 'react';
		import { Text } from '@meetalva/essentials';
		export default () => <Text text="Hello, World!"/>
	`, {...ctx, id: 'meetalva-essentials-text' });

	expect(result).toEqual(expect.objectContaining({
		id: 'meetalva-essentials-text:default',
		parent: 'meetalva-essentials-text'
	}));
});

test('should work with JSX.IntrinsicElement', () => {
	const result = analyzeSlotDefault(`
		import * as React from 'react';
		export default () => <div>Hello, World</div>;
	`, {...ctx, id: 'jsxintrinsic' });

	expect(result).toEqual(expect.objectContaining({
		id: 'jsxintrinsic:default',
		parent: 'jsxintrinsic'
	}));
});

test('should ignore modules without default export', () => {
	const result = analyzeSlotDefault(`
		import * as React from 'react';
		import { Text } from '@meetalva/essentials';
		export const HelloWorld () => <Text/>;
	`, {...ctx, id: 'no-default-export' });

	expect(result).toBeUndefined();
}); */

test('should pick up props', () => {
	const result = analyzeSlotDefault(
		`
		import * as React from 'react';
		import { Text } from '@meetalva/essentials';
		export default () => <Text text="Hello, World!"/>
	`,
		{ ...ctx, id: 'meetalva-essentials-text' }
	);

	expect(result).toEqual(
		expect.objectContaining({
			id: 'meetalva-essentials-text:default',
			parent: 'meetalva-essentials-text',
			props: [
				{
					propName: 'text',
					value: '"Hello, World!"'
				}
			]
		})
	);
});
