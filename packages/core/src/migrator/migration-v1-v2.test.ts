import * as Fs from 'fs';
import * as Yaml from 'js-yaml';
import * as Util from 'util';
import { OneTwoMigration } from './migration-v1-v2';
import * as T from '../types';

const readFile = Util.promisify(Fs.readFile);
const fixtures = require('fixturez')(__dirname);

test('increments version to 2', async () => {
	const path = fixtures.find('v1.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionOneSerializedProject;

	const migration = new OneTwoMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	expect(result.project.version).toBe(2);
});

test('moves name and version to pkgFile', async () => {
	const path = fixtures.find('v1.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionOneSerializedProject;

	const migration = new OneTwoMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	const beforeLibrary = project.patternLibraries[0];
	const afterLibrary = result.project.patternLibraries[0] as any;

	expect(afterLibrary.packageFile.version).toBe(beforeLibrary.version);
	expect(afterLibrary.packageFile.name).toBe(beforeLibrary.name);

	expect(afterLibrary.version).toBeUndefined();
	expect(afterLibrary.name).toBeUndefined();
});

test('renames meetalva-designkit to @meetalva/designkit', async () => {
	const path = fixtures.find('v1-designkit.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionOneSerializedProject;

	const migration = new OneTwoMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	const beforeKit = project.patternLibraries.find(lib => lib.name === 'meetalva-designkit')!;
	const afterKit = result.project.patternLibraries.find(lib => lib.id === beforeKit.id)!;
	expect(afterKit.packageFile.name).toBe('@meetalva/designkit');
});
