import { computeDifference } from '@meetalva/util';
import * as Mobx from 'mobx';
import * as Message from '../message';
import { Project } from './project';
import * as Types from '@meetalva/types';
import * as uuid from 'uuid';
import * as DesignTime from './design-time-user-store';
import { UserStoreAction } from './user-store-action';
import { UserStoreEnhancer } from './user-store-enhancer';
import { UserStoreProperty } from './user-store-property';
import { UserStoreReference } from './user-store-reference';

export interface UserStoreInit {
	id: string;
	properties?: UserStoreProperty[];
	actions?: UserStoreAction[];
	enhancer: UserStoreEnhancer;
	references?: UserStoreReference[];
	currentPageProperty?: UserStoreProperty;
}

export interface UserStoreContext {
	project: Project;
}

export class UserStore {
	public readonly model = Types.ModelName.UserStore;

	private id: string;
	private previousDesignTimeStore?: DesignTime.DesignTimeUserStore;

	@Mobx.observable private actions: Map<string, UserStoreAction> = new Map();
	@Mobx.observable private currentPageProperty: UserStoreProperty;
	@Mobx.observable private enhancer: UserStoreEnhancer;
	@Mobx.observable private internalProperties: Map<string, UserStoreProperty> = new Map();
	@Mobx.observable private references: Map<string, UserStoreReference> = new Map();

	@Mobx.computed
	private get designTimeStore(): DesignTime.DesignTimeUserStore | undefined {
		try {
			const enhanceModule = this.enhancer.getModule();

			if (typeof enhanceModule.onStoreCreate === 'function') {
				this.previousDesignTimeStore = enhanceModule.onStoreCreate(
					new DesignTime.DesignTimeUserStore({
						properties: [...this.internalProperties.values()]
					})
				);
			}

			return this.previousDesignTimeStore;
		} catch (error) {
			console.error(error);
			return this.previousDesignTimeStore;
		}
	}

	@Mobx.computed
	private get properties(): Map<string, UserStoreProperty> {
		const map = new Map();

		this.internalProperties.forEach(prop => {
			map.set(prop.getId(), prop);
		});

		if (!this.designTimeStore) {
			return map;
		}

		this.designTimeStore.getProperties().forEach(designProperty => {
			const previous = designProperty.getProperty();

			if (previous) {
				map.set(previous.getId(), previous);
				return;
			}

			const property = new UserStoreProperty({
				id: designProperty.getName(),
				name: designProperty.getName(),
				getter: designProperty.getGetter(),
				initialValue: designProperty.getValue() || '',
				valueType: Types.UserStorePropertyValueType.String,
				type:
					designProperty.getType() === DesignTime.DesignTimePropertyType.Computed
						? Types.UserStorePropertyType.Computed
						: Types.UserStorePropertyType.Concrete
			});

			designProperty.setProperty(property);
			map.set(property.getId(), property);
		});

		return map;
	}

	public constructor(init: UserStoreInit) {
		this.id = init.id;

		if (init.currentPageProperty) {
			this.currentPageProperty = init.currentPageProperty;
		} else {
			this.currentPageProperty = new UserStoreProperty({
				id: uuid.v4(),
				name: 'Current Page',
				initialValue: '',
				type: Types.UserStorePropertyType.Concrete,
				valueType: Types.UserStorePropertyValueType.Page
			});
		}

		this.currentPageProperty.setValueType(Types.UserStorePropertyValueType.Page);

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

		const switchPageAction = [...this.actions.values()].find(a => a.getName() === 'Switch Page');

		if (switchPageAction) {
			switchPageAction.setUserStoreProperty(this.currentPageProperty);
		}

		(init.references || []).forEach(reference => this.addReference(reference));

		this.enhancer = init.enhancer;
		this.enhancer.setUserStore(this);
	}

	public static from(serialized: Types.SerializedUserStore): UserStore {
		return new UserStore({
			actions: (serialized.actions || []).map(a => UserStoreAction.from(a)),
			currentPageProperty: serialized.currentPageProperty
				? UserStoreProperty.from(serialized.currentPageProperty)
				: undefined,
			enhancer: UserStoreEnhancer.from(serialized.enhancer),
			id: serialized.id,
			properties: Array.from(serialized.properties || []).map(p => UserStoreProperty.from(p)),
			references: Array.from(serialized.references || []).map(r => UserStoreReference.from(r))
		});
	}

	@Mobx.action
	public addAction(action: UserStoreAction): void {
		this.actions.set(action.getId(), action);
	}

	@Mobx.action
	public addProperty(property: UserStoreProperty): void {
		if (property.getValueType() === Types.UserStorePropertyValueType.Page) {
			return;
		}

		this.internalProperties.set(property.getId(), property);
	}

	@Mobx.action
	public addReference(reference: UserStoreReference): void {
		this.references.set(reference.getId(), reference);
	}

	public getActionById(id: string): UserStoreAction | undefined {
		return this.actions.get(id);
	}

	public getActions(): UserStoreAction[] {
		return [...this.actions.values()];
	}

	public getId(): string {
		return this.id;
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
		if (id === this.currentPageProperty.getId()) {
			return this.currentPageProperty;
		}

		return this.properties.get(id);
	}

	public getEnhancer(): UserStoreEnhancer {
		return this.enhancer;
	}

	public getReferenceByElementProperty(
		element: Types.Identifiable
	): UserStoreReference | undefined {
		return this.getReferences().find(
			reference => reference.getElementPropertyId() === element.getId()
		);
	}

	public getPropertyByReference(reference: UserStoreReference): UserStoreProperty | undefined {
		const propertyId = reference.getUserStorePropertyId();

		if (!propertyId) {
			return;
		}

		return this.getPropertyById(propertyId);
	}

	public getReferenceById(id: string): UserStoreReference | undefined {
		return this.references.get(id);
	}

	public getReferences(): UserStoreReference[] {
		return [...this.references.values()];
	}

	@Mobx.action
	public removeAction(property: UserStoreAction): void {
		this.actions.delete(property.getId());
	}

	@Mobx.action
	public removeReference(reference: UserStoreReference): void {
		this.references.delete(reference.getId());
	}

	@Mobx.action
	public removeProperty(property: UserStoreProperty): void {
		this.internalProperties.delete(property.getId());
	}

	@Mobx.action
	public sync(message: Message.ChangeUserStore, opts?: { withEnhancer: boolean }): void {
		const userStore = UserStore.from(message.payload.userStore);

		const propertyChanges = computeDifference<UserStoreProperty>({
			before: [...this.internalProperties.values()],
			after: [...userStore.internalProperties.values()]
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

		const referenceChanges = computeDifference<UserStoreReference>({
			before: this.getReferences(),
			after: userStore.getReferences()
		});

		referenceChanges.added.forEach(change => this.addReference(change.after));
		referenceChanges.changed.forEach(change => change.before.update(change.after));
		referenceChanges.removed.forEach(change => this.removeReference(change.before));

		this.currentPageProperty.update(userStore.currentPageProperty);

		if (opts && !opts.withEnhancer) {
			return;
		}

		this.enhancer.update(userStore.enhancer);
	}

	public toJSON(): Types.SerializedUserStore {
		return {
			model: this.model,
			actions: this.getActions().map(a => a.toJSON()),
			currentPageProperty: this.currentPageProperty.toJSON(),
			enhancer: this.enhancer.toJSON(),
			id: this.id,
			properties: [...this.internalProperties.values()].map(p => p.toJSON()),
			references: this.getReferences().map(r => r.toJSON())
		};
	}

	public update(b: UserStore | Types.SerializedUserStore): void {
		// noop
	}
}
