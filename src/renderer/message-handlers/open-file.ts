import * as Mobx from 'mobx';
import * as M from '../../message';
import * as Model from '../../model';
import * as Path from 'path';
import * as Types from '../../types';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as uuid from 'uuid';

export function openFile({
	store,
	app,
	history
}: MessageHandlerContext): MessageHandler<M.OpenFileResponse | M.NewFileResponse> {
	return m => {
		Mobx.runInAction(Types.ActionName.OpenFile, () => {
			if (m.payload.status === Types.ProjectPayloadStatus.Error) {
				return;
			}

			const payload = m.payload as Types.ProjectPayloadSuccess;

			history.clear();

			const projectResult = createProject(payload.contents);

			if (projectResult.status === ProjectCreateStatus.Error) {
				store.getSender().send({
					id: uuid.v4(),
					payload: {
						message: `Sorry, we had trouble reading the project in file "${Path.basename(
							payload.path
						)}".\n Parsing the project failed with: ${projectResult.error.message}`,
						stack: projectResult.error.stack || ''
					},
					type: M.MessageType.ShowError
				});

				return;
			}

			store.setProject(projectResult.project);
			app.setActiveView(Types.AlvaView.PageDetail);
			store.getProject().setFocusedItem(store.getActivePage());
			store.commit();
		});
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
