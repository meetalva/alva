import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import { ViewStore } from '../store';
import * as Types from '../types';
import * as uuid from 'uuid';
import * as MobxUtils from 'mobx-utils';
import { string } from 'prop-types';

export interface NotifierContext {
	app: Model.AlvaApp;
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
				libraries: patternLibraries
					.filter(l => l.getOrigin() === Types.PatternLibraryOrigin.UserProvided)
					.map(l => l.getId())
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

			if (
				projectSync.id &&
				projectSync.id !== project.getId() &&
				typeof projectSync.stop === 'function'
			) {
				projectSync.stop();
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

			if (
				projectSync.id &&
				projectSync.id !== app.getId() &&
				typeof appSync.stop === 'function'
			) {
				appSync.stop();
			}

			if (!appSync.id) {
				appSync.stop = MobxUtils.deepObserve<Model.AlvaApp>(app, onAppChange(app));
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
type AppChangeHandler = (change: MobxChange, path: string, app: Model.AlvaApp) => void;

function onProjectChange(app: Model.AlvaApp): ProjectChangeHandler {
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

function onAppChange(app: Model.AlvaApp): AppChangeHandler {
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
