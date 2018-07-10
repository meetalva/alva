import { App } from '../container/app';
import { createChangeNotifiers } from './create-change-notifiers';
import { createServerMessageHandler } from './create-server-message-handler';
import * as Sender from '../sender/client';
import { MessageType } from '../message';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { registerGlobalListeners } from './register-global-listeners';
import { ViewStore } from '../store';
import * as uuid from 'uuid';

export function startRenderer(): void {
	console.log('App starting...');

	Sender.send({
		id: uuid.v4(),
		type: MessageType.AppLoaded,
		payload: undefined
	});

	const app = new Model.AlvaApp();
	const history = new Model.EditHistory();
	const store = new ViewStore({ app, history });

	const id = `s${uuid
		.v4()
		.split('-')
		.join('')}`;

	// tslint:disable-next-line:no-any
	(window as any)[id] = store;
	console.log(`Access ViewStore at ${id}`);

	Sender.receive(createServerMessageHandler({ app, history, store }));
	registerGlobalListeners({ store });
	createChangeNotifiers({ app, store });

	ReactDom.render(
		<MobxReact.Provider app={app} store={store}>
			<App />
		</MobxReact.Provider>,
		document.getElementById('app')
	);
}
