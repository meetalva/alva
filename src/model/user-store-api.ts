import { UserStore } from './user-store';
import { UserStoreProperty } from './user-store-property';
import * as Types from '../types';
import * as uuid from 'uuid';

export class UserStoreApi {
	private userStore: UserStore;

	public constructor(userStore: UserStore) {
		this.userStore = this.userStore;
	}

	public getProperty(name: string): UserStorePropertyApi | undefined {
		const prop = this.userStore.getProperties().find(p => p.getName() === name);

		if (!prop) {
			return;
		}

		return new UserStorePropertyApi(prop);
	}

	public addProperty(name: string, value: string): UserStorePropertyApi {
		const prop = new UserStoreProperty({
			id: uuid.v4(),
			name,
			payload: value,
			type: Types.UserStorePropertyType.String
		});

		this.userStore.addProperty(prop);

		return new UserStorePropertyApi(prop);
	}

	public removeProperty(name: string): void {
		const prop = this.userStore.getProperties().find(p => p.getName() === name);

		if (!prop) {
			return;
		}

		this.userStore.removeProperty(prop);
	}
}

export class UserStorePropertyApi {
	private property: UserStoreProperty;

	public constructor(property: UserStoreProperty) {
		this.property = this.property;
	}

	public getName(): string {
		return this.property.getName();
	}

	public getValue(): string | undefined {
		return this.property.getPayload();
	}
}
