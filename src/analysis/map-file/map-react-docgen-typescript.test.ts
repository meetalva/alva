import { mapReactDocgenTypeScript } from './map-react-docgen-typescript';
import { createFileSystem } from '../test-utils';

// TODO: enable this test
/* test('attaches meta data to file with TypeScript React component', async () => {
	const analysis = { attach: jest.fn(), get: jest.fn() };

	await mapReactDocgenTypeScript('/component.tsx', {
		analysis,
		fs: createFileSystem({ '/component.tsx': `
			import * as React from 'react';

			export interface Props {
				\/** prop1 description *\/
				prop1?: string;
			}

			export const Component = (props: Props) => {
				return <div>Grid</div>;
			};
			`
		})
	});

	expect(analysis.attach).toHaveBeenCalled();
}); */

test('attaches no meta data for arbitrary TypeScript file', async () => {
	const analysis = { attach: jest.fn(), get: jest.fn() };

	await mapReactDocgenTypeScript('/script.js', {
		analysis,
		fs: createFileSystem({
			'/script.js': `
			export const helloWorld = (): void => console.log("Hello World");
		`
		})
	});

	expect(analysis.attach).not.toHaveBeenCalled();
});
