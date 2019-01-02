import { Element } from './element';
import { Project } from '../project';
import { ModelName } from '../../types';
import { PlaceholderPosition } from '../../components';

jest.mock('../project', () => {
	class MockProject {
		public getPatternById() {
			return undefined;
		}
	}

	return { Project: MockProject };
});

test('getPropertyValue should reflect initialized propertyValues', () => {
	const project = new Project({} as any);

	const a = Element.from(
		{
			model: ModelName.Element,
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
			model: ModelName.Element,
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
			model: ModelName.Element,
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
