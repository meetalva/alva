import * as React from 'react';
import * as RTL from 'react-testing-library';
import { PropertyListContainer } from './property-list';
import * as MobxReact from 'mobx-react';
import { ViewStore } from '../../store';
import { Project, Element, Pattern, PatternLibrary } from '@meetalva/model';
import * as T from '@meetalva/types';
import { PatternUnknownProperty, PatternUnknownPropertyInit } from '@meetalva/model';

// tslint:disable-next-line:no-submodule-imports
import 'jest-dom/extend-expect';

// tslint:disable-next-line:no-submodule-imports
import 'react-testing-library/cleanup-after-each';

jest.mock('../../store');

test.skip('executes toggleCodeDetails on click', async () => {
	const project = Project.create({
		name: 'Project',
		draft: true,
		path: ''
	});

	const element = createUnknownPropElement(project);

	const store = new ViewStore({} as any);
	store.getSelectedElement = () => element;

	const onClick = jest.fn();

	const rendered = RTL.render(
		<MobxReact.Provider store={store}>
			<PropertyListContainer onClick={onClick} />
		</MobxReact.Provider>
	);

	const details = rendered.queryByText('Code Properties');

	expect(details).not.toBeNull();
	RTL.fireEvent.click(details!);

	expect(onClick).toHaveBeenCalled();
});

test('does not render code details for hidden props', () => {
	const project = Project.create({
		name: 'Project',
		draft: true,
		path: ''
	});

	const element = createUnknownPropElement(project, {
		property: {
			hidden: true
		}
	});

	const store = new ViewStore({} as any);
	store.getSelectedElement = () => element;

	const rendered = RTL.render(
		<MobxReact.Provider store={store}>
			<PropertyListContainer />
		</MobxReact.Provider>
	);

	const details = rendered.queryByText('Code Properties');

	expect(details).toBeNull();
});

interface Mixins {
	property?: Partial<PatternUnknownPropertyInit>;
}

function createUnknownPropElement(project: Project, mixins?: Mixins): Element {
	const library = PatternLibrary.fromDefaults();

	project.addPatternLibrary(library);

	const propMix = mixins && mixins.property ? mixins.property : {};
	const property = PatternUnknownProperty.fromDefaults(propMix);

	library.addProperty(property);

	const pattern = new Pattern(
		{
			contextId: 'pattern',
			description: '',
			exportName: 'pattern',
			group: '',
			icon: '',
			name: 'Pattern',
			propertyIds: [property.getId()],
			slots: [],
			type: T.PatternType.Pattern
		},
		{ patternLibrary: library }
	);

	library.addPattern(pattern);

	return Element.fromPattern(pattern, { dragged: false, contents: [], project });
}
