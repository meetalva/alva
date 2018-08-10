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

	const spying: Map<Model.Project, () => void> = new Map();

	Mobx.autorun(() => {
		const project = store.getProject();

		if (!project) {
			spying.forEach(end => end());
			return;
		}

		if (project) {
			for (const [p, e] of spying.entries()) {
				if (p !== project) {
					e();
				}
			}
		}

		if (spying.has(project)) {
			return;
		}

		spying.set(
			project,
			// tslint:disable-next-line:cyclomatic-complexity
			Mobx.spy((change: Types.MobxChange) => {
				switch (change.type) {
					case Types.MobxChangeType.Update: {
						if (project.batching) {
							return;
						}

						if (typeof change.newValue === 'function') {
							return;
						}

						if (change.hasOwnProperty('index')) {
							console.log('ArrayUpdate:', change);
						}

						if (change.hasOwnProperty('key')) {
							const objectChange = change as
								| Types.MobxObjectUpdate<Model.AnyModel>
								| Types.MobxMapUpdate<string, Model.AnyModel>;

							window.requestIdleCallback(() => {
								sender.send({
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
							});
						}

						break;
					}

					case Types.MobxChangeType.Add: {
						if (change.newValue === undefined || typeof change.newValue === 'function') {
							return;
						}

						const parent = getParentByMember(change.object, {
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
							name: change.name,
							project
						});
						const name = parseChangeName(change.name);
						const deletion = change as Types.MobxDelete<string, Model.AnyModel>;

						if (!parent) {
							return;
						}

						sender.send({
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

						sender.send({
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
			})
		);
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
