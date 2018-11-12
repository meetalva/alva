import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import { ViewStore } from '../store';
import * as Types from '../types';
import * as uuid from 'uuid';
import * as isPlainObject from 'is-plain-object';

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

	const send = (message: Message.Message) =>
		window.requestIdleCallback(() => sender.send(message));

	const transactions: Types.MobxChange[] = [];

	Mobx.spy((change: Types.MobxChange) => {
		// tslint:disable-next-line:cyclomatic-complexity
		Mobx.transaction(() => {
			// Track what actions/transactions are running currently
			if (change.spyReportStart) {
				transactions.push(change);
			}

			if (change.spyReportEnd) {
				transactions.pop();
			}

			/**
			 * Do not send messages as long as known/named transactions are running
			 * TODO: Generalize this
			 */
			// tslint:disable-next-line:no-any
			if (transactions.some((t: any) => t.name in Types.ActionName)) {
				return;
			}

			const project = store.getProject();

			if (!project || project.batching) {
				return;
			}

			switch (change.type) {
				case Types.MobxChangeType.Update: {
					if (typeof change.newValue === 'function') {
						return;
					}

					if (change.hasOwnProperty('index')) {
						console.log('ArrayUpdate:', change);
						return;
					}

					if (change.hasOwnProperty('key') && !(change.object instanceof Mobx.ObservableMap)) {
						const objectChange = change as Types.MobxObjectUpdate<Model.AnyModel>;

						send({
							id: uuid.v4(),
							type: Message.MessageType.MobxUpdate,
							payload: {
								// tslint:disable-next-line:no-any
								id: (objectChange.object as any).id,
								name: objectChange.object.constructor.name,
								change: {
									type: objectChange.type,
									key: objectChange.key,
									newValue: objectChange.newValue
								}
							}
						});
					}

					if (change.hasOwnProperty('key') && change.object instanceof Mobx.ObservableMap) {
						const mapChange = change as Types.MobxMapUpdate<string, Model.AnyModel>;
						const name = parseChangeName(change.name);

						const parent = getParentByMember(change.object, {
							app,
							name: change.name,
							project
						});

						if (!parent) {
							return;
						}

						send({
							id: uuid.v4(),
							type: Message.MessageType.MobxUpdate,
							payload: {
								// tslint:disable-next-line:no-any
								id: parent.getId(),
								name: name.parentName,
								change: {
									type: mapChange.type,
									key: name.memberName,
									mapKey: mapChange.key,
									newValue: mapChange.newValue
								}
							}
						});
					}

					break;
				}

				case Types.MobxChangeType.Add: {
					if (change.newValue === undefined || typeof change.newValue === 'function') {
						return;
					}

					const parent = getParentByMember(change.object, {
						app,
						name: change.name,
						project
					});

					const name = parseChangeName(change.name);

					if (!parent) {
						return;
					}

					// tslint:disable-next-line:no-any
					const rawValue = change.newValue as any;

					const newValue =
						rawValue && typeof rawValue.toJSON === 'function'
							? rawValue.toJSON()
							: change.newValue;

					if (isPlainObject(newValue) && !newValue.model) {
						return;
					}

					send({
						id: uuid.v4(),
						type: Message.MessageType.MobxAdd,
						payload: {
							id: parent.getId(),
							name: name.parentName,
							memberName: name.memberName,
							valueModel: typeof newValue === 'object' ? newValue.model : undefined,
							change: {
								type: change.type,
								key: change.key as string,
								newValue
							}
						}
					});

					break;
				}

				case Types.MobxChangeType.Delete: {
					const parent = getParentByMember(change.object, {
						app,
						name: change.name,
						project
					});
					const name = parseChangeName(change.name);
					const deletion = change as Types.MobxDelete<string, Model.AnyModel>;

					if (!parent) {
						return;
					}

					send({
						id: uuid.v4(),
						type: Message.MessageType.MobxDelete,
						payload: {
							id: parent.getId(),
							name: name.parentName,
							memberName: name.memberName,
							change: {
								type: deletion.type,
								key: deletion.key
							}
						}
					});

					break;
				}

				case Types.MobxChangeType.Splice: {
					const parent = getParentByMember(change.object, {
						app,
						name: change.name,
						project
					});
					const name = parseChangeName(change.name);

					if (!parent) {
						return;
					}

					// tslint:disable-next-line:no-any
					const exampleValue = (change.added || change.removed)[0] as Model.AnyModel;

					const model =
						exampleValue && typeof exampleValue.toJSON === 'function'
							? exampleValue.model
							: undefined;

					send({
						id: uuid.v4(),
						type: Message.MessageType.MobxSplice,
						payload: {
							id: parent.getId(),
							name: name.parentName,
							memberName: name.memberName,
							valueModel: model,
							change: {
								type: change.type,
								index: change.index,
								added: change.added,
								removed: change.removed
							}
						}
					});
					break;
				}
			}
		});
	});
}

function getParentByMember(
	member: unknown,
	{ app, name, project }: { app: Model.AlvaApp; name: string; project: Model.Project }
): Model.AnyModel | undefined {
	const { parentName, parentId } = parseChangeName(name);

	switch (parentName) {
		case 'AlvaApp':
			return app;
		case 'Project':
			return project;
		case 'UserStore':
			return project.getUserStore();
		case 'Element':
		case 'ElementContent':
		case 'Page':
		case 'Pattern':
		case 'PatternLibrary':
		case 'PatternEnumProperty':
			return getObjectsByName(parentName, { project }).find((e: unknown) => {
				const admin = Mobx._getAdministration(e);
				return admin.name === parentId;
			});
		default:
			// console.log(parentName);
			return;
	}
}

function getObjectsByName(name: string, { project }: { project: Model.Project }): Model.AnyModel[] {
	switch (name) {
		case 'Element':
			return project.getElements();
		case 'ElementContent':
			return project.getElementContents();
		case 'Page':
			return project.getPages();
		case 'PatternLibrary':
			return project.getPatternLibraries();
		case 'PatternEnumProperty':
			return project.getPatternProperties();
		case 'Pattern':
			return project.getPatterns();
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
