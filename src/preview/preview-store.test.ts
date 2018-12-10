import * as Model from '../model';
import * as Types from '../types';
import { ElementArea } from './element-area';
import { getComponents } from './get-components';
import { ViewStore } from '../store';
import { Sender } from '../sender';
import { PreviewStore, SyntheticComponents } from './preview-store';

jest.mock('../sender');

test('get and render element actions', () => {
	const app = new Model.AlvaApp(Model.AlvaApp.Defaults, { sender: {} as any });
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

	const mode = Types.PreviewDocumentMode.Static;
	const inputMock = Model.Element.from(
		{
			model: Types.ModelName.Element,
			dragged: false,
			focused: false,
			highlighted: false,
			id: 'id',
			name: 'name',
			patternId: 'pattern-id',
			placeholderHighlighted: false,
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
	project.addElement(inputMock);

	const components = getComponents(project);
	// tslint:disable-next-line:no-object-literal-type-assertion
	const synthetics = {} as SyntheticComponents<{}>;

	const previewStore = new PreviewStore({
		mode,
		components,
		project,
		synthetics,
		selectionArea: new ElementArea(),
		highlightArea: new ElementArea()
	});

	console.log(previewStore, '&&&&&&');
});
