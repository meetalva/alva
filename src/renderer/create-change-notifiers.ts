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
		let dispose;

		const project = store.getProject();

		if (!project && dispose) {
			dispose();
		}

		if (!project) {
			return;
		}

		dispose = Mobx.spy((change: Types.MobxChange) => {
			window.requestIdleCallback(() => {
				switch (change.type) {
					case Types.MobxChangeType.Update: {
						if (change.hasOwnProperty('index')) {
							const arrayChange = change as Types.MobxArrayUpdate;

							sender.send({
								id: uuid.v4(),
								type: Message.MessageType.MobxUpdate,
								payload: {
									id: change.object.id,
									name: '',
									change: {
										type: arrayChange.type,
										index: arrayChange.index,
										newValue: change.newValue
									}
								}
							});
						}

						if (change.hasOwnProperty('key')) {
							const objectChange = change as Types.MobxObjectUpdate | Types.MobxMapUpdate;

							sender.send({
								id: uuid.v4(),
								type: Message.MessageType.MobxUpdate,
								payload: {
									id: change.object.id,
									name: change.object.constructor.name,
									change: {
										type: objectChange.type,
										key: objectChange.key,
										newValue: change.newValue
									}
								}
							});
						}

						break;
					}

					case Types.MobxChangeType.Add: {
						if (change.newValue === undefined) {
							return;
						}

						const parent = getParentByMember(change.object, { name: change.name, project });
						const name = parseChangeName(change.name);

						if (!parent) {
							return;
						}

						// tslint:disable-next-line:no-any
						const newValue =
							change.newValue && typeof (change.newValue as any).toJSON === 'function'
								? (change.newValue as any).toJSON()
								: change.newValue;

						if (typeof newValue === 'object' && !newValue.model) {
							console.log(change);
							return;
						}

						sender.send({
							id: uuid.v4(),
							type: Message.MessageType.MobxAdd,
							payload: {
								id: parent.getId(),
								name: name.parentName,
								memberName: name.memberName,
								// tslint:disable-next-line:no-any
								valueModel: typeof newValue === 'object' ? newValue.model : undefined,
								change: {
									type: change.type,
									key: change.key,
									newValue
								}
							}
						});

						break;
					}

					case Types.MobxChangeType.Splice: {
						const parent = getParentByMember(change.object, { name: change.name, project });
						const name = parseChangeName(change.name);

						if (!parent) {
							return;
						}

						sender.send({
							id: uuid.v4(),
							type: Message.MessageType.MobxSplice,
							payload: {
								id: parent.getId(),
								name: name.parentName,
								memberName: name.memberName,
								change: {
									type: change.type,
									index: change.index,
									added: change.added,
									removed: change.removed
								}
							}
						});
					}
				}
			});
		});
	});
}

function getParentByMember(
	member: unknown,
	{ name, project }: { name: string; project: Model.Project }
): Model.AnyModel | undefined {
	const { parentName, parentId } = parseChangeName(name);

	switch (parentName) {
		case 'Project':
			return project;
		case 'UserStore':
			return project.getUserStore();
		case 'Element':
		case 'ElementContent':
			return getObjectsByName(parentName, { project }).find((e: unknown) => {
				const admin = Mobx._getAdministration(e);
				return admin.name === parentId;
			});
		default:
			return;
	}
}

function getObjectsByName(name: string, { project }: { project: Model.Project }): Model.AnyModel[] {
	switch (name) {
		case 'Element':
			return project.getElements();
		case 'ElementContent':
			return project.getElementContents();
	}

	return [];
}

function parseChangeName(
	name: string
): { parentName: string; parentId: string; memberName: string } {
	const [rawParentName = '', rawMemberName = ''] = name.split('.');

	return {
		parentName: rawParentName.split('@')[0] || '',
		parentId: rawParentName || '',
		memberName: rawMemberName.split('@')[0] || ''
	};
}
