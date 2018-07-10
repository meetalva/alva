import * as Message from '../message';
import * as Model from '../model';
import { ViewStore } from '../store';
import * as Types from '../types';

export type EditMessageHandler = (message: Message.Message) => void;

export function createEditMessageHandler({
	app,
	store
}: {
	store: ViewStore;
	app: Model.AlvaApp;
}): EditMessageHandler {
	// tslint:disable-next-line:cyclomatic-complexity
	return function editMessageHandler(message: Message.Message): void {
		// Do not perform custom operations when an input is selected
		if (document.activeElement.tagName.toLowerCase() === 'input') {
			return;
		}

		switch (message.type) {
			case Message.MessageType.Undo: {
				store.undo();
				break;
			}
			case Message.MessageType.Redo: {
				store.redo();
				break;
			}
			case Message.MessageType.Cut: {
				/*if (app.getActiveView() === Types.AlvaView.Pages) {
						// TODO: implement this
						// store.cutSelectedPage();
					}*/
				if (app.getActiveView() === Types.AlvaView.PageDetail) {
					store.executeElementCutSelected();
				}
				break;
			}
			case Message.MessageType.CutElement: {
				store.executeElementCutById(message.payload);
				break;
			}
			case Message.MessageType.Delete: {
				if (
					app.getActiveView() === Types.AlvaView.PageDetail &&
					store.getProject().getFocusedItemType() === Types.FocusedItemType.Page
				) {
					store.executePageRemoveSelected();
				}

				if (
					app.getActiveView() === Types.AlvaView.PageDetail &&
					store.getProject().getFocusedItemType() === Types.FocusedItemType.Element
				) {
					store.executeElementRemoveSelected();
				}
				break;
			}
			case Message.MessageType.DeleteElement: {
				store.executeElementRemoveById(message.payload);
				break;
			}
			case Message.MessageType.Copy: {
				/*if (app.getActiveView() === Types.AlvaView.Pages) {
						// TODO: implement this
						// store.copySelectedPage();
					}*/
				if (app.getActiveView() === Types.AlvaView.PageDetail) {
					store.copySelectedElement();
				}
				break;
			}
			case Message.MessageType.CopyElement: {
				store.copyElementById(message.payload);
				break;
			}
			case Message.MessageType.Paste: {
				/*if (app.getActiveView() === Types.AlvaView.Pages) {
						// TODO: implement this
						// store.pasteAfterSelectedPage();
					}*/
				if (app.getActiveView() === Types.AlvaView.PageDetail) {
					store.executeElementPasteAfterSelected();
				}
				break;
			}
			case Message.MessageType.PasteElementBelow: {
				store.executeElementPasteAfterById(message.payload);
				break;
			}
			case Message.MessageType.PasteElementInside: {
				store.executeElementPasteInsideById(message.payload);
				break;
			}
			case Message.MessageType.Duplicate: {
				if (app.getActiveView() === Types.AlvaView.PageDetail) {
					store.executeElementDuplicateSelected();
				}
				break;
			}
			case Message.MessageType.DuplicateElement: {
				if (app.getActiveView() === Types.AlvaView.PageDetail) {
					store.executeElementDuplicateById(message.payload);
				}
			}
		}
	};
}
