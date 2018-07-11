import * as Message from '../message';
import * as Model from '../model';
import * as Sender from '../sender/client';
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
				const library = Model.PatternLibrary.import(message.payload.analysis);
				project.addPatternLibrary(library);
				store.getApp().setRightSidebarTab(Types.RightSidebarTab.ProjectSettings);
				store.commit();

				Sender.send({
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
				const previousLibrary = project.getPatternLibraryById(
					message.payload.previousLibraryId
				);

				if (!previousLibrary) {
					return;
				}

				const library = Model.PatternLibrary.import(message.payload.analysis, previousLibrary);

				store.getApp().setRightSidebarTab(Types.RightSidebarTab.ProjectSettings);
				store.commit();

				Sender.send({
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
			case Message.MessageType.UserStoreChange: {
				project.getUserStore().sync(message);
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
