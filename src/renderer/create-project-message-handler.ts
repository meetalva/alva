import * as Message from '../message';
import * as Model from '../model';
import * as Sender from '../sender/client';
import { ViewStore } from '../store';
import * as Types from '../types';
import * as uuid from 'uuid';

export type ProjectMessageHandler = (message: Message.ServerMessage) => void;

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
	return function projectMessagehandler(message: Message.ServerMessage): void {
		const project = store.getProject();

		if (!project) {
			return;
		}

		switch (message.type) {
			case Message.ServerMessageType.CreateNewPage: {
				const page = store.executePageAddNew();

				if (!page) {
					return;
				}

				store.getProject().setActivePage(page);
				page.setNameState(Types.EditableTitleState.Editing);

				break;
			}
			case Message.ServerMessageType.ConnectPatternLibraryResponse: {
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
					type: Message.ServerMessageType.ConnectedPatternLibraryNotification
				});

				break;
			}
			case Message.ServerMessageType.UpdatePatternLibraryResponse: {
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
					type: Message.ServerMessageType.ConnectedPatternLibraryNotification
				});

				break;
			}
			case Message.ServerMessageType.CheckLibraryResponse: {
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
			case Message.ServerMessageType.SelectElement: {
				const element = store.getElementById(message.payload.id);
				if (element) {
					store.setSelectedElement(element);
				}
				break;
			}
			case Message.ServerMessageType.UnselectElement: {
				store.getProject().unsetSelectedElement();
				break;
			}
			case Message.ServerMessageType.HighlightElement: {
				const element = store.getElementById(message.payload.id);
				if (element) {
					store.setHighlightedElement(element, { flat: !store.getMetaDown() });
				}
				break;
			}
			case Message.ServerMessageType.ActivatePage: {
				const page = project.getPageById(message.payload.id);
				if (page) {
					store.getProject().setActivePage(page);
				}
				break;
			}
			case Message.ServerMessageType.SetPane: {
				app.setPane(message.payload.pane, message.payload.visible);
				break;
			}
			case Message.ServerMessageType.UnHighlightElement: {
				store.unsetDraggedElement();
				store.unsetHighlightedElementContent();
			}
		}
	};
}
