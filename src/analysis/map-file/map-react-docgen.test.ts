import { mapReactDocgen } from './map-react-docgen';
import { createFileSystem } from '../test-utils';

test('attaches meta data to file with React component', async () => {
	const analysis = { attach: jest.fn(), get: jest.fn() };

	await mapReactDocgen('/component.js', {
		analysis,
		fs: createFileSystem({
			'/component.js': `
			import * as React from 'react';
			import * as PropTypes from 'prop-types';

			export const Component = props => <div id={props.id}/>

			Component.propTypes = {
				id: PropTypes.string.isRequired
			};
			`
		})
	});

	expect(analysis.attach).toHaveBeenCalled();
});

test('attaches no meta data for arbitrary js file', async () => {
	const analysis = { attach: jest.fn(), get: jest.fn() };

	await mapReactDocgen('/script.js', {
		analysis,
		fs: createFileSystem({ '/script.js': 'console.log("Hello world")' })
	});

	expect(analysis.attach).not.toHaveBeenCalled();
});
