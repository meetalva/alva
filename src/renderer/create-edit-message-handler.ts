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

		const project = store.getProject();

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
				switch (project.getFocusedItemType()) {
					case Types.ItemType.Element:
						store.removeSelectedElement();
						break;
					case Types.ItemType.Page:
						store.removeSelectedPage();
				}
				break;
			}
			case Message.MessageType.CutElement:
			case Message.MessageType.DeleteElement: {
				store.removeElementById(message.payload);
				break;
			}
			case Message.MessageType.Delete: {
				switch (project.getFocusedItemType()) {
					case Types.ItemType.Element:
						store.removeSelectedElement();
						break;
					case Types.ItemType.Page:
						store.removeSelectedPage();
				}
				break;
			}
			case Message.MessageType.PasteElement: {
				const activePage = store.getActivePage() as Model.Page;

				if (!activePage) {
					return;
				}

				const targetElement = message.payload.targetId
					? store.getElementById(message.payload.targetId)
					: store.getSelectedElement() || activePage.getRoot();

				if (!targetElement) {
					return;
				}

				const contextProject = Model.Project.from(message.payload.project);
				const sourceElement = Model.Element.from(message.payload.element, {
					project: contextProject
				});
				const clonedElement = sourceElement.clone();

				// TODO: Check if the pattern can be resolved, abort when missing
				project.importElement(clonedElement);

				switch (message.payload.targetType) {
					case Types.ElementTargetType.Inside:
						if (targetElement.acceptsChildren()) {
							store.insertElementInside({
								element: clonedElement,
								targetElement
							});
						}
						break;
					case Types.ElementTargetType.Auto:
					case Types.ElementTargetType.Below:
						store.insertElementAfter({
							element: clonedElement,
							targetElement
						});
				}

				store.commit();
				project.setSelectedElement(clonedElement);
				break;
			}
			case Message.MessageType.PastePage: {
				const pages = store.getPages();
				const activePage = (store.getActivePage() || pages[pages.length - 1]) as Model.Page;

				const contextProject = Model.Project.from(message.payload.project);
				const sourcePage = Model.Page.from(message.payload.page, { project: contextProject });
				const clonedPage = sourcePage.clone();

				project.importPage(clonedPage);

				store.commit();

				project.movePageAfter({
					page: clonedPage,
					targetPage: activePage
				});

				project.setActivePage(clonedPage);
				break;
			}
			case Message.MessageType.Duplicate: {
				switch (project.getFocusedItemType()) {
					case Types.ItemType.Element:
						store.duplicateSelectedElement();
						break;
					case Types.ItemType.Page:
						store.duplicateActivePage();
				}
				break;
			}
			case Message.MessageType.DuplicateElement: {
				switch (project.getFocusedItemType()) {
					case Types.ItemType.Element:
						store.duplicateElementById(message.payload);
				}
			}
		}
	};
}
