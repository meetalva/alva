import * as Express from 'express';
import * as React from 'react';
import * as MobxReact from 'mobx-react';
// tslint:disable-next-line:no-submodule-imports
import * as ReactDOM from 'react-dom/server';
import * as RendererDocument from '../../renderer/renderer-document';

import * as Types from '../../types';
import { App } from '../../container/app';
import * as Model from '../../model';
import * as Store from '../../store';
import { ServerStyleSheet } from 'styled-components';

export function mainRouteFactory(server: Types.AlvaServer): Express.RequestHandler {
	return async function mainRoute(_: unknown, res: Express.Response): Promise<void> {
		const sheet = new ServerStyleSheet();
		const content = ReactDOM.renderToString(
			sheet.collectStyles(<ServerApp sender={server.sender} />)
		);

		res.type('html');
		res.send(
			RendererDocument.rendererDocument({
				content,
				styles: sheet.getStyleTags(),
				payload: {
					host: server.host.type,
					view: Types.AlvaView.SplashScreen,
					projectViewMode: Types.ProjectViewMode.Design,
					update: await server.dataHost.getUpdate(),
					projects: await server.dataHost.getProjects()
				}
			})
		);
	};
}

// TODO: Move to shareable position
function ServerApp({ sender }: { sender: Types.Sender }) {
	const app = new Model.AlvaApp(Model.AlvaApp.Defaults, { sender });
	const history = new Model.EditHistory();

	const store = new Store.ViewStore({
		app,
		history,
		sender: sender as any,
		libraryStore: new Model.LibraryStore()
	});

	return (
		<MobxReact.Provider app={app} store={store}>
			<App />
		</MobxReact.Provider>
	);
}
