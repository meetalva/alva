import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import { ViewStore } from '../store';
import * as Types from '../types';
import * as uuid from 'uuid';
import * as MobxUtils from 'mobx-utils';
// import * as isPlainObject from 'is-plain-object';

export interface NotifierContext {
	app: Model.AlvaApp;
	store: ViewStore;
}

export function createNotifiers({ app, store }: NotifierContext): void {
	const opts = {
		scheduler: window.requestIdleCallback
	};

	const sender = store.getSender();

	Mobx.autorun(() => {
		const metaDown = store.getMetaDown();

		sender.send({
			id: uuid.v4(),
			payload: {
				metaDown
			},
			type: Message.MessageType.KeyboardChange
		});
	}, opts);

	Mobx.autorun(() => {
		const patternLibraries = store.getPatternLibraries();

		sender.send({
			id: uuid.v4(),
			payload: {
				patternLibraries: patternLibraries.map(l => l.toJSON())
			},
			type: Message.MessageType.ChangePatternLibraries
		});

		sender.send({
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
		sender.send({
			id: uuid.v4(),
			payload: {
				app: store.getApp().toJSON()
			},
			type: Message.MessageType.ChangeApp
		});
	}, opts);

	let stopProjectSync: MobxUtils.IDisposer;

	Mobx.autorun(() => {
		const project = store.getProject();

		if (typeof stopProjectSync === 'function') {
			stopProjectSync();
		}

		stopProjectSync = MobxUtils.deepObserve<Model.Project>(project, onProjectChange(sender));
	});

	let stopAppSync: MobxUtils.IDisposer;

	Mobx.autorun(() => {
		const app = store.getApp();

		if (typeof stopAppSync === 'function') {
			stopAppSync();
		}

		stopAppSync = MobxUtils.deepObserve<Model.AlvaApp>(app, onAppChange(sender));
	});
}

type MobxChange =
	| Mobx.IObjectDidChange
	| Mobx.IArrayChange
	| Mobx.IArraySplice
	| Mobx.IMapDidChange;

type ProjectChangeHandler = (change: MobxChange, path: string, project: Model.Project) => void;
type AppChangeHandler = (change: MobxChange, path: string, app: Model.AlvaApp) => void;

function onProjectChange(sender: Types.Sender): ProjectChangeHandler {
	return (change, path, project) => {
		sender.send({
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

function onAppChange(sender: Types.Sender): AppChangeHandler {
	return (change, path, app) => {
		sender.send({
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
