import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import { ViewStore } from '../store';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface NotifierContext {
	app: Model.AlvaApp;
	store: ViewStore;
}

export function createChangeNotifiers({ app, store }: NotifierContext): void {
	const opts = {
		scheduler: window.requestIdleCallback
	};

	const sender = store.getSender();

	Mobx.autorun(() => {
		sender.send({
			id: uuid.v4(),
			payload: {
				pages: store.getPages().map(p => p.toJSON())
			},
			type: Message.MessageType.ChangePages
		});
	}, opts);

	Mobx.autorun(() => {
		const elements = store.getElements().map(e => e.toJSON());

		sender.send({
			id: uuid.v4(),
			payload: { elements },
			type: Message.MessageType.ChangeElements
		});
	}, opts);

	Mobx.autorun(() => {
		const elementContents = store.getElementContents().map(e => e.toJSON());

		sender.send({
			id: uuid.v4(),
			payload: { elementContents },
			type: Message.MessageType.ChangeElementContents
		});
	}, opts);

	Mobx.autorun(() => {
		const elementActions = store.getElementActions().map(e => e.toJSON());

		sender.send({
			id: uuid.v4(),
			payload: { elementActions },
			type: Message.MessageType.ChangeElementActions
		});
	}, opts);

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

	Mobx.autorun(() => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		sender.send({
			id: uuid.v4(),
			payload: {
				userStore: project.getUserStore().toJSON()
			},
			type: Message.MessageType.ChangeUserStore
		});
	}, opts);

	// Mobx.autorun(() => {
	// 	const project = store.getProject();
	// 	sender.send({
	// 		id: uuid.v4(),
	// 		payload: {
	// 			project: project ? project.toJSON() : undefined
	// 		},
	// 		type: Message.MessageType.ChangeProject
	// 	});
	// }, {
	// 	delay: 5000,
	// 	scheduler: window.requestIdleCallback
	// });
}
