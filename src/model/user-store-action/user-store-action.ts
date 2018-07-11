import * as Types from '../../types';
import * as _ from 'lodash';
import * as Mobx from 'mobx';
import { UserStore } from '../user-store';
import { UserStoreProperty } from '../user-store-property';
import * as uuid from 'uuid';

export interface UserStoreActionInit {
	acceptsProperty: boolean;
	id: string;
	name: string;
	userStorePropertyId?: string;
	type: Types.UserStoreActionType;
}

export class UserStoreAction {
	private acceptsProperty: boolean;
	private id: string;
	@Mobx.observable private name: string;
	private userStore: UserStore;
	@Mobx.observable private userStorePropertyId?: string;
	private type: Types.UserStoreActionType;

	public constructor(init: UserStoreActionInit) {
		this.acceptsProperty = init.acceptsProperty;
		this.id = init.id;
		this.name = init.name;
		this.userStorePropertyId = init.userStorePropertyId;
		this.type = init.type;
	}

	public static from(serialized: Types.SerializedUserStoreAction): UserStoreAction {
		return new UserStoreAction({
			acceptsProperty: serialized.acceptsProperty,
			id: serialized.id,
			name: serialized.name,
			userStorePropertyId: serialized.storePropertyId,
			type: deserializeType(serialized.type)
		});
	}

	public clone(): UserStoreAction {
		return new UserStoreAction({
			id: uuid.v4(),
			acceptsProperty: this.acceptsProperty,
			name: this.name,
			type: this.type,
			userStorePropertyId: this.userStorePropertyId
		});
	}

	public equals(b: UserStoreAction): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
	}

	public getAcceptsProperty(): boolean {
		return this.acceptsProperty;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public getUserStorePropertyId(): string | undefined {
		return this.userStorePropertyId;
	}

	public getUserStoreProperty(): UserStoreProperty | undefined {
		if (!this.userStore || !this.userStorePropertyId) {
			return;
		}

		return this.userStore.getPropertyById(this.userStorePropertyId);
	}

	public getType(): Types.UserStoreActionType {
		return this.type;
	}

	@Mobx.action
	public setUserStore(userStore: UserStore): void {
		this.userStore = userStore;
	}

	public toJSON(): Types.SerializedUserStoreAction {
		return {
			acceptsProperty: this.acceptsProperty,
			id: this.id,
			name: this.name,
			storePropertyId: this.userStorePropertyId,
			type: serializeType(this.type)
		};
	}

	@Mobx.action
	public unsetUserStoreProperty(): void {
		this.userStorePropertyId = undefined;
	}

	@Mobx.action
	public update(b: this): void {
		this.acceptsProperty = b.acceptsProperty;
		this.id = b.id;
		this.name = b.name;
		this.userStorePropertyId = b.userStorePropertyId;
		this.type = b.type;
	}
}

function deserializeType(type: Types.SerializedUserStoreActionType): Types.UserStoreActionType {
	switch (type) {
		case 'noop':
			return Types.UserStoreActionType.Noop;
		case 'set':
			return Types.UserStoreActionType.Set;
		case 'open-external':
			return Types.UserStoreActionType.OpenExternal;
		default:
			throw new Error(`Unknown user store action type: ${type}`);
	}
}

function serializeType(type: Types.UserStoreActionType): Types.SerializedUserStoreActionType {
	switch (type) {
		case Types.UserStoreActionType.Noop:
			return 'noop';
		case Types.UserStoreActionType.Set:
			return 'set';
		case Types.UserStoreActionType.OpenExternal:
			return 'open-external';
		default:
			throw new Error(`Unknown user store action type: ${type}`);
	}
}
