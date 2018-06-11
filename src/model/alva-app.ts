import * as Mobx from 'mobx';
import * as Types from '../types';

export interface AlvaAppInit {
	activeView: Types.AlvaView;
	searchTerm: string;
	state: Types.AppState;
}

export class AlvaApp {
	@Mobx.observable private activeView: Types.AlvaView = Types.AlvaView.SplashScreen;
	@Mobx.observable private activeFocus: Types.AppFocus = Types.AppFocus.Page;
	@Mobx.observable private searchTerm: string = '';
	@Mobx.observable private state: Types.AppState = Types.AppState.Starting;

	public constructor(init?: AlvaAppInit) {
		if (init) {
			this.activeView = init.activeView;
			this.searchTerm = init.searchTerm;
			this.state = init.state;
		}
	}

	public static from(serialized: Types.SerializedAlvaApp): AlvaApp {
		return new AlvaApp({
			activeView: deserializeView(serialized.activeView),
			searchTerm: serialized.searchTerm,
			state: deserializeState(serialized.state)
		});
	}

	public getActiveView(): Types.AlvaView {
		return this.activeView;
	}

	public getActiveFocus(): Types.AppFocus {
		return this.activeFocus;
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

	@Mobx.action
	public setAppFocus(focus: Types.AppFocus): void {
		this.activeFocus = focus;
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
			searchTerm: this.searchTerm,
			state: serializeState(this.state)
		};
	}
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
