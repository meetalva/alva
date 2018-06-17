import * as Sender from '../sender/client';
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

	const send = ({ type, payload }) => {
		Sender.send({
			id: uuid.v4(),
			payload,
			type
		});
	};

	// Notifiy preview about page changes
	Mobx.autorun(() => {
		send({
			payload: {
				pages: store.getPages().map(p => p.toJSON())
			},
			type: Message.ServerMessageType.ChangePages
		});
	});

	// Notify preview about element / element content changes
	Mobx.autorun(() => {
		const elements = store.getElements().map(e => e.toJSON());
		const elementContents = store.getElementContents().map(e => e.toJSON());

		send({
			payload: { elements, elementContents },
			type: Message.ServerMessageType.ChangeElements
		});
	});

	Mobx.autorun(() => {
		const project = store.getProject();

		send({
			payload: {
				app: app.toJSON(),
				project: project ? project.toJSON() : undefined
			},
			type: Message.ServerMessageType.MainMenuRequest
		});
	}, opts);

	Mobx.autorun(() => {
		const metaDown = store.getMetaDown();

		send({
			payload: {
				metaDown
			},
			type: Message.ServerMessageType.KeyboardChange
		});
	});

	Mobx.autorun(() => {
		const patternLibraries = store.getPatternLibraries();

		send({
			payload: {
				patternLibraries: patternLibraries.map(l => l.toJSON())
			},
			type: Message.ServerMessageType.ChangePatternLibraries
		});

		send({
			payload: {
				libraries: patternLibraries
					.filter(l => l.getOrigin() === Types.PatternLibraryOrigin.UserProvided)
					.map(l => l.getId())
			},
			type: Message.ServerMessageType.CheckLibraryRequest
		});
	}, opts);

	Mobx.autorun(() => {
		send({
			payload: {
				app: store.getApp().toJSON()
			},
			type: Message.ServerMessageType.ChangeApp
		});
	}, opts);
}
