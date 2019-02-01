import * as T from '@meetalva/types';
import { PlaceholderPosition } from '@meetalva/components';
import { Element } from './element';
import { Pattern } from '../pattern';
import { Project } from '../project';
import { builtinPatternLibrary } from '../pattern-library';
import { PatternBooleanProperty, PatternStringProperty } from '../pattern-property';

jest.mock('../project', () => {
	class MockProject {
		public getBuiltinPatternLibrary() {
			return builtinPatternLibrary;
		}
		public getUserStore() {
			return;
		}
		public getPatternById(id: string) {
			return builtinPatternLibrary.getPatternById(id);
		}
		public getPatternPropertyById(id: string) {
			return builtinPatternLibrary.getPatternPropertyById(id);
		}
	}

	return { Project: MockProject };
});

test('getPropertyValue should reflect initialized propertyValues', () => {
	const project = new Project({} as any);

	const a = Element.from(
		{
			model: T.ModelName.Element,
			dragged: false,
			focused: false,
			highlighted: false,
			id: 'id',
			name: 'name',
			patternId: 'pattern-id',
			placeholderHighlighted: PlaceholderPosition.None,
			containerId: 'container-id',
			contentIds: [],
			open: false,
			forcedOpen: false,
			propertyValues: [['property-id', 'a']],
			role: 'node',
			selected: false
		},
		{ project }
	);

	expect(a.getPropertyValue('property-id')).toBe('a');
});

test('getPropertyValue should reflect initialized propertyValues', () => {
	const project = new Project({} as any);

	const a = Element.from(
		{
			model: T.ModelName.Element,
			dragged: false,
			focused: false,
			highlighted: false,
			id: 'id',
			name: 'name',
			patternId: 'pattern-id',
			placeholderHighlighted: PlaceholderPosition.None,
			containerId: 'container-id',
			contentIds: [],
			open: false,
			forcedOpen: false,
			propertyValues: [['property-id', 'a']],
			role: 'node',
			selected: false
		},
		{ project }
	);

	const b = Element.from(
		{
			model: T.ModelName.Element,
			dragged: false,
			focused: false,
			highlighted: false,
			id: 'id',
			name: 'name',
			patternId: 'pattern-id',
			placeholderHighlighted: PlaceholderPosition.None,
			containerId: 'container-id',
			contentIds: [],
			open: false,
			forcedOpen: false,
			propertyValues: [['property-id', 'b']],
			role: 'node',
			selected: false
		},
		{ project }
	);

	a.update(b);

	expect(a.getPropertyValue('property-id')).toBe('b');
});

test('getPropertyValue should should emit default props', () => {
	const project = new Project({} as any);
	const patternLibrary = project.getBuiltinPatternLibrary();

	const prop = new PatternBooleanProperty({
		contextId: 'toggle',
		inputType: T.PatternPropertyInputType.Default,
		label: 'toggle',
		propertyName: 'toggle',
		defaultValue: true
	});

	const pattern = Pattern.fromDefaults({ propertyIds: [prop.getId()] }, { patternLibrary });

	patternLibrary.addProperty(prop);
	patternLibrary.addPattern(pattern);

	const element = Element.fromPattern(pattern, { dragged: false, contents: [], project });
	const elementProp = element.getProperties()[0]!;
	expect(elementProp.getValue()).toBe(true);
});

test('getPropertyValue should should not emit default props if none given', () => {
	const project = new Project({} as any);
	const patternLibrary = project.getBuiltinPatternLibrary();

	const prop = new PatternStringProperty({
		contextId: 'text',
		inputType: T.PatternPropertyInputType.Default,
		label: 'text',
		propertyName: 'text'
	});

	const pattern = Pattern.fromDefaults({ propertyIds: [prop.getId()] }, { patternLibrary });

	patternLibrary.addProperty(prop);
	patternLibrary.addPattern(pattern);

	const element = Element.fromPattern(pattern, { dragged: false, contents: [], project });
	const elementProp = element.getProperties()[0]!;
	expect(elementProp.getValue()).toBeUndefined();
});
