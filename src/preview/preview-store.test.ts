import * as Model from '../model';
import * as Types from '../types';
import * as uuid from 'uuid';
import { PreviewStore } from './preview-store';
import { ElementArea } from './element-area';

test('get and render element action ids', () => {
	const project = Model.Project.create({
		name: 'test',
		path: 'my/path',
		draft: true
	});
	const library = project.getBuiltinPatternLibrary();
	const linkPattern = library.getPatternByType(Types.PatternType.SyntheticLink);
	const onClickPatternProp = linkPattern.getPropertyByContextId('onClick')!;
	const element = Model.Element.fromPattern(linkPattern, {
		dragged: false,
		contents: [],
		project
	});

	const onClickElProp = element
		.getProperties()
		.find(prop => prop.getPatternProperty() === onClickPatternProp)!;

	const action = Model.ElementAction.from(
		{
			model: Types.ModelName.ElementAction,
			elementPropertyId: element.getId(),
			id: uuid.v4(),
			open: true,
			payload: '',
			payloadType: Types.ElementActionPayloadType.EventPayload,
			storeActionId: uuid.v4(),
			storePropertyId: uuid.v4()
		},
		{ userStore: project.getUserStore() }
	);

	element.setPropertyValue(onClickPatternProp.getId(), [action.getId()]);

	expect(onClickElProp.getValue()).toEqual([action.getId()]);

	const previewStore = new PreviewStore({
		mode: Types.PreviewDocumentMode.Static,
		components: {},
		project,
		synthetics: {},
		selectionArea: new ElementArea(),
		highlightArea: new ElementArea()
	});
	const clickHandlerProps = previewStore.getProperties(element);
	// Todo: get properties on click hanedler
	// execute clickHandler
	// Test if the correct messages are being send.
});
