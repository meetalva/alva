import * as Mobx from 'mobx';
import { Project } from './project';
import * as Types from '../types';
import { UserStoreAction } from './user-store-action';
import { UserStoreProperty } from './user-store-property';

export interface UserStoreInit {
	actions: UserStoreAction[];
	id: string;
	properties: UserStoreProperty[];
}

export interface UserStoreContext {
	project: Project;
}

export class UserStore {
	@Mobx.observable private actions: UserStoreAction[] = [];
	private id: string;
	@Mobx.observable private properties: UserStoreProperty[] = [];

	public constructor(init: UserStoreInit) {
		this.id = init.id;
		this.properties = init.properties;
		this.actions = init.actions;
	}

	public static from(serialized: Types.SerializedUserStore): UserStore {
		return new UserStore({
			actions: serialized.actions.map(a => UserStoreAction.from(a)),
			id: serialized.id,
			properties: serialized.properties.map(p => UserStoreProperty.from(p))
		});
	}

	@Mobx.action
	public addProperty(property: UserStoreProperty): void {
		this.properties.push(property);
	}

	public getActionById(id: string): UserStoreAction | undefined {
		return this.actions.find(a => a.getId() === id);
	}

	public getActions(): UserStoreAction[] {
		return this.actions;
	}

	public getNoopAction(): UserStoreAction {
		return this.actions.find(
			a => a.getType() === Types.UserStoreActionType.Noop
		) as UserStoreAction;
	}

	public getProperties(): UserStoreProperty[] {
		return this.properties;
	}

	public getPropertyById(id: string): UserStoreProperty | undefined {
		return this.properties.find(p => p.getId() === id);
	}

	public toJSON(): Types.SerializedUserStore {
		return {
			actions: this.actions.map(a => a.toJSON()),
			id: this.id,
			properties: this.properties.map(p => p.toJSON())
		};
	}
}
