import { App } from '../component/container/app';
import { ipcRenderer, webFrame } from 'electron';
import { ServerMessageType } from '../message';
import * as MobX from 'mobx';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { AlvaView, Project, ViewStore } from '../store';

// prevent app zooming
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

const store = ViewStore.getInstance();

ipcRenderer.send('message', { type: 'app-loaded' });

// tslint:disable-next-line
ipcRenderer.on('message', (e: Electron.Event, message: any) => {
	if (!message) {
		return;
	}

	switch (message.type) {
		case ServerMessageType.StartApp: {
			store.setServerPort(message.payload);
			break;
		}
		case ServerMessageType.OpenFileResponse: {
			break;
		}
		case ServerMessageType.CreateNewFileResponse: {
			const project = Project.from(message.payload.contents);
			store.setProject(project);
			store.setActiveView(AlvaView.PageDetail);
		}
	}

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
			if (store.getActiveView() === AlvaView.Pages) {
				// TODO: implement this
				// store.cutSelectedPage();
			}
			if (store.getActiveView() === AlvaView.PageDetail) {
				store.cutSelectedElement();
			}
			break;
		}
		case ServerMessageType.CutPageElement: {
			store.cutElementById(message.payload);
			break;
		}
		case ServerMessageType.Delete: {
			if (store.getActiveView() === AlvaView.Pages) {
				store.removeSelectedPage();
			}
			if (store.getActiveView() === AlvaView.PageDetail) {
				store.removeSelectedElement();
			}
			break;
		}
		case ServerMessageType.DeletePageElement: {
			store.removeElementById(message.payload);
			break;
		}
		case ServerMessageType.Copy: {
			if (store.getActiveView() === AlvaView.Pages) {
				// TODO: implement this
				// store.copySelectedPage();
			}
			if (store.getActiveView() === AlvaView.PageDetail) {
				store.copySelectedElement();
			}
			break;
		}
		case ServerMessageType.CopyPageElement: {
			store.copyElementById(message.payload);
			break;
		}
		case ServerMessageType.Paste: {
			if (store.getActiveView() === AlvaView.Pages) {
				// TODO: implement this
				// store.pasteAfterSelectedPage();
			}
			if (store.getActiveView() === AlvaView.PageDetail) {
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
			if (store.getActiveView() === AlvaView.PageDetail) {
				store.duplicateSelectedElement();
			}
			break;
		}
		case ServerMessageType.DuplicatePageElement: {
			if (store.getActiveView() === AlvaView.PageDetail) {
				store.duplicateElementById(message.payload);
			}
		}
	}
});

MobX.autorun(() => {
	const styleguide = store.getStyleguide();

	if (styleguide) {
		ipcRenderer.send('message', {
			type: 'styleguide-change',
			payload: {}
		});
	}
});

MobX.autorun(() => {
	const project = store.getCurrentProject();
	const currentPage = store.getCurrentPage();

	if (project && currentPage) {
		ipcRenderer.send('message', {
			type: 'page-change',
			payload: {
				pageId: currentPage.getId(),
				pages: project.getPages().map(page => page.toJSON({ forRendering: true }))
			}
		});
	}
});

MobX.autorun(() => {
	const selectedElement = store.getSelectedElement();
	ipcRenderer.send('message', {
		type: 'element-change',
		payload: selectedElement ? selectedElement.getId() : undefined
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
