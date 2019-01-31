import * as Fs from 'fs';
import * as Yaml from 'js-yaml';
import * as Util from 'util';
import { TwoThreeMigration } from './migration-v2-v3';
import * as T from '@meetalva/types';
import * as Model from '@meetalva/model';
import { IdHasher } from '../../../analyzer';

const readFile = Util.promisify(Fs.readFile);
const fixtures = require('fixturez')(__dirname);

test('increments version to 3', async () => {
	const path = fixtures.find('v2.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionTwoSerializedProject;

	const migration = new TwoThreeMigration();

	const result = await migration.transform({
		project,
		steps: []
	});

	expect(result.project.version).toBe(3);
});

test('replaces pattern ids', async () => {
	const path = fixtures.find('v2.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionTwoSerializedProject;
	const migration = new TwoThreeMigration();

	const beforeProject = Model.Project.from({ ...project, draft: true, path: 'path' });
	const beforeLibrary = beforeProject.getBuiltinPatternLibrary();
	const beforeTextPattern = beforeLibrary.getPatternByType(T.PatternType.SyntheticText);

	const result = await migration.transform({
		project,
		steps: []
	});

	const textPattern = result.project.patternLibraries[0].patterns.find(
		p => p.type === T.PatternType.SyntheticText
	)!;
	expect(textPattern.id).toBe(IdHasher.getGlobalPatternId(beforeTextPattern.getContextId()));
});

test('replaces patterns ids in elements', async () => {
	const path = fixtures.find('v2-content.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionTwoSerializedProject;
	const migration = new TwoThreeMigration();

	const beforeProject = Model.Project.from({ ...project, draft: true, path: 'path' });
	const beforeLibrary = beforeProject.getBuiltinPatternLibrary();
	const beforeTextPattern = beforeLibrary.getPatternByType(T.PatternType.SyntheticText);

	const beforeElement = beforeProject.getElementsByPattern(beforeTextPattern)[0]!;
	const patternId = IdHasher.getGlobalPatternId(beforeElement.getPattern()!.getContextId());

	const result = await migration.transform({
		project,
		steps: []
	});

	const element = result.project.elements.find(e => e.patternId === patternId)!;
	expect(element.id).toBe(beforeElement.getId());
});

test('replaces property ids in elements', async () => {
	const path = fixtures.find('v2-content.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionTwoSerializedProject;
	const migration = new TwoThreeMigration();

	const beforeProject = Model.Project.from({ ...project, draft: true, path: 'path' });
	const beforeLibrary = beforeProject.getBuiltinPatternLibrary();
	const beforeTextPattern = beforeLibrary.getPatternByType(T.PatternType.SyntheticText);
	const beforeTextProp = beforeTextPattern.getPropertyByContextId('text')!;

	const beforeElement = beforeProject.getElementsByPattern(beforeTextPattern)[0]!;
	const beforePropValue = beforeElement.getPropertyValue(beforeTextProp.getId());

	const patternId = IdHasher.getGlobalPatternId(beforeTextPattern.getContextId());
	const propId = IdHasher.getGlobalPropertyId(patternId, beforeTextProp.getContextId());

	const result = await migration.transform({
		project,
		steps: []
	});

	const element = result.project.elements.find(e => e.id === beforeElement.getId())!;
	const elementProp = element.propertyValues.find(([id]) => id === propId);

	expect(elementProp).not.toBeUndefined();
	expect(elementProp![1]).toBe(beforePropValue);
});

test('replaces slot ids in element contents', async () => {
	const path = fixtures.find('v2-content.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionTwoSerializedProject;
	const migration = new TwoThreeMigration();

	const beforeProject = Model.Project.from({ ...project, draft: true, path: 'path' });
	const beforeLibrary = beforeProject.getBuiltinPatternLibrary();
	const beforeBoxPattern = beforeLibrary.getPatternByType(T.PatternType.SyntheticBox);

	const beforeElement = beforeProject.getElementsByPattern(beforeBoxPattern)[0]!;
	const beforeContent = beforeElement.getContentBySlotType(T.SlotType.Children)!;

	const patternId = IdHasher.getGlobalPatternId(beforeElement.getPattern()!.getContextId());
	const slotId = IdHasher.getGlobalSlotId(patternId, beforeContent.getSlot()!.getContextId());

	const result = await migration.transform({
		project,
		steps: []
	});

	const content = result.project.elementContents.find(ec => ec.id === beforeContent.getId())!;
	expect(content.slotId).toBe(slotId);
});

test('replaces slot ids in element props', async () => {
	const path = fixtures.find('v2-content.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionTwoSerializedProject;
	const migration = new TwoThreeMigration();

	const beforeProject = Model.Project.from({ ...project, draft: true, path: 'path' });
	const beforeLibrary = beforeProject.getBuiltinPatternLibrary();
	const beforeConditionalPattern = beforeLibrary.getPatternByType(
		T.PatternType.SyntheticConditional
	);

	const beforeElement = beforeProject.getElementsByPattern(beforeConditionalPattern)[0]!;
	const beforeContents = beforeProject
		.getElementContents()
		.filter(c => c.getParentElement() === beforeElement)!;

	const patternId = IdHasher.getGlobalPatternId(beforeConditionalPattern.getContextId());
	const slotIds = beforeContents.map(c =>
		IdHasher.getGlobalSlotId(patternId, c.getSlot()!.getContextId())
	);

	const result = await migration.transform({
		project,
		steps: []
	});

	const afterContents = result.project.elementContents
		.filter(ec => beforeContents.some(bc => bc.getId() === ec.id))
		.map(content => content.slotId);

	expect(slotIds).toEqual(afterContents);
});

test('replaces property ids in user store references', async () => {
	const path = fixtures.find('v2-user-property.alva');
	const project = Yaml.load(await readFile(path, 'utf-8')) as T.VersionTwoSerializedProject;

	const migration = new TwoThreeMigration();

	const beforeProject = Model.Project.from({ ...project, draft: true, path: 'path' });
	const beforeLibrary = beforeProject.getBuiltinPatternLibrary();
	const beforeTextPattern = beforeLibrary.getPatternByType(T.PatternType.SyntheticText);
	const beforeTextPatternProp = beforeTextPattern.getPropertyByContextId('text')!;

	const patternId = IdHasher.getGlobalPatternId(beforeTextPattern.getContextId());
	const propId = IdHasher.getGlobalPropertyId(patternId, beforeTextPatternProp.getContextId());

	const result = await migration.transform({
		project,
		steps: []
	});

	const afterProject = Model.Project.from({
		...result.project,
		draft: true,
		path: ''
	});

	const textElement = Model.Element.from(
		result.project.elements.find(e => e.patternId === patternId)!,
		{
			project: afterProject
		}
	);

	expect(textElement.getPattern()).toBeDefined();

	const textProp = textElement.getProperties().find(p => p.getPatternPropertyId() === propId)!;
	expect(textProp).toBeDefined();

	const refs = result.project.userStore.references;

	expect(refs).toContainEqual(
		expect.objectContaining({
			elementPropertyId: textProp.getId()
		})
	);
});
