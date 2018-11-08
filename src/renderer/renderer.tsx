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

let app: Model.AlvaApp;
let history;
let store: ViewStore;

export function startRenderer(): void {
	console.log('App starting...');
	const el = document.getElementById('data') as HTMLElement;
	const payload = el.textContent === null ? '{}' : el.textContent;
	const data = JSON.parse(decodeURIComponent(payload));

	const sender = new Sender({
		endpoint: `ws://${window.location.host}/`
	});

	sender.send({
		id: uuid.v4(),
		type: MessageType.AppLoaded,
		payload: undefined
	});

	app = new Model.AlvaApp();

	history = new Model.EditHistory();
	store = new ViewStore({ app, history, sender });

	store.setServerPort(parseInt(window.location.port, 10));

	if (data.type) {
		app.setHostType(data.type);
	}

	if (data.view) {
		app.setActiveView(data.view);
	}

	if (data.project) {
		store.setProject(Model.Project.from(data.project));
	}

	// TODO: Show "404" if no project was found but details are requested

	// tslint:disable-next-line:no-any
	(window as any).store = store;

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
