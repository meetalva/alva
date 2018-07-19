import * as Mobx from 'mobx';
import * as Types from '../types';

export interface AlvaAppInit {
	activeView: Types.AlvaView;
	panes: Set<Types.AppPane>;
	rightSidebarTab: Types.RightSidebarTab;
	searchTerm: string;
	state: Types.AppState;
}

export class AlvaApp {
	@Mobx.observable private activeView: Types.AlvaView = Types.AlvaView.SplashScreen;
	@Mobx.observable private hoverArea: Types.HoverArea = Types.HoverArea.Chrome;
	@Mobx.observable private paneSelectOpen: boolean = false;

	@Mobx.observable
	private rightSidebarTab: Types.RightSidebarTab = Types.RightSidebarTab.Properties;

	@Mobx.observable private searchTerm: string = '';
	@Mobx.observable private state: Types.AppState = Types.AppState.Starting;

	@Mobx.observable
	private panes: Set<Types.AppPane> = new Set([
		Types.AppPane.PagesPane,
		Types.AppPane.ElementsPane,
		Types.AppPane.PropertiesPane
	]);

	public constructor(init?: AlvaAppInit) {
		if (init) {
			this.activeView = init.activeView;
			this.panes = init.panes;
			this.searchTerm = init.searchTerm;
			this.state = init.state;
		}
	}

	public static from(serialized: Types.SerializedAlvaApp): AlvaApp {
		return new AlvaApp({
			activeView: deserializeView(serialized.activeView),
			panes: new Set(serialized.panes.map(deserializePane)),
			rightSidebarTab: deserializeRightSidebarTab(serialized.rightSidebarTab),
			searchTerm: serialized.searchTerm,
			state: deserializeState(serialized.state)
		});
	}

	public getActiveView(): Types.AlvaView {
		return this.activeView;
	}

	public getHoverArea(): Types.HoverArea {
		return this.hoverArea;
	}

	public getPanes(): Set<Types.AppPane> {
		return this.panes;
	}

	public getPaneSelectOpen(): boolean {
		return this.paneSelectOpen;
	}

	public getRightSidebarTab(): Types.RightSidebarTab {
		return this.rightSidebarTab;
	}

	public getSearchTerm(): string {
		return this.searchTerm;
	}

	public getState(): Types.AppState {
		return this.state;
	}

	@Mobx.action
	public setActiveView(view: Types.AlvaView): void {
		this.activeView = view;
	}

	public setPaneSelectOpen(paneSelectOpen: boolean): void {
		this.paneSelectOpen = paneSelectOpen;
	}

	@Mobx.action
	public setHoverArea(hoverArea: Types.HoverArea): void {
		this.hoverArea = hoverArea;
	}

	@Mobx.action
	public setPane(pane: Types.AppPane, visible: boolean): void {
		if (visible) {
			this.panes.add(pane);
		} else {
			this.panes.delete(pane.toString() as Types.AppPane);
		}

		// TODO: Find out why MobX does not react to Set.prototype.add/delete
		this.panes = new Set(this.panes.values());
	}

	@Mobx.action
	public setPanes(panes: Types.AppPane[]): void {
		this.panes = new Set(panes);
	}

	@Mobx.action
	public setRightSidebarTab(rightSidebarTab: Types.RightSidebarTab): void {
		this.rightSidebarTab = rightSidebarTab;
	}

	@Mobx.action
	public setSearchTerm(term: string): void {
		this.searchTerm = term;
	}

	@Mobx.action
	public setState(state: Types.AppState): void {
		this.state = state;
	}

	public toJSON(): Types.SerializedAlvaApp {
		return {
			activeView: serializeView(this.activeView),
			panes: [...this.panes.values()].map(serializePane),
			rightSidebarTab: serializeRightSidebarTab(this.rightSidebarTab),
			searchTerm: this.searchTerm,
			state: serializeState(this.state)
		};
	}

	@Mobx.action
	public update(b: AlvaApp): void {
		this.activeView = b.activeView;
		this.panes = b.panes;
		this.rightSidebarTab = b.rightSidebarTab;
		this.searchTerm = b.searchTerm;
		this.state = b.state;
	}
}

function deserializePane(state: Types.SerializedAppPane): Types.AppPane {
	switch (state) {
		case 'pages-pane':
			return Types.AppPane.PagesPane;
		case 'elements-pane':
			return Types.AppPane.ElementsPane;
		case 'properties-pane':
			return Types.AppPane.PropertiesPane;
	}
	throw new Error(`Unknown app pane: ${state}`);
}

function deserializeRightSidebarTab(tab: Types.SerializedRightSidebarTab): Types.RightSidebarTab {
	switch (tab) {
		case 'properties':
			return Types.RightSidebarTab.Properties;
		case 'project-settings':
			return Types.RightSidebarTab.ProjectSettings;
	}
	throw new Error(`Unknown tab: ${tab}`);
}

function deserializeState(state: Types.SerializedAppState): Types.AppState {
	switch (state) {
		case 'starting':
			return Types.AppState.Starting;
		case 'started':
			return Types.AppState.Started;
	}
	throw new Error(`Unknown app state: ${state}`);
}

function deserializeView(state: Types.SerializedAlvaView): Types.AlvaView {
	switch (state) {
		case 'SplashScreen':
			return Types.AlvaView.SplashScreen;
		case 'PageDetail':
			return Types.AlvaView.PageDetail;
	}
	throw new Error(`Unknown app state: ${state}`);
}

function serializePane(pane: Types.AppPane): Types.SerializedAppPane {
	switch (pane) {
		case Types.AppPane.PagesPane:
			return 'pages-pane';
		case Types.AppPane.ElementsPane:
			return 'elements-pane';
		case Types.AppPane.PropertiesPane:
			return 'properties-pane';
	}
	throw new Error(`Unknown app pane: ${pane}`);
}

function serializeRightSidebarTab(tab: Types.RightSidebarTab): Types.SerializedRightSidebarTab {
	switch (tab) {
		case Types.RightSidebarTab.Properties:
			return 'properties';
		case Types.RightSidebarTab.ProjectSettings:
			return 'project-settings';
	}
	throw new Error(`Unknown tab: ${tab}`);
}

function serializeState(state: Types.AppState): Types.SerializedAppState {
	switch (state) {
		case Types.AppState.Starting:
			return 'starting';
		case Types.AppState.Started:
			return 'started';
	}
	throw new Error(`Unknown app state: ${state}`);
}

function serializeView(view: Types.AlvaView): Types.SerializedAlvaView {
	switch (view) {
		case Types.AlvaView.SplashScreen:
			return 'SplashScreen';
		case Types.AlvaView.PageDetail:
			return 'PageDetail';
	}
	throw new Error(`Unknown app state: ${view}`);
}
