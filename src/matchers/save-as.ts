import * as M from '../message';
import * as T from '../types';
import { Persistence } from '../persistence';
import * as Path from 'path';
import * as uuid from 'uuid';

export function saveAs(
	{ host, dataHost }: T.MatcherContext,
	config: { passive: boolean }
): T.Matcher<M.SaveAs> {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`saveAs: received message without resolveable app: ${m}`);
			return;
		}

		const project = await dataHost.getProject(m.payload.projectId);

		if (!project) {
			return;
		}

		const name = project.getName() !== project.toJSON().id ? project.getName() : 'New Project';

		const targetPath = app.isHostType(T.HostType.Electron)
			? await host.selectSaveFile({
					title: 'Save Alva File',
					defaultPath: `${name}.alva`,
					filters: [
						{
							name: 'Alva File',
							extensions: ['alva']
						}
					]
			  })
			: project.getPath() || (await host.resolveFrom(T.HostBase.AppData, `${uuid.v4()}.alva`));

		if (!targetPath) {
			return;
		}

		const serializeResult = await Persistence.serialize(project);

		if (serializeResult.state !== T.PersistenceState.Success) {
			app.send({
				type: M.MessageType.ShowError,
				transaction: m.transaction,
				id: m.id,
				payload: {
					message: `Sorry, we had trouble writing this project to ${targetPath}`,
					detail: `It failed with: ${serializeResult.error.message}`,
					error: {
						message: serializeResult.error.message,
						stack: serializeResult.error.stack || ''
					}
				}
			});

			return;
		}

		project.setPath(targetPath);
		project.setDraft(false);

		if (app.isHostType(T.HostType.Electron)) {
			project.setName(Path.basename(targetPath, Path.extname(targetPath)));
		}

		await dataHost.addProject(project);

		if (typeof window === 'undefined') {
			project.sync(await host.getSender());
		}

		try {
			await host.mkdir(Path.dirname(targetPath));
			await host.writeFile(targetPath, serializeResult.contents);
			await host.saveFile(`${project.getName()}.alva`, serializeResult.contents);

			if (config.passive) {
				return;
			}

			app.send({
				type: M.MessageType.SaveResult,
				transaction: m.transaction,
				id: uuid.v4(),
				payload: {
					previous: m.payload.projectId,
					project: project.toJSON()
				}
			});
		} catch (err) {
			app.send({
				type: M.MessageType.ShowError,
				transaction: m.transaction,
				id: m.id,
				payload: {
					message: `Sorry, we had trouble writing this project to ${targetPath}`,
					detail: `It failed with: ${err.message}`,
					error: {
						message: err.message,
						stack: err.stack || ''
					}
				}
			});
		}
	};
}
