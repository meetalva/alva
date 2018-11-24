import { App } from '../container/app';
import { createListeners } from './create-listeners';
import { createNotifiers } from './create-notifiers';
import { createHandlers } from './create-handlers';
import { Sender } from '../sender';
import { MessageType } from '../message';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ViewStore } from '../store';
import * as uuid from 'uuid';
import * as Types from '../types';
import { BrowserAdapter } from '../adapters/browser-adapter';
import * as Fs from 'fs';
import * as BrowserFs from 'browserfs';

let app: Model.AlvaApp;
let history;
let store: ViewStore;

window.requestIdleCallback = window.requestIdleCallback || window.requestAnimationFrame;

export async function startRenderer(): Promise<void> {
	console.log('App starting...');
	const el = document.getElementById('data') as HTMLElement;
	const payload = el.textContent === null ? '{}' : el.textContent;
	const data = JSON.parse(decodeURIComponent(payload));

	app = new Model.AlvaApp();

	if (data.host) {
		app.setHostType(data.host);
	}

	if (data.view) {
		app.setActiveView(data.view);
	}

	const sender = new Sender({
		endpoint: !app.isHostType(Types.HostType.Browser) ? `ws://${window.location.host}/` : ''
	});

	app.setSender(sender);

	history = new Model.EditHistory();
	store = new ViewStore({ app, history, sender });

	store.setServerPort(parseInt(window.location.port, 10));

	const project = store.getProject();

	sender.send({
		id: uuid.v4(),
		type: MessageType.WindowFocused,
		payload: {
			app: app.toJSON(),
			projectId: project ? project.getId() : undefined
		}
	});

	const fs = await getBrowserFs();

	const adapter = BrowserAdapter.fromStore(store, { fs });

	if (!app.isHostType(Types.HostType.Electron)) {
		adapter.start();

		Mobx.autorun(() => {
			const sender = store.getSender();
			const app = store.getApp();

			adapter.host.setApp(app);
			adapter.host.setSender(sender);
		});
	}

	if (data.project) {
		const p = Model.Project.from(data.project);
		adapter.dataHost.addProject(p);
		store.setProject(p);
		store.commit();
	} else {
		// Entering with project url but no data passed from server,
		// e.g. when in static mode
		const fragments = (window.location.pathname || '').split('/').filter(Boolean);
		const id = fragments[fragments.length - 1];

		if (fragments[0] === 'project' && id) {
			const project = await adapter.dataHost.getProject(id);

			if (project) {
				store.setProject(project);
				store.setActiveAppView(Types.AlvaView.PageDetail);
				store.commit();
			}
		}
	}

	// TODO: Show "404" if no project was found but details are requested

	(window as any).store = store;
	(window as any).adapter = adapter;

	// tslint:disable-next-line:no-any
	(window as any).screenshot = () => {
		sender.send({
			id: uuid.v4(),
			type: MessageType.ChromeScreenShot,
			payload: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		});
	};

	console.log('Access ViewStore at .store');

	Mobx.autorun(() => {
		if (app.isActiveView(Types.AlvaView.SplashScreen)) {
			window.history.pushState(app.toJSON(), document.title, '/');
		}

		if (
			app.isActiveView(Types.AlvaView.PageDetail) &&
			typeof store.getProject() !== 'undefined'
		) {
			window.history.pushState(
				app.toJSON(),
				document.title,
				`/project/${store.getProject().getId()}`
			);
		}

		const project = store.getProject();

		app.send({
			type: MessageType.WindowFocused,
			id: uuid.v4(),
			payload: {
				projectId: project ? project.getId() : undefined,
				app: app.toJSON()
			}
		});
	});

	window.addEventListener('popstate', event => app.update(Model.AlvaApp.from(event.state)));

	createListeners({ store });
	createHandlers({ app, history, store });
	createNotifiers({ app, store });

	ReactDom.render(
		<MobxReact.Provider app={app} store={store}>
			<App />
		</MobxReact.Provider>,
		document.getElementById('app')
	);
}

function getBrowserFs(): Promise<typeof Fs> {
	return new Promise((resolve, reject) => {
		const container = {};
		BrowserFs.install(container);

		BrowserFs.configure(
			{
				fs: 'IndexedDB',
				options: {}
			},
			err => {
				if (err) {
					return reject(err);
				}

				resolve((container as any).require('fs'));
			}
		);
	});
}

if (module.hot) {
	module.hot.accept(
		[
			'../container/app',
			'../model',
			'../store',
			'./create-handlers',
			'./create-notifiers',
			'./create-listeners'
		],
		() => {
			const LoadedApp = require('../container/app').App;
			ReactDom.render(
				<MobxReact.Provider app={app} store={store}>
					<LoadedApp />
				</MobxReact.Provider>,
				document.getElementById('app')
			);
		}
	);
}
