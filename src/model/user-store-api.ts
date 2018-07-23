import * as Mobx from 'mobx';
import * as Types from '../types';
import * as uuid from 'uuid';
import { UserStore } from './user-store';
import { UserStoreProperty } from './user-store-property';

export class DesignTimeUserStore implements Types.DesignTimeUserStore {
	private store: UserStore;

	@Mobx.computed
	private get properties(): DesignTimeProperty[] {
		return this.store.getProperties().map(p => new DesignTimeProperty(p));
	}

	public constructor(store: UserStore) {
		this.store = store;
	}

	public getProperties(): DesignTimeProperty[] {
		return this.properties;
	}

	public getProperty(name: string): DesignTimeProperty | undefined {
		return this.properties.find(p => p.getName() === name);
	}

	public addProperty(name: string, value?: string): DesignTimeProperty {
		const previous = this.store.getProperties().find(p => p.getName() === name);

		const prop =
			previous ||
			new UserStoreProperty({
				id: uuid.v4(),
				name,
				payload: value || '',
				type: Types.UserStorePropertyType.String
			});

		if (!previous) {
			this.store.addProperty(prop);
		}

		if (typeof value !== 'undefined') {
			prop.setPayload(value);
		}

		return new DesignTimeProperty(prop);
	}

	public removeProperty(prop: string | DesignTimeProperty): void {
		const name = typeof prop === 'string' ? prop : prop.getName();

		const property = this.store.getProperties().find(p => p.getName() === name);

		if (!property) {
			return;
		}

		this.store.removeProperty(property);
	}
}

export class DesignTimeProperty implements Types.DesignTimeProperty {
	private property: UserStoreProperty;

	public constructor(property: UserStoreProperty) {
		this.property = property;
	}

	public setName(name: string): void {
		this.property.setName(name);
	}

	public getName(): string {
		return this.property.getName();
	}

	public getValue(): string | undefined {
		return this.property.getPayload();
	}

	public setValue(value: string): void {
		this.property.setPayload(value);
	}
}

export class RuntimeUserStore implements Types.RuntimeUserStore {
	private store: UserStore;

	@Mobx.computed
	private get properties(): RuntimeProperty[] {
		return this.store.getProperties().map(p => new RuntimeProperty(p));
	}

	public constructor(store: UserStore) {
		this.store = store;
	}

	public getProperties(): RuntimeProperty[] {
		return this.properties;
	}

	public getProperty(name: string): RuntimeProperty | undefined {
		return this.properties.find(p => p.getName() === name);
	}
}

export class RuntimeProperty implements Types.RuntimeProperty {
	private property: UserStoreProperty;

	public constructor(property: UserStoreProperty) {
		this.property = property;
	}

	public getName(): string {
		return this.property.getName();
	}

	public getValue(): string | undefined {
		return this.property.getPayload();
	}

	public setValue(value: string): void {
		this.property.setPayload(value);
	}
}
