import { analyse } from './analyse';
import { createFileSystem } from '../test-utils';
import * as T from '../types';
import * as uuid from 'uuid';

test('calls project mappers', async () => {
	const mapper = jest.fn();

	await analyse('/', {
		fileMappers: [],
		fs: createFileSystem(),
		projectMappers: [mapper]
	});

	expect(mapper.mock.calls.length).toBe(1);
});

test('calls project mappers with project path', async () => {
	const mapper = jest.fn();

	await analyse('/', {
		fileMappers: [],
		fs: createFileSystem(),
		projectMappers: [mapper]
	});

	expect(mapper.mock.calls[0][0]).toBe('/');
});

test('calls file mappers', async () => {
	const mapper = jest.fn();
	const fs = createFileSystem({ '/file.js': '' });

	await analyse('/', {
		fileMappers: [mapper],
		fs,
		projectMappers: []
	});

	expect(mapper.mock.calls.length).toBe(1);
});

test('calls file mappers with file path', async () => {
	const mapper = jest.fn();
	const fs = createFileSystem({ '/file.js': '' });

	await analyse('/', {
		fileMappers: [mapper],
		fs,
		projectMappers: []
	});

	expect(mapper.mock.calls[0][0]).toBe('/file.js');
});

test('calls file mappers for every file in tree', async () => {
	const mapper = jest.fn();
	const fs = createFileSystem({
		'/file-a.js': '',
		'/b/file-a.js': '',
		'/b/file-b.js': ''
	});

	await analyse('/', {
		fileMappers: [mapper],
		fs,
		projectMappers: []
	});

	const calls = mapper.mock.calls.map(call => call[0]);

	expect(calls).toEqual(['/file-a.js', '/b/file-a.js', '/b/file-b.js']);
});

test('analyses files inside given path', async () => {
	const mapper = jest.fn();

	const fs = createFileSystem({
		'/a/file-a.js': '',
		'/b/file-b.js': ''
	});

	await analyse('/a', {
		fileMappers: [mapper],
		fs,
		projectMappers: []
	});

	const calls = mapper.mock.calls.map(call => call[0]);
	expect(calls).toEqual(['/a/file-a.js']);
});

test('returns analysis augmented by project mapper calls', async () => {
	const id = uuid.v4();
	const mapper = jest.fn((path: string, ctx: T.AnalysisMapperContext) =>
		ctx.analysis.attach(path, { type: 'type', payload: id })
	);

	const result = await analyse('/', {
		fileMappers: [],
		fs: createFileSystem(),
		projectMappers: [mapper]
	});

	expect(await result.analysis.get('/')).toEqual([{ type: 'type', payload: id }]);
});

test('returns analysis augmented by file mapper calls', async () => {
	const id = uuid.v4();

	const mapper = jest.fn((path: string, ctx: T.AnalysisMapperContext) => {
		if (path === '/file-a.js') {
			ctx.analysis.attach(path, { type: 'type', payload: id });
		}
	});

	const result = await analyse('/', {
		fileMappers: [mapper],
		fs: createFileSystem({ '/file-a.js': '', '/file-b.js': '' }),
		projectMappers: []
	});

	expect(await result.analysis.get('/file-a.js')).toEqual([{ type: 'type', payload: id }]);
	expect(await result.analysis.get('/file-b.js')).toBeUndefined();
});

test('respects ignore globs', async () => {
	const mapper = jest.fn();

	await analyse('/', {
		fileMappers: [mapper],
		fs: createFileSystem({ '/file-a.js': '', '/file-b.js': '', 'b/file-a.js': '' }),
		ignore: ['*-b.js', 'b/**/*'],
		projectMappers: []
	});

	expect(mapper).toHaveBeenCalledTimes(1);
	expect(mapper).toHaveBeenLastCalledWith('/file-a.js', jasmine.any(Object));
});
