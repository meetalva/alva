import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as ReactTest from 'react-testing-library';
import { ElementList } from './element-list';
import { ViewStore } from '../../store';
import * as Model from '../../model';
import * as Type from '../../types';
import { Sender } from '../../sender';

jest.mock('../../sender');

/**
 * TODO: Initializing a project fragment should be as easy as
 *
 * const project = Project.fromFragment(
 *   <Builtin.Page>
 *     <Builtin.Conditional ifTrue={<Builtin.Text></Builtin.Text>}/>
 *   </Builtin.Page>
 * );
 */
test('un-highlight highlighted element content onDragLeave', () => {
	const sender = new Sender({ endpoint: '' });
	const app = new Model.AlvaApp(Model.AlvaApp.Defaults, { sender });
	const history = new Model.EditHistory();
	const libraryStore = new Model.LibraryStore();

	const store = new ViewStore({ app, history, sender, libraryStore });

	const project = Model.Project.create({
		name: '',
		path: '',
		draft: true
	});

	store.setProject(project);

	const page = store.getActivePage()!.getRoot()!;
	const content = page.getContentBySlotType(Type.SlotType.Children)!;

	const pattern = project
		.getBuiltinPatternLibrary()
		.getPatternByType(Type.PatternType.SyntheticConditional);

	const element = Model.Element.fromPattern(pattern, {
		dragged: false,
		project,
		contents: []
	});

	element.setOpen(true);
	content.insert({ at: 0, element });
	project.addElement(element);

	const truthySlot = pattern.getSlotByContextId('truthy')!;

	const truthyContent = Model.ElementContent.fromSlot(truthySlot, { project });
	truthyContent.setOpen(true);
	truthyContent.setHighlighted(true);

	element.addContent(truthyContent);
	project.addElementContent(truthyContent);

	const textPattern = project
		.getBuiltinPatternLibrary()
		.getPatternByType(Type.PatternType.SyntheticText);

	const slottedElement = Model.Element.fromPattern(textPattern, {
		project,
		dragged: false,
		contents: []
	});

	truthyContent.insert({
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

	const slotContentId = truthyContent.getId();
	const slotDomElement = document.querySelector(`[data-content-id="${slotContentId}"]`)!;

	expect(truthyContent.getHighlighted()).toEqual(true);
	ReactTest.fireEvent.dragLeave(slotDomElement);
	expect(truthyContent.getHighlighted()).toEqual(false);
});
