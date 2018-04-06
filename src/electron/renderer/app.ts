import { App } from '../../component/container/app';
import { ipcRenderer, webFrame, WebviewTag } from 'electron';
import { JsonObject } from '../../store/json';
import * as MobX from 'mobx';
import { Page } from '../../store/page/page';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from '../../store/store';

// prevent app zooming
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

const store: Store = Store.getInstance();
store.openFromPreferences();

ipcRenderer.on('preview-ready', (readyEvent: {}, readyMessage: JsonObject) => {
	function sendWebViewMessage(message: JsonObject, channel: string): void {
		const webviewTag: WebviewTag = document.getElementById('preview') as WebviewTag;
		if (webviewTag && webviewTag.send) {
			webviewTag.send(channel, message);
		}
	}

	global.setTimeout(() => {
		MobX.autorun(() => {
			const styleguide = store.getStyleguide();
			const message: JsonObject = {
				analyzerName: store.getAnalyzerName(),
				projects: store.getProjects().map(project => project.toJsonObject()),
				styleguidePath: styleguide ? styleguide.getPath() : undefined
			};

			sendWebViewMessage(message, 'styleguide-change');
		});

		MobX.autorun(() => {
			const page: Page | undefined = store.getCurrentPage();
			const message: JsonObject = {
				page: page ? page.toJsonObject() : undefined,
				pageId: page ? page.getId() : undefined
			};

			sendWebViewMessage(message, 'page-change');
		});

		MobX.autorun(() => {
			const selectedElement = store.getSelectedElement();
			const message: JsonObject = {
				selectedElementId: selectedElement ? selectedElement.getId() : undefined
			};
			sendWebViewMessage(message, 'selectedElement-change');
		});
	}, 3000);
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
