import * as _ from 'lodash';
import * as Mobx from 'mobx';
import * as Types from '../types';

export interface UserStoreReferenceInit {
	id: string;
	elementPropertyId: string;
	open: boolean;
	userStorePropertyId: string | undefined;
}

export class UserStoreReference {
	public readonly model = Types.ModelName.UserStoreReference;

	private id: string;
	@Mobx.observable private open: boolean;
	@Mobx.observable private elementPropertyId: string;
	@Mobx.observable private userStorePropertyId: string | undefined;

	public constructor(init: UserStoreReferenceInit) {
		this.id = init.id;
		this.elementPropertyId = init.elementPropertyId;
		this.open = init.open;
		this.userStorePropertyId = init.userStorePropertyId;
	}

	public static from(serialized: Types.SerializedUserStoreReference): UserStoreReference {
		return new UserStoreReference(serialized);
	}

	public equals(b: this): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
	}

	public getId(): string {
		return this.id;
	}

	public getElementPropertyId(): string {
		return this.elementPropertyId;
	}

	public getOpen(): boolean {
		return this.open;
	}

	public getUserStorePropertyId(): string | undefined {
		return this.userStorePropertyId;
	}

	@Mobx.action
	public setUserStoreProperty(userStoreProperty: Types.Identifiable): void {
		this.userStorePropertyId = userStoreProperty.getId();
	}

	@Mobx.action
	public setOpen(open: boolean): void {
		this.open = open;
	}

	@Mobx.action
	public update(b: this): void {
		this.id = b.id;
		this.open = b.open;
		this.elementPropertyId = b.elementPropertyId;
		this.userStorePropertyId = b.userStorePropertyId;
	}

	public toJSON(): Types.SerializedUserStoreReference {
		return {
			model: this.model,
			id: this.id,
			open: this.open,
			elementPropertyId: this.elementPropertyId,
			userStorePropertyId: this.userStorePropertyId
		};
	}
}
