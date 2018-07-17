import { computeDifference } from '../alva-util';
import * as Mobx from 'mobx';
import * as Message from '../message';
import { Project } from './project';
import * as Types from '../types';
import * as uuid from 'uuid';
import { UserStoreAction } from './user-store-action';
import { UserStoreProperty } from './user-store-property';

export interface UserStoreInit {
	id: string;
	properties?: UserStoreProperty[];
	actions?: UserStoreAction[];
	currentPageProperty?: UserStoreProperty;
}

export interface UserStoreContext {
	project: Project;
}

export class UserStore {
	private id: string;
	private actions: Map<string, UserStoreAction> = new Map();
	private currentPageProperty: UserStoreProperty;
	@Mobx.observable private properties: Map<string, UserStoreProperty> = new Map();

	public constructor(init: UserStoreInit) {
		this.id = init.id;

		if (init.currentPageProperty) {
			this.currentPageProperty = init.currentPageProperty;
		} else {
			this.currentPageProperty = new UserStoreProperty({
				id: uuid.v4(),
				name: 'Current Page',
				payload: '',
				type: Types.UserStorePropertyType.Page
			});
		}

		(init.properties || []).forEach(prop => this.addProperty(prop));

		const actions = init.actions || [];

		[
			new UserStoreAction({
				acceptsProperty: false,
				id: uuid.v4(),
				name: 'No Interaction',
				type: Types.UserStoreActionType.Noop
			}),
			new UserStoreAction({
				acceptsProperty: false,
				id: uuid.v4(),
				name: 'Switch Page',
				userStorePropertyId: this.currentPageProperty.getId(),
				type: Types.UserStoreActionType.Set
			}),
			new UserStoreAction({
				acceptsProperty: false,
				id: uuid.v4(),
				name: 'Navigate',
				userStorePropertyId: undefined,
				type: Types.UserStoreActionType.OpenExternal
			}),
			new UserStoreAction({
				acceptsProperty: true,
				id: uuid.v4(),
				name: 'Set Variable',
				type: Types.UserStoreActionType.Set
			})
		]
			.filter(
				b => !actions.some(i => b.getType() === i.getType() && b.getName() === i.getName())
			)
			.forEach(b => actions.push(b));

		actions.forEach(action => this.addAction(action));
	}

	public static from(serialized: Types.SerializedUserStore): UserStore {
		return new UserStore({
			actions: serialized.actions.map(a => UserStoreAction.from(a)),
			currentPageProperty: serialized.currentPageProperty
				? UserStoreProperty.from(serialized.currentPageProperty)
				: undefined,
			id: serialized.id,
			properties: serialized.properties.map(p => UserStoreProperty.from(p))
		});
	}

	@Mobx.action
	public addAction(action: UserStoreAction): void {
		this.actions.set(action.getId(), action);
	}

	@Mobx.action
	public addProperty(property: UserStoreProperty): void {
		this.properties.set(property.getId(), property);
	}

	public getActionById(id: string): UserStoreAction | undefined {
		return this.actions.get(id);
	}

	public getActions(): UserStoreAction[] {
		return [...this.actions.values()];
	}

	public getNoopAction(): UserStoreAction {
		return this.getActions().find(
			a => a.getType() === Types.UserStoreActionType.Noop
		) as UserStoreAction;
	}

	public getPageProperty(): UserStoreProperty {
		return this.currentPageProperty;
	}

	public getProperties(): UserStoreProperty[] {
		return [...this.properties.values()];
	}

	public getPropertyById(id: string): UserStoreProperty | undefined {
		return this.properties.get(id);
	}

	@Mobx.action
	public removeAction(property: UserStoreAction): void {
		this.actions.delete(property.getId());
	}

	@Mobx.action
	public removeProperty(property: UserStoreProperty): void {
		this.properties.delete(property.getId());
	}

	@Mobx.action
	public sync(message: Message.ChangeUserStore): void {
		const userStore = UserStore.from(message.payload.userStore);

		const propertyChanges = computeDifference<UserStoreProperty>({
			before: this.getProperties(),
			after: userStore.getProperties()
		});

		propertyChanges.added.forEach(change => this.addProperty(change.after));
		propertyChanges.changed.forEach(change => change.before.update(change.after));
		propertyChanges.removed.forEach(change => this.removeProperty(change.before));

		const actionChanges = computeDifference<UserStoreAction>({
			before: this.getActions(),
			after: userStore.getActions()
		});

		actionChanges.added.forEach(change => this.addAction(change.after));
		actionChanges.changed.forEach(change => change.before.update(change.after));
		actionChanges.removed.forEach(change => this.removeAction(change.before));
	}

	public toJSON(): Types.SerializedUserStore {
		return {
			actions: this.getActions().map(a => a.toJSON()),
			currentPageProperty: this.currentPageProperty.toJSON(),
			id: this.id,
			properties: this.getProperties().map(p => p.toJSON())
		};
	}
}
