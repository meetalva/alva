import { App } from '../container/app';
import * as Sender from '../message/client';
import { webFrame } from 'electron';
import { ServerMessageType } from '../message';
import * as MobX from 'mobx';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Project, ViewStore } from '../store';
import * as Types from '../store/types';
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
			store.setServerPort(Number(message.payload));
			break;
		}
		case ServerMessageType.OpenFileResponse: {
			const newProject = Project.from(message.payload.contents);
			newProject.setPath(message.payload.path);

			store.setProject(newProject);
			store.setActiveView(Types.AlvaView.PageDetail);
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
	const project = store.getCurrentProject();

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

MobX.autorun(() => {
	const styleguide = store.getStyleguide();

	if (styleguide) {
		Sender.send({
			id: uuid.v4(),
			payload: styleguide.toJSON(),
			type: ServerMessageType.StyleGuideChange
		});
	}
});

MobX.autorun(() => {
	const project = store.getCurrentProject();
	const currentPage = store.getCurrentPage();

	if (project && currentPage) {
		Sender.send({
			id: uuid.v4(),
			payload: {
				pageId: currentPage.getId(),
				pages: project.getPages().map(page => page.toJSON({ forRendering: true }))
			},
			type: ServerMessageType.PageChange
		});
	}
});

MobX.autorun(() => {
	const selectedElement = store.getSelectedElement();
	Sender.send({
		id: uuid.v4(),
		payload: selectedElement ? selectedElement.getId() : undefined,
		type: ServerMessageType.ElementChange
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
