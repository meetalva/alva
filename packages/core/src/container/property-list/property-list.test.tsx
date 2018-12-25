import * as React from 'react';
import * as RTL from 'react-testing-library';
import { PropertyListContainer } from './property-list';
import * as MobxReact from 'mobx-react';
import { ViewStore } from '../../store';
import { Project, Element, Pattern, PatternLibrary } from '../../model';
import * as T from '../../types';
import {
	PatternUnknownProperty,
	PatternUnknownPropertyInit
} from '../../model/pattern-property/unknown-property';

// tslint:disable-next-line:no-submodule-imports
require('jest-dom/extend-expect');

jest.mock('../../store');

test('executes toggleCodeDetails on click', async () => {
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

// TODO: Find out how previous test may leak
test.skip('does not render code details for hidden props', () => {
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
			icon: '',
			name: 'Pattern',
			origin: T.PatternOrigin.UserProvided,
			propertyIds: [property.getId()],
			slots: [],
			type: T.PatternType.Pattern
		},
		{ patternLibrary: library }
	);

	library.addPattern(pattern);

	return Element.fromPattern(pattern, { dragged: false, contents: [], project });
}
