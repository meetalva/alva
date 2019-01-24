import * as Fs from 'fs';
import * as Yaml from 'js-yaml';
import * as Util from 'util';
import { ZeroOneMigration } from './migration-v0-v1';
import * as T from '../types';
import * as M from '../model';
import { builtinPatternLibrary } from '../model';

const readFile = Util.promisify(Fs.readFile);
const fixtures = require('fixturez')(__dirname);

test('increments version to 1', async () => {
	const path = fixtures.find('v0.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionZeroSerializedProject;
	const migration = new ZeroOneMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	expect(result.project.version).toBe(1);
});

test('replaces element pattern ids', async () => {
	const path = fixtures.find('v0.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionZeroSerializedProject;
	const box = builtinPatternLibrary.getPatternByType(T.PatternType.SyntheticBox);
	const text = builtinPatternLibrary.getPatternByType(T.PatternType.SyntheticText);

	const migration = new ZeroOneMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	expect(result.project.elements).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				patternId: box.getId()
			}),
			expect.objectContaining({
				patternId: text.getId()
			})
		])
	);
});

test('replaces element pattern property id refs', async () => {
	const path = fixtures.find('v0.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionZeroSerializedProject;
	const boxPattern = builtinPatternLibrary.getPatternByType(T.PatternType.SyntheticBox);
	const widthPatternProp = boxPattern.getPropertyByContextId('width')!;
	const heigthPatternProp = boxPattern.getPropertyByContextId('height')!;
	const backgroundPatternProp = boxPattern.getPropertyByContextId('backgroundColor')!;

	const migration = new ZeroOneMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	const boxElement = result.project.elements.find(e => e.patternId === boxPattern.getId())!;

	expect(boxElement.propertyValues).toEqual(
		expect.arrayContaining([
			[widthPatternProp.getId(), '100px'],
			[heigthPatternProp.getId(), '100px'],
			[backgroundPatternProp.getId(), '#eee']
		])
	);
});

test('replaces element content slot ids', async () => {
	const path = fixtures.find('v0.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionZeroSerializedProject;
	const boxPattern = builtinPatternLibrary.getPatternByType(T.PatternType.SyntheticBox)!;
	const childrenSlot = boxPattern.getSlotByContextId('children')!;

	const migration = new ZeroOneMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	const boxElement = result.project.elements.find(e => e.patternId === boxPattern.getId())!;
	const boxContent = result.project.elementContents.find(
		c => c.parentElementId === boxElement.id
	)!;

	expect(boxContent.slotId).toBe(childrenSlot.getId());
});

test('replaces element property slot ids', async () => {
	const path = fixtures.find('v0-conditional.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionZeroSerializedProject;
	const syntheticConditional = builtinPatternLibrary.getPatternByType(
		T.PatternType.SyntheticConditional
	);
	const truthySlot = syntheticConditional.getSlotByContextId('truthy')!;
	const falsySlot = syntheticConditional.getSlotByContextId('falsy')!;

	const migration = new ZeroOneMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	const conditionalElement = result.project.elements.find(
		e => e.patternId === syntheticConditional.getId()
	)!;
	const contents = result.project.elementContents.filter(
		c => c.parentElementId === conditionalElement.id
	);

	expect(contents.map(c => c.slotId)).toEqual(
		expect.arrayContaining([truthySlot.getId(), falsySlot.getId()])
	);
});

test('replaces old pattern library with new one', async () => {
	const path = fixtures.find('v0.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionZeroSerializedProject;
	const oldLibrary = project.patternLibraries.find(
		p => p.origin === T.PatternLibraryOrigin.BuiltIn
	)!;

	const migration = new ZeroOneMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	expect(result.project.patternLibraries).not.toContainEqual(
		expect.objectContaining({
			id: oldLibrary.id
		})
	);

	expect(result.project.patternLibraries).toContainEqual(
		expect.objectContaining({
			id: builtinPatternLibrary.getId()
		})
	);
});

test('replaces property ids in user store references', async () => {
	const path = fixtures.find('v0-user-property.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionZeroSerializedProject;

	const textPattern = builtinPatternLibrary.getPatternByType(T.PatternType.SyntheticText);
	const textPatternProp = textPattern.getPropertyByContextId('text')!;

	const migration = new ZeroOneMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	const textElement = M.Element.from(
		result.project.elements.find(e => e.patternId === textPattern.getId())!,
		{
			project: M.Project.from({
				...result.project,
				draft: true,
				path: ''
			})
		}
	);

	const textProp = textElement
		.getProperties()
		.find(p => p.getPatternPropertyId() === textPatternProp.getId())!;
	const refs = result.project.userStore.references;

	expect(refs).toContainEqual(
		expect.objectContaining({
			elementPropertyId: textProp.getId()
		})
	);
});
