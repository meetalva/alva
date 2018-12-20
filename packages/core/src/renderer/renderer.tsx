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

let app: Model.AlvaApp;
let history;
let store: ViewStore;

window.requestIdleCallback = window.requestIdleCallback || window.requestAnimationFrame;

export async function startRenderer(): Promise<void> {
	const el = document.getElementById('data') as HTMLElement;
	const payload = el.textContent === null ? '{}' : el.textContent;
	const data = JSON.parse(decodeURIComponent(payload));

	const endpoint =
		data && data.host !== Types.HostType.Browser ? `ws://${window.location.host}/` : '';
	const sender = new Sender({ endpoint });

	app = new Model.AlvaApp(Model.AlvaApp.Defaults, { sender });

	if (data.host) {
		app.setHostType(data.host);
	}

	if (data.view) {
		app.setActiveView(data.view);
	}

	app.setSender(sender);

	history = new Model.EditHistory();
	store = new ViewStore({ app, history, sender });

	store.setServerPort(parseInt(window.location.port, 10));

	const project = store.getProject();

	app.send({
		id: uuid.v4(),
		type: MessageType.WindowFocused,
		payload: {
			app: app.toJSON(),
			projectId: project ? project.getId() : undefined
		}
	});

	const adapter = BrowserAdapter.fromStore(store, {
		fs: await getBrowserFs()
	});

	adapter.host.log('App starting...');

	if (!app.isHostType(Types.HostType.Electron)) {
		adapter.start();

		Mobx.autorun(() => {
			const sender = store.getSender();
			const app = store.getApp();

			adapter.host.addApp(app);
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
		app.send({
			id: uuid.v4(),
			type: MessageType.ChromeScreenShot,
			payload: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		});
	};

	adapter.host.log('Access ViewStore at .store');

	Mobx.autorun(() => {
		// We misuse the hash value to let electron resolve windows based on app id found in the url
		const hash = app.isHostType(Types.HostType.Electron) ? `#${app.getId()}` : '';

		if (app.isActiveView(Types.AlvaView.SplashScreen)) {
			window.history.pushState(app.toJSON(), document.title, `/${hash}`);
		}

		if (
			app.isActiveView(Types.AlvaView.PageDetail) &&
			typeof store.getProject() !== 'undefined'
		) {
			window.history.pushState(
				app.toJSON(),
				document.title,
				`/project/${store.getProject().getId()}${hash}`
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

	window.addEventListener('popstate', event =>
		app.update(Model.AlvaApp.from(event.state, { sender }))
	);

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
	return import('@marionebl/browserfs').then<typeof Fs>(BrowserFs => {
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
	});
}
