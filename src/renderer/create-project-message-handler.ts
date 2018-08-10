import * as Message from '../message';
import * as Model from '../model';
import { ViewStore } from '../store';
import * as Types from '../types';
import * as uuid from 'uuid';

export type ProjectMessageHandler = (message: Message.Message) => void;

export function createProjectMessageHandler({
	app,
	history,
	store
}: {
	app: Model.AlvaApp;
	history: Model.EditHistory;
	store: ViewStore;
}): ProjectMessageHandler {
	// tslint:disable-next-line:cyclomatic-complexity
	return async function projectMessagehandler(message: Message.Message): Promise<void> {
		const project = store.getProject();

		if (!project) {
			return;
		}

		switch (message.type) {
			case Message.MessageType.CreateNewPage: {
				const page = store.executePageAddNew();

				if (!page) {
					return;
				}

				store.getProject().setActivePage(page);
				page.setNameState(Types.EditableTitleState.Editing);

				break;
			}
			case Message.MessageType.ConnectPatternLibraryResponse: {
				const analysis = message.payload.analysis;

				const library = Model.PatternLibrary.create({
					id: uuid.v4(),
					name: analysis.name,
					origin: Types.PatternLibraryOrigin.UserProvided,
					patternProperties: [],
					patterns: [],
					bundle: analysis.bundle,
					bundleId: analysis.id,
					description: analysis.description,
					state: Types.PatternLibraryState.Connected
				});

				library.import(analysis, { project });

				project.addPatternLibrary(library);
				store.getApp().setRightSidebarTab(Types.RightSidebarTab.ProjectSettings);
				store.commit();

				store.getSender().send({
					id: uuid.v4(),
					payload: {
						id: library.getId(),
						path: message.payload.path
					},
					type: Message.MessageType.ConnectedPatternLibraryNotification
				});

				break;
			}
			case Message.MessageType.UpdatePatternLibraryResponse: {
				const library = project.getPatternLibraryById(message.payload.previousLibraryId);

				if (!library) {
					return;
				}

				library.import(message.payload.analysis, { project });
				store.commit();

				store.getSender().send({
					id: uuid.v4(),
					payload: {
						id: library.getId(),
						path: message.payload.path
					},
					type: Message.MessageType.ConnectedPatternLibraryNotification
				});

				break;
			}
			case Message.MessageType.CheckLibraryResponse: {
				message.payload
					.map(check => ({ library: project.getPatternLibraryById(check.id), check }))
					.forEach(({ library, check }) => {
						if (typeof library === 'undefined') {
							return;
						}
						library.setState(
							check.connected
								? Types.PatternLibraryState.Connected
								: Types.PatternLibraryState.Disconnected
						);
					});
				break;
			}
			case Message.MessageType.SetPane: {
				app.setPane(message.payload.pane, message.payload.visible);
				break;
			}
			case Message.MessageType.ChangeUserStore: {
				project.startBatch();
				project.getUserStore().sync(message, { withEnhancer: false });
				project.endBatch();
				break;
			}
			case Message.MessageType.SelectElement: {
				if (!message.payload.element) {
					return;
				}

				const el = Model.Element.from(message.payload.element, { project });
				const previousEl = project.getElementById(el.getId());

				if (!previousEl) {
					return;
				}

				store.setSelectedElement(previousEl);
				break;
			}
			case Message.MessageType.HighlightElement: {
				if (!message.payload.element) {
					return;
				}

				const el = Model.Element.from(message.payload.element, { project });
				const previousEl = project.getElementById(el.getId());

				if (!previousEl) {
					return;
				}

				store.setHighlightedElement(previousEl, { flat: !store.getMetaDown() });
			}
		}
	};
}
