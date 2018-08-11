import * as M from '../message';
import * as Model from '../model';
import { ViewStore } from '../store';
import * as Handlers from './message-handlers';
import * as Edit from './edit-handlers';

export interface MessageHandlerContext {
	app: Model.AlvaApp;
	history: Model.EditHistory;
	store: ViewStore;
}

export type MessageHandler<T extends M.Message = M.Message> = (msg: T) => void;

export function createHandlers(ctx: MessageHandlerContext): void {
	const sender = ctx.store.getSender();

	sender.match<M.ActivatePage>(M.MessageType.ActivatePage, Handlers.activatePage(ctx));
	sender.match<M.AppRequest>(M.MessageType.AppRequest, Handlers.appRequest(ctx));
	sender.match<M.ChangeUserStore>(M.MessageType.ChangeUserStore, Handlers.changeUserStore(ctx));
	sender.match<M.CheckLibraryResponse>(
		M.MessageType.CheckLibraryResponse,
		Handlers.checkPatternLibrary(ctx)
	);
	sender.match<M.ConnectPatternLibraryResponse>(
		M.MessageType.ConnectPatternLibraryResponse,
		Handlers.connectPatternLibrary(ctx)
	);
	sender.match<M.CreateNewPage>(M.MessageType.CreateNewPage, Handlers.createNewPage(ctx));
	sender.match<M.HighlightElement>(M.MessageType.HighlightElement, Handlers.highlightElement(ctx));
	sender.match<M.KeyboardChange>(M.MessageType.KeyboardChange, Handlers.keyboardChange(ctx));
	sender.match<M.Log>(M.MessageType.Log, Handlers.log(ctx));
	sender.match<M.NewFileResponse>(M.MessageType.CreateNewFileResponse, Handlers.openFile(ctx));
	sender.match<M.OpenFileResponse>(M.MessageType.OpenFileResponse, Handlers.openFile(ctx));
	sender.match<M.ProjectRequest>(M.MessageType.ProjectRequest, Handlers.projectRequest(ctx));
	sender.match<M.SelectElement>(M.MessageType.SelectElement, Handlers.selectElement(ctx));
	sender.match<M.SetPane>(M.MessageType.SetPane, Handlers.setPane(ctx));
	sender.match<M.StartAppMessage>(M.MessageType.StartApp, Handlers.startApp(ctx));
	sender.match<M.UpdatePatternLibraryResponse>(
		M.MessageType.UpdatePatternLibraryResponse,
		Handlers.updatePatternLibrary(ctx)
	);

	sender.match<M.Cut>(M.MessageType.Cut, Edit.cut(ctx));
	sender.match<M.DeleteSelected>(M.MessageType.DeleteSelected, Edit.deleteSelected(ctx));
	sender.match<M.DuplicateElement>(M.MessageType.DuplicateElement, Edit.duplicateElement(ctx));
	sender.match<M.DuplicateSelected>(M.MessageType.DuplicateSelected, Edit.duplicateSelected(ctx));
	sender.match<M.PasteElement>(M.MessageType.PasteElement, Edit.pasteElement(ctx));
	sender.match<M.PastePage>(M.MessageType.PastePage, Edit.pastePage(ctx));
	sender.match<M.Redo>(M.MessageType.Redo, Edit.redo(ctx));
	sender.match<M.DeleteElement>(M.MessageType.DeleteElement, Edit.removeElement(ctx));
	sender.match<M.CutElement>(M.MessageType.CutElement, Edit.removeElement(ctx));
	sender.match<M.Undo>(M.MessageType.Undo, Edit.undo(ctx));
}
