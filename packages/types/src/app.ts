import * as T from '.';
import { Message } from './message';

export interface AlvaApp {
	hasFileAccess(): boolean;
	getActiveView(): T.AlvaView;
	isActiveView(candidateView: T.AlvaView): boolean;
	getHasFocusedInput(): boolean;
	getHostType(): T.HostType;
	isHostType(candidateType: T.HostType): boolean;
	getId(): string;
	getPanes(): Set<T.AppPane>;
	getPaneSelectOpen(): boolean;
	getPaneSize(pane: T.AppPane): T.PaneSize | undefined;
	getRightSidebarTab(): T.RightSidebarTab;
	getSearchTerm(): string;
	getState(): T.AppState;
	isVisible(pane: T.AppPane): boolean;
	setActiveView(view: T.AlvaView): void;
	setHasFocusedInput(hasFocusedInput: boolean): void;
	setHostType(hostType: T.HostType): void;
	setPaneSelectOpen(paneSelectOpen: boolean): void;
	setPaneSize(size: T.PaneSize): void;
	setPane(pane: T.AppPane, visible: boolean): void;
	setPanes(panes: T.AppPane[]): void;
	setRightSidebarTab(rightSidebarTab: T.RightSidebarTab): void;
	setSearchTerm(term: string): void;
	setState(state: T.AppState): void;
	setUpdate(update: T.UpdateInfo): void;
	getUpdate(): T.UpdateInfo | undefined;
	setSender(sender: T.Sender): void;
	toJSON(): T.SerializedAlvaApp;
	update(b: AlvaApp): void;
	send(message: Message): void;
	match<T extends Message>(t: T['type'], h: (m: T) => void): void;
	transaction<T extends Message, V extends Message>(
		message: Message,
		{ type }: { type: V['type'] }
	): Promise<V>;
}
