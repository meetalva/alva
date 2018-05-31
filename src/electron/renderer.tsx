import { App } from '../container/app';
import * as Sender from '../message/client';
import { createMenu } from './create-menu';
import { webFrame } from 'electron';
import { ServerMessageType } from '../message';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import { AlvaApp, EditHistory, PatternLibrary, Project } from '../model';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ViewStore } from '../store';
import * as Types from '../model/types';
import * as uuid from 'uuid';

// prevent app zooming
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

const app = new AlvaApp();
const history = new EditHistory();
const store = new ViewStore({ app, history });

const id = `s${uuid
	.v4()
	.split('-')
	.join('')}`;
// tslint:disable-next-line:no-any
(window as any)[id] = store;
console.log(`Access ViewStore at ${id}`);

Sender.send({
	id: uuid.v4(),
	type: ServerMessageType.AppLoaded,
	payload: undefined
});

// Init messages
Sender.receive(message => {
	switch (message.type) {
		case ServerMessageType.StartApp: {
			app.setState(Types.AppState.Started);
			store.setServerPort(Number(message.payload));
			store.commit();
			break;
		}
		case ServerMessageType.OpenFileResponse: {
			history.clear();
			const newProject = Project.from(message.payload.contents);
			newProject.setPath(message.payload.path);
			store.setProject(newProject);

			const view =
				newProject.getPages().length === 0 ? Types.AlvaView.Pages : Types.AlvaView.PageDetail;

			app.setActiveView(view);

			const patternLibrary = newProject.getPatternLibrary();

			if (patternLibrary.getState() !== Types.PatternLibraryState.Pristine) {
				Sender.send({
					id: uuid.v4(),
					payload: newProject.toJSON(),
					type: ServerMessageType.CheckLibraryRequest
				});
			}

			store.commit();
			break;
		}
		case ServerMessageType.CreateNewFileResponse: {
			history.clear();
			const newProject = Project.from(message.payload.contents);
			store.setProject(newProject);
			app.setActiveView(Types.AlvaView.PageDetail);
			store.commit();
		}
	}
});

// Project-dependent messages
Sender.receive(message => {
	const project = store.getProject();

	if (!project) {
		return;
	}

	switch (message.type) {
		case ServerMessageType.CreateNewPage: {
			const page = store.executePageAddNew();

			if (!page) {
				return;
			}

			store.setActivePage(page);

			if (app.getActiveView() === Types.AlvaView.Pages) {
				page.setNameState(Types.EditState.Editing);
			}
			break;
		}
		case ServerMessageType.ConnectPatternLibraryResponse: {
			const previousLibrary = store.getProject().getPatternLibrary();
			const library = PatternLibrary.import(message.payload, previousLibrary);
			project.setPatternLibrary(library);

			Sender.send({
				id: uuid.v4(),
				payload: {
					id: library.getId(),
					path: message.payload.path
				},
				type: ServerMessageType.ConnectedPatternLibraryNotification
			});

			break;
		}
		case ServerMessageType.CheckLibraryResponse: {
			const library = project.getPatternLibrary();

			message.payload.forEach(check => {
				if (check.id !== library.getId()) {
					return;
				}

				const state = check.connected
					? Types.PatternLibraryState.Connected
					: Types.PatternLibraryState.Disconnected;

				library.setState(state);
			});
			break;
		}
		case ServerMessageType.SelectElement: {
			const element = store.getElementById(message.payload.id);
			if (element) {
				store.setSelectedElement(element);
			}
			break;
		}
		case ServerMessageType.UnselectElement: {
			store.unsetSelectedElement();
		}
	}
});

// Edit messages
// tslint:disable-next-line:cyclomatic-complexity
Sender.receive(message => {
	// Do not perform custom operations when an input is selected
	if (document.activeElement.tagName.toLowerCase() === 'input') {
		return;
	}

	switch (message.type) {
		case ServerMessageType.Undo: {
			store.undo();
			break;
		}
		case ServerMessageType.Redo: {
			store.redo();
			break;
		}
		case ServerMessageType.Cut: {
			if (app.getActiveView() === Types.AlvaView.Pages) {
				// TODO: implement this
				// store.cutSelectedPage();
			}
			if (app.getActiveView() === Types.AlvaView.PageDetail) {
				store.executeElementCutSelected();
			}
			break;
		}
		case ServerMessageType.CutElement: {
			store.executeElementCutById(message.payload);
			break;
		}
		case ServerMessageType.Delete: {
			if (app.getActiveView() === Types.AlvaView.Pages) {
				store.executePageRemoveSelected();
			}
			if (app.getActiveView() === Types.AlvaView.PageDetail) {
				store.executeElementRemoveSelected();
			}
			break;
		}
		case ServerMessageType.DeleteElement: {
			store.executeElementRemoveById(message.payload);
			break;
		}
		case ServerMessageType.Copy: {
			if (app.getActiveView() === Types.AlvaView.Pages) {
				// TODO: implement this
				// store.copySelectedPage();
			}
			if (app.getActiveView() === Types.AlvaView.PageDetail) {
				store.copySelectedElement();
			}
			break;
		}
		case ServerMessageType.CopyElement: {
			store.copyElementById(message.payload);
			break;
		}
		case ServerMessageType.Paste: {
			if (app.getActiveView() === Types.AlvaView.Pages) {
				// TODO: implement this
				// store.pasteAfterSelectedPage();
			}
			if (app.getActiveView() === Types.AlvaView.PageDetail) {
				store.executeElementPasteAfterSelected();
			}
			break;
		}
		case ServerMessageType.PasteElementBelow: {
			store.executeElementPasteAfterById(message.payload);
			break;
		}
		case ServerMessageType.PasteElementInside: {
			store.executeElementPasteInsideById(message.payload);
			break;
		}
		case ServerMessageType.Duplicate: {
			if (app.getActiveView() === Types.AlvaView.PageDetail) {
				store.executeElementDuplicateSelected();
			}
			break;
		}
		case ServerMessageType.DuplicateElement: {
			if (app.getActiveView() === Types.AlvaView.PageDetail) {
				store.executeElementDuplicateById(message.payload);
			}
		}
	}
});

Mobx.autorunAsync(() => {
	const usedLibrary = store.getUsedPatternLibrary();
	const patternLibrary = store.getPatternLibrary();

	if (patternLibrary && usedLibrary && PatternLibrary.isEqual(patternLibrary, usedLibrary)) {
		return;
	}

	store.setUsedPatternLibrary(patternLibrary);
	store.unsetClipboardItem();

	if (patternLibrary) {
		Sender.send({
			id: uuid.v4(),
			payload: patternLibrary.toJSON(),
			type: ServerMessageType.PatternLibraryChange
		});
	}
});

Mobx.autorunAsync(() => {
	const project = store.getProject();
	const currentPage = store.getCurrentPage();

	if (project && currentPage) {
		const payload = {
			pageId: currentPage.getId(),
			pages: project.getPages().map(page => page.toJSON()),
			elementContents: project
				.getElementContents()
				.map(elementContent => elementContent.toJSON()),
			elements: project.getElements().map(element => element.toJSON())
		};

		// tslint:disable-next-line:no-any
		(window as any).requestIdleCallback(() => {
			Sender.send({
				id: uuid.v4(),
				payload,
				type: ServerMessageType.PageChange
			});
		});
	}
});

Mobx.autorunAsync(() => {
	const selectedElement = store.getSelectedElement();
	Sender.send({
		id: uuid.v4(),
		payload: selectedElement ? selectedElement.getId() : undefined,
		type: ServerMessageType.ElementChange
	});
});

Mobx.autorunAsync(() => {
	const project = store.getProject();
	const patternLibrary = store.getPatternLibrary();
	const page = store.getCurrentPage();

	createMenu({
		page,
		patternLibrary,
		project,
		store
	});
});

Mobx.autorunAsync(() => {
	const project = store.getProject();
	const savedProjects = store.getSavedProjects();
	const savedProject = savedProjects[savedProjects.length - 1];

	if (savedProject && Project.isEqual(savedProject, project.toDisk())) {
		return;
	}

	if (project) {
		const serializedProject = project.toJSON();
		store.addSavedProject(project);

		const payload = {
			path: project.getPath(),
			project: serializedProject
		};

		Sender.send({
			id: uuid.v4(),
			payload,
			type: ServerMessageType.Save
		});
	}
});

ReactDom.render(
	<MobxReact.Provider app={app} store={store}>
		<App />
	</MobxReact.Provider>,
	document.getElementById('app')
);

// Disable drag and drop from outside the application
document.addEventListener(
	'dragenter',
	event => {
		event.preventDefault();
	},
	false
);
document.addEventListener(
	'dragover',
	event => {
		event.dataTransfer.dropEffect = 'none';
		event.preventDefault();
	},
	false
);
document.addEventListener(
	'drop',
	event => {
		event.preventDefault();
	},
	false
);
