import * as React from 'react';
import * as RTL from 'react-testing-library';
import { PropertyListContainer } from './property-list';
import * as MobxReact from 'mobx-react';
import { ViewStore } from '../../store';
import { Project, Element, Pattern } from '../../model';
import * as T from '../../types';
import { PatternUnknownProperty } from '../../model/pattern-property/unknown-property';

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

function createUnknownPropElement(project: Project): Element {
	const library = project.getBuiltinPatternLibrary();

	const property = new PatternUnknownProperty({
		contextId: 'unknown',
		group: '',
		hidden: false,
		id: 'unknown',
		inputType: T.PatternPropertyInputType.Default,
		label: 'unknown',
		origin: T.PatternPropertyOrigin.UserProvided,
		propertyName: 'unknown',
		required: false,
		typeText: ''
	});

	library.addProperty(property);

	const propertyIds = [property.getId()];

	const pattern = new Pattern(
		{
			contextId: 'pattern',
			description: '',
			exportName: 'pattern',
			icon: '',
			name: 'Pattern',
			origin: T.PatternOrigin.UserProvided,
			propertyIds,
			slots: [],
			type: T.PatternType.Pattern
		},
		{ patternLibrary: project.getBuiltinPatternLibrary() }
	);

	library.addPattern(pattern);

	return Element.fromPattern(pattern, { dragged: false, contents: [], project });
}
