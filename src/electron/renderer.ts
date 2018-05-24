import { App } from '../container/app';
import * as Sender from '../message/client';
import { createMenu } from './create-menu';
import { webFrame } from 'electron';
import { ServerMessageType } from '../message';
import * as Mobx from 'mobx';
import { Project } from '../model';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ViewStore } from '../store';
import * as Types from '../model/types';
import * as uuid from 'uuid';

// prevent app zooming
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

const store = ViewStore.getInstance();

Sender.send({
	id: uuid.v4(),
	type: ServerMessageType.AppLoaded,
	payload: undefined
});

Sender.receive(message => {
	// Initilazing messages
	switch (message.type) {
		case ServerMessageType.StartApp: {
			store.setAppState(Types.AppState.Started);
			store.setServerPort(Number(message.payload));
			break;
		}
		case ServerMessageType.OpenFileResponse: {
			const newProject = Project.from(message.payload.contents);
			newProject.setPath(message.payload.path);
			store.setProject(newProject);

			const view =
				newProject.getPages().length === 0 ? Types.AlvaView.Pages : Types.AlvaView.PageDetail;

			store.setActiveView(view);

			const patternLibrary = newProject.getPatternLibrary();

			if (patternLibrary.getState() !== Types.PatternLibraryState.Pristine) {
				Sender.send({
					id: uuid.v4(),
					payload: newProject.toJSON(),
					type: ServerMessageType.CheckLibraryRequest
				});
			}

			break;
		}
		case ServerMessageType.CreateNewFileResponse: {
			const newProject = Project.from(message.payload.contents);
			store.setProject(newProject);
			store.setActiveView(Types.AlvaView.PageDetail);
		}
	}
});

Sender.receive(message => {
	const project = store.getProject();

	if (!project) {
		return;
	}

	switch (message.type) {
		case ServerMessageType.CreateNewPage: {
			const page = store.addNewPage();

			if (!page) {
				return;
			}

			store.setActivePage(page);

			if (store.getActiveView() === Types.AlvaView.Pages) {
				page.setNameState(Types.EditState.Editing);
			}
			break;
		}
		case ServerMessageType.ConnectPatternLibraryResponse: {
			const library = project.getPatternLibrary();
			library.import(message.payload);

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
		}
	}
});

// tslint:disable-next-line:cyclomatic-complexity
Sender.receive(message => {
	// Do not perform custom operations
	// if anything on the page has focus
	if (document.activeElement !== document.body) {
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
			if (store.getActiveView() === Types.AlvaView.Pages) {
				// TODO: implement this
				// store.cutSelectedPage();
			}
			if (store.getActiveView() === Types.AlvaView.PageDetail) {
				store.cutSelectedElement();
			}
			break;
		}
		case ServerMessageType.CutPageElement: {
			store.cutElementById(message.payload);
			break;
		}
		case ServerMessageType.Delete: {
			if (store.getActiveView() === Types.AlvaView.Pages) {
				store.removeSelectedPage();
			}
			if (store.getActiveView() === Types.AlvaView.PageDetail) {
				store.removeSelectedElement();
			}
			break;
		}
		case ServerMessageType.DeletePageElement: {
			store.removeElementById(message.payload);
			break;
		}
		case ServerMessageType.Copy: {
			if (store.getActiveView() === Types.AlvaView.Pages) {
				// TODO: implement this
				// store.copySelectedPage();
			}
			if (store.getActiveView() === Types.AlvaView.PageDetail) {
				store.copySelectedElement();
			}
			break;
		}
		case ServerMessageType.CopyPageElement: {
			store.copyElementById(message.payload);
			break;
		}
		case ServerMessageType.Paste: {
			if (store.getActiveView() === Types.AlvaView.Pages) {
				// TODO: implement this
				// store.pasteAfterSelectedPage();
			}
			if (store.getActiveView() === Types.AlvaView.PageDetail) {
				store.pasteAfterSelectedElement();
			}
			break;
		}
		case ServerMessageType.PastePageElementBelow: {
			store.pasteAfterElementById(message.payload);
			break;
		}
		case ServerMessageType.PastePageElementInside: {
			store.pasteInsideElementById(message.payload);
			break;
		}
		case ServerMessageType.Duplicate: {
			if (store.getActiveView() === Types.AlvaView.PageDetail) {
				store.duplicateSelectedElement();
			}
			break;
		}
		case ServerMessageType.DuplicatePageElement: {
			if (store.getActiveView() === Types.AlvaView.PageDetail) {
				store.duplicateElementById(message.payload);
			}
		}
	}
});

Mobx.autorun(() => {
	const patternLibrary = store.getPatternLibrary();

	if (patternLibrary) {
		Sender.send({
			id: uuid.v4(),
			payload: patternLibrary.toJSON(),
			type: ServerMessageType.PatternLibraryChange
		});
	}
});

Mobx.autorun(() => {
	const project = store.getProject();
	const currentPage = store.getCurrentPage();

	if (project && currentPage) {
		Sender.send({
			id: uuid.v4(),
			payload: {
				pageId: currentPage.getId(),
				pages: project.getPages().map(page => page.toJSON()),
				elementContents: project
					.getElementContents()
					.map(elementContent => elementContent.toJSON()),
				elements: project.getElements().map(element => element.toJSON())
			},
			type: ServerMessageType.PageChange
		});
	}
});

Mobx.autorun(() => {
	const selectedElement = store.getSelectedElement();
	Sender.send({
		id: uuid.v4(),
		payload: selectedElement ? selectedElement.getId() : undefined,
		type: ServerMessageType.ElementChange
	});
});

Mobx.autorun(() => {
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

ReactDom.render(React.createElement(App), document.getElementById('app'));

// Disable drag and drop from outside the application
document.addEventListener(
	'dragover',
	event => {
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
