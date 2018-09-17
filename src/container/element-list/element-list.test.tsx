import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as ReactTest from 'react-testing-library';
import { ElementList } from './element-list';
import { ViewStore } from '../../store';
import * as Model from '../../model';
import * as Type from '../../types';
import { Sender } from '../../sender/client';
import * as uuid from 'uuid';

jest.mock('../../sender/client');

test('un-highlight highlighted element content onDragLeave', () => {
	const app = new Model.AlvaApp();
	const history = new Model.EditHistory();
	const sender = new Sender({
		endpoint: ''
	});

	const store = new ViewStore({
		app,
		history,
		sender
	});

	const project = Model.Project.create({
		name: '',
		path: '',
		draft: true
	});

	store.setProject(project);

	// tslint:disable-next-line:no-non-null-assertion
	const rootElement = store.getActivePage()!.getRoot()!;
	// tslint:disable-next-line:no-non-null-assertion
	const rootElementChildrenContent = rootElement.getContentBySlotType(Type.SlotType.Children)!;

	const conditionalPattern = project
		.getBuiltinPatternLibrary()
		.getPatternByType(Type.PatternType.SyntheticConditional);
	const conditionalElement = new Model.Element(
		{
			patternId: conditionalPattern.getId(),
			containerId: rootElementChildrenContent.getId(),
			focused: false,
			dragged: false,
			contentIds: [],
			selected: true,
			open: true,
			highlighted: false,
			propertyValues: [],
			forcedOpen: false,
			placeholderHighlighted: false
		},
		{
			project
		}
	);

	rootElementChildrenContent.insert({
		at: 0,
		element: conditionalElement
	});

	project.addElement(conditionalElement);

	// tslint:disable-next-line:no-non-null-assertion
	const conditionalIfTrueSlot = conditionalPattern
		.getSlots()
		.find(slot => slot.getPropertyName() === 'ifTrue')!;
	// tslint:disable-next-line:no-non-null-assertion
	const conditionalIfTrueContent = new Model.ElementContent(
		{
			elementIds: [],
			forcedOpen: false,
			highlighted: true,
			id: uuid.v4(),
			open: true,
			parentElementId: conditionalElement.getId(),
			slotId: conditionalIfTrueSlot.getId()
		},
		{
			project
		}
	);

	conditionalElement.addContent(conditionalIfTrueContent);
	project.addElementContent(conditionalIfTrueContent);

	const textPattern = project
		.getBuiltinPatternLibrary()
		.getPatternByType(Type.PatternType.SyntheticText);
	const slottedElement = new Model.Element(
		{
			patternId: textPattern.getId(),
			containerId: conditionalIfTrueContent.getId(),
			focused: false,
			dragged: true,
			contentIds: [],
			selected: true,
			open: false,
			highlighted: true,
			propertyValues: [],
			forcedOpen: false,
			placeholderHighlighted: false
		},
		{
			project
		}
	);

	conditionalIfTrueContent.insert({
		at: 0,
		element: slottedElement
	});

	project.addElement(slottedElement);

	const input = (
		<>
			<MobxReact.Provider store={store}>
				<ElementList />
			</MobxReact.Provider>
		</>
	);

	const result = ReactTest.render(input);
	const document = result.container;

	const slotContentId = conditionalIfTrueContent.getId();
	const slotDomElement = document.querySelector(
		`[data-content-id="${slotContentId}"]`
	) as HTMLElement;

	expect(conditionalIfTrueContent.getHighlighted()).toEqual(true);

	ReactTest.fireEvent.dragLeave(slotDomElement);

	expect(conditionalIfTrueContent.getHighlighted()).toEqual(false);
});
