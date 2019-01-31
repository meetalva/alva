import * as Message from '@meetalva/message';
import * as Mobx from 'mobx';
import * as Model from '@meetalva/model';
import { ViewStore } from '../store';
import * as uuid from 'uuid';
import * as MobxUtils from 'mobx-utils';

export interface NotifierContext {
	app: Model.AlvaApp<Message.Message>;
	store: ViewStore;
}

export function createNotifiers({ app, store }: NotifierContext): void {
	const opts = {
		scheduler: window.requestIdleCallback
	};

	Mobx.autorun(() => {
		const metaDown = store.getMetaDown();

		app.send({
			id: uuid.v4(),
			payload: {
				metaDown
			},
			type: Message.MessageType.KeyboardChange
		});
	}, opts);

	Mobx.autorun(() => {
		const patternLibraries = store.getPatternLibraries();

		app.send({
			id: uuid.v4(),
			payload: {
				patternLibraries: patternLibraries.map(l => l.toJSON())
			},
			type: Message.MessageType.ChangePatternLibraries
		});

		app.send({
			id: uuid.v4(),
			payload: {
				libraries: patternLibraries.map(l => l.getId())
			},
			type: Message.MessageType.CheckLibraryRequest
		});
	}, opts);

	Mobx.autorun(() => {
		app.send({
			id: uuid.v4(),
			payload: {
				app: store.getApp().toJSON()
			},
			type: Message.MessageType.ChangeApp
		});
	}, opts);

	const projectSync: { id?: string; stop?(): void } = {};

	Mobx.autorun(
		() => {
			const project = store.getProject();

			if (!project) {
				return;
			}

			if (
				projectSync.id &&
				projectSync.id !== project.getId() &&
				typeof projectSync.stop === 'function'
			) {
				projectSync.stop();
				projectSync.id = undefined;
			}

			if (!projectSync.id) {
				projectSync.stop = MobxUtils.deepObserve<Model.Project>(project, onProjectChange(app));
				projectSync.id = project.getId();
			}
		},
		{
			scheduler: window.requestIdleCallback
		}
	);

	const appSync: { id?: string; stop?(): void } = {};

	Mobx.autorun(
		() => {
			const app = store.getApp();

			if (!app) {
				return;
			}

			if (appSync.id && appSync.id !== app.getId() && typeof appSync.stop === 'function') {
				appSync.stop();
				appSync.id = undefined;
			}

			if (!appSync.id) {
				appSync.stop = MobxUtils.deepObserve<Model.AlvaApp<Message.Message>>(
					app,
					onAppChange(app)
				);
				appSync.id = app.getId();
			}
		},
		{
			scheduler: window.requestIdleCallback
		}
	);
}

type MobxChange =
	| Mobx.IObjectDidChange
	| Mobx.IArrayChange
	| Mobx.IArraySplice
	| Mobx.IMapDidChange;

type ProjectChangeHandler = (change: MobxChange, path: string, project: Model.Project) => void;
type AppChangeHandler = (
	change: MobxChange,
	path: string,
	app: Model.AlvaApp<Message.Message>
) => void;

function onProjectChange(app: Model.AlvaApp<Message.Message>): ProjectChangeHandler {
	return (change, path, project) => {
		app.send({
			id: uuid.v4(),
			type: Message.MessageType.ProjectUpdate,
			payload: {
				change,
				path,
				projectId: project.getId()
			}
		});
	};
}

function onAppChange(app: Model.AlvaApp<Message.Message>): AppChangeHandler {
	return (change, path, app) => {
		app.send({
			id: uuid.v4(),
			type: Message.MessageType.AppUpdate,
			payload: {
				change,
				path,
				appId: app.getId()
			}
		});
	};
}
