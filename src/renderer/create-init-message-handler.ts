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
			case Message.MessageType.OpenFileResponse:
			case Message.MessageType.CreateNewFileResponse: {
				if (message.payload.status === Types.ProjectPayloadStatus.Error) {
					return;
				}

				const payload = message.payload as Types.ProjectPayloadSuccess;

				history.clear();

				const projectResult = createProject(payload.contents);

				if (projectResult.status === ProjectCreateStatus.Error) {
					return Sender.send({
						id: uuid.v4(),
						payload: {
							message: `Sorry, we had trouble reading the project in file "${Path.basename(
								payload.path
							)}".\n Parsing the project failed with: ${projectResult.error.message}`,
							stack: projectResult.error.stack || ''
						},
						type: Message.MessageType.ShowError
					});
				}

				store.setProject(projectResult.project);
				app.setActiveView(Types.AlvaView.PageDetail);
				store.getProject().setFocusedItem(Types.ItemType.Page, store.getActivePage());

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

export enum ProjectCreateStatus {
	Success,
	Error
}

export type ProjectCreateResult = ProjectCreateSuccess | ProjectCreateError;

export interface ProjectCreateSuccess {
	status: ProjectCreateStatus.Success;
	project: Model.Project;
}

export interface ProjectCreateError {
	status: ProjectCreateStatus.Error;
	error: Error;
}

function createProject(data: Types.SerializedProject): ProjectCreateResult {
	try {
		const project = Model.Project.from(data);
		return { project, status: ProjectCreateStatus.Success };
	} catch (error) {
		return { error, status: ProjectCreateStatus.Error };
	}
}
