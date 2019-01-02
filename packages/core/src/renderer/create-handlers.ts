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
	const app = ctx.app;
	const sender = ctx.store.getSender();

	sender.match<M.HighlightElement>(M.MessageType.HighlightElement, Handlers.highlightElement(ctx));
	sender.match<M.SelectElement>(M.MessageType.SelectElement, Handlers.selectElement(ctx));
	sender.match<M.KeyboardChange>(M.MessageType.KeyboardChange, Handlers.keyboardChange(ctx));
	sender.match<M.ProjectRequest>(M.MessageType.ProjectRequest, Handlers.projectRequest(ctx));
	sender.match<M.ChangeUserStore>(M.MessageType.ChangeUserStore, Handlers.changeUserStore(ctx));
	sender.match<M.UpdateDownloaded>(M.MessageType.UpdateDownloaded, Handlers.updateDownloaded(ctx));

	app.match<M.SaveResult>(M.MessageType.SaveResult, Handlers.save(ctx));

	app.match<M.ActivatePage>(M.MessageType.ActivatePage, Handlers.activatePage(ctx));
	app.match<M.AppRequest>(M.MessageType.AppRequest, Handlers.appRequest(ctx));
	app.match<M.CheckLibraryResponse>(
		M.MessageType.CheckLibraryResponse,
		Handlers.checkPatternLibrary(ctx)
	);
	app.match<M.ConnectPatternLibraryRequest>(
		M.MessageType.ConnectPatternLibraryRequest,
		Handlers.connectPatternLibraryRequest(ctx)
	);
	app.match<M.ConnectPatternLibraryResponse>(
		M.MessageType.ConnectPatternLibraryResponse,
		Handlers.connectPatternLibrary(ctx)
	);
	app.match<M.CreateNewPage>(M.MessageType.CreateNewPage, Handlers.createNewPage(ctx));
	app.match<M.Log>(M.MessageType.Log, Handlers.log(ctx));

	app.match<M.SetPane>(M.MessageType.SetPane, Handlers.setPane(ctx));
	app.match<M.StartAppMessage>(M.MessageType.StartApp, Handlers.startApp(ctx));
	app.match<M.UpdatePatternLibraryRequest>(
		M.MessageType.UpdatePatternLibraryRequest,
		Handlers.updatePatternLibraryRequest(ctx)
	);
	app.match<M.UpdatePatternLibraryResponse>(
		M.MessageType.UpdatePatternLibraryResponse,
		Handlers.updatePatternLibrary(ctx)
	);
	app.match<M.Cut>(M.MessageType.Cut, Edit.cut(ctx));
	app.match<M.DeleteSelected>(M.MessageType.DeleteSelected, Edit.deleteSelected(ctx));
	app.match<M.DuplicateElement>(M.MessageType.DuplicateElement, Edit.duplicateElement(ctx));
	app.match<M.DuplicateSelected>(M.MessageType.DuplicateSelected, Edit.duplicateSelected(ctx));
	app.match<M.PasteElement>(M.MessageType.PasteElement, Edit.pasteElement(ctx));
	app.match<M.PastePage>(M.MessageType.PastePage, Edit.pastePage(ctx));
	app.match<M.Redo>(M.MessageType.Redo, Edit.redo(ctx));
	app.match<M.DeleteElement>(M.MessageType.DeleteElement, Edit.removeElement(ctx));
	app.match<M.CutElement>(M.MessageType.CutElement, Edit.removeElement(ctx));
	app.match<M.Undo>(M.MessageType.Undo, Edit.undo(ctx));
}
