import * as _ from 'lodash';
import * as Mobx from 'mobx';
import * as Types from '../../types';

export interface UserStorePropertyInit {
	id: string;
	name: string;
	payload: string;
	type: UserStorePropertyType;
}

export enum UserStorePropertyType {
	String,
	Page
}

export class UserStoreProperty {
	private id: string;
	@Mobx.observable private name: string;
	@Mobx.observable private payload: string;
	private type: UserStorePropertyType;

	public constructor(init: UserStorePropertyInit) {
		this.id = init.id;
		this.name = init.name;
		this.payload = init.payload;
		this.type = init.type;
	}

	public static from(serialized: Types.SerializedUserStoreProperty): UserStoreProperty {
		return new UserStoreProperty({
			id: serialized.id,
			name: serialized.name,
			payload: serialized.payload,
			type: deserializeType(serialized.type)
		});
	}

	public equals(b: UserStoreProperty): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public getPayload(): string {
		return this.payload;
	}

	public getType(): Types.UserStorePropertyType {
		return this.type;
	}

	@Mobx.action
	public setName(name: string): void {
		this.name = name;
	}

	@Mobx.action
	public setPayload(payload: string): void {
		this.payload = payload;
	}

	public toJSON(): Types.SerializedUserStoreProperty {
		return {
			id: this.id,
			name: this.name,
			payload: this.payload,
			type: serializeType(this.type)
		};
	}

	@Mobx.action
	public update(b: UserStoreProperty): void {
		this.id = b.id;
		this.name = b.name;
		this.payload = b.payload;
		this.type = b.type;
	}
}

function deserializeType(type: Types.SerializedUserStorePropertyType): Types.UserStorePropertyType {
	switch (type) {
		case 'string':
			return Types.UserStorePropertyType.String;
		case 'page':
			return Types.UserStorePropertyType.Page;
		default:
			throw new Error(`Unknown user store property type: ${type}`);
	}
}

function serializeType(type: Types.UserStorePropertyType): Types.SerializedUserStorePropertyType {
	switch (type) {
		case Types.UserStorePropertyType.String:
			return 'string';
		case Types.UserStorePropertyType.Page:
			return 'page';
		default:
			throw new Error(`Unknown user store property type: ${type}`);
	}
}
