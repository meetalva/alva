import * as Message from '../message';
import * as Model from '../model';
import * as Path from 'path';
import * as Sender from '../sender/client';
import { ViewStore } from '../store';
import * as Types from '../types';
import * as uuid from 'uuid';

export type InitMessageHandler = (message: Message.Message) => void;

export function createInitMessageHandler({
	app,
	history,
	store
}: {
	app: Model.AlvaApp;
	history: Model.EditHistory;
	store: ViewStore;
}): InitMessageHandler {
	return function initMessageHandler(message: Message.Message): void {
		switch (message.type) {
			case Message.MessageType.StartApp: {
				store.setServerPort(Number(message.payload.port));

				try {
					if (message.payload.app) {
						app.update(Model.AlvaApp.from(message.payload.app));
					}
				} catch (err) {
					console.error(err);
					app.setState(Types.AppState.Started);
				} finally {
					console.log(`App started on port ${store.getServerPort()}.`);
					app.setState(Types.AppState.Started);
				}

				break;
			}
			case Message.MessageType.OpenFileResponse: {
				history.clear();

				try {
					const newProject = Model.Project.from(message.payload.contents);
					newProject.setPath(message.payload.path);
					store.setProject(newProject);

					app.setActiveView(Types.AlvaView.PageDetail);
					store.getProject().setFocusedItem(Types.FocusedItemType.Page, store.getActivePage());
					store.commit();

					Sender.send({
						id: uuid.v4(),
						payload: {
							libraries: store
								.getProject()
								.getPatternLibraries()
								.map(lib => lib.getId())
						},
						type: Message.MessageType.CheckLibraryRequest
					});
				} catch (err) {
					Sender.send({
						id: uuid.v4(),
						payload: {
							message: `Sorry, we had trouble opening the file "${Path.basename(
								message.payload.path
							)}".\n Parsing the project failed with: ${err.message}`,
							stack: err.stack
						},
						type: Message.MessageType.ShowError
					});
				}

				break;
			}
			case Message.MessageType.CreateNewFileResponse: {
				history.clear();
				const newProject = Model.Project.from(message.payload.contents);
				store.setProject(newProject);
				app.setActiveView(Types.AlvaView.PageDetail);
				store.commit();
				break;
			}
			case Message.MessageType.Log: {
				if (Array.isArray(message.payload)) {
					console.log(...message.payload);
				} else {
					console.log(message.payload);
				}
				break;
			}
			case Message.MessageType.KeyboardChange: {
				store.setMetaDown(message.payload.metaDown);
			}
		}
	};
}
