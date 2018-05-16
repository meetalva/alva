import * as Fs from 'fs';
import { mapReactDocgenTypeScript } from './map-react-docgen-typescript';
import * as Path from 'path';
import * as TestUtils from '../test-utils';

test('attaches meta data to file with TypeScript React component', async () => {
	const analysis = { attach: jest.fn(), get: jest.fn() };
	const fs = TestUtils.createFileSystem({
		'/component.tsx': `
			import * as React from 'react';

			export interface Props {
				\/** prop1 description *\/
				prop1?: string;
			}

			export const Component = (props: Props) => {
				return <div>Grid</div>;
			};
		`
	});

	const base = await TestUtils.dumpFileSystem(fs);

	await mapReactDocgenTypeScript(Path.join(base, 'component.tsx'), {
		analysis,
		fs: Fs
	});

	expect(analysis.attach).toHaveBeenCalled();
});

test('attaches no meta data for arbitrary TypeScript file', async () => {
	const analysis = { attach: jest.fn(), get: jest.fn() };

	const fs = TestUtils.createFileSystem({
		'/script.ts': `
		export const helloWorld = (): void => console.log("Hello World");
	`
	});

	const base = await TestUtils.dumpFileSystem(fs);

	await mapReactDocgenTypeScript(Path.join(base, 'script.ts'), {
		analysis,
		fs: Fs
	});

	expect(analysis.attach).not.toHaveBeenCalled();
});
