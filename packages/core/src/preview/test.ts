import * as Model from '../model';
import * as Types from '../types';
import * as uuid from 'uuid';
import { PreviewStore } from './preview-store';
import { ElementArea } from './element-area';

export function createAction({
	project,
	element
}: {
	project: Model.Project;
	element: Model.Element;
}): { action: Model.ElementAction } {
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

	project.addElementAction(action);

	return { action };
}

export function createElementWithProject(): { project: Model.Project; element: Model.Element } {
	const project = Model.Project.create({
		name: 'test',
		path: 'my/path',
		draft: true
	});

	const library = project.getBuiltinPatternLibrary();
	const linkPattern = library.getPatternByType(Types.PatternType.SyntheticLink);

	const element = Model.Element.fromPattern(linkPattern, {
		dragged: false,
		contents: [],
		project
	});

	project.addElement(element);

	return { project, element };
}

export function getRenderProperties({
	project,
	element
}: {
	project: Model.Project;
	element: Model.Element;
}): { [key: string]: any } {
	const previewStore = new PreviewStore({
		mode: Types.PreviewDocumentMode.Static,
		components: {},
		project,
		selectionArea: new ElementArea(),
		highlightArea: new ElementArea()
	});

	return previewStore.getProperties(element);
}
