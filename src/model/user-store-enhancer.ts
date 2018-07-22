import * as Mobx from 'mobx';
import * as Types from '../types';
import { UserStore } from './user-store';

export interface UserStoreEnhancerInit {
	id: string;
	editedCode?: string;
	code: string;
}

const userStoreApi = (names: string[]) => `
declare module "alva" {
	export type PropertyName = ${names.join(' | ')};

	/**
	 * Alva UserStore during design phase that allows to
	 * add, remove and rename properties.
	 *
	 * Changes to the properties of \`CreatableStore\` will be reflected in the Alva interface.
	 **/
	export interface DesignStore {
		/**
		 * \`\`\`ts
		 * store.getProperties()
		 *   .forEach(prop => {
		 *      if (prop.getValue() === 'Hello') {
		 *         prop.setValue('Hello World');
		 *      }
		 *   })
		 * \`\`\`
		 **/
		getProperties(): DesignProperty[];

		/**
		 * \`\`\`ts
		 * const prop = store.getProperty('Hello');
		 *
		 * if (prop) {
		 *     prop.setValue('World');
		 * }
		 * \`\`\`
		 **/
		getProperty(name: PropertyName): DesignProperty;

		/**
		 * \`\`\`ts
		 * const prop = store.addProperty('Hello', 'World');
		 * const otherProp = store.addProperty('How');
		 * otherProp.setValue('are you?');
		 * \`\`\`
		 **/
		addProperty(name: string, value?: string): DesignProperty;

		/**
		 * Remove a UserStore propery by reference or its name
		 **/
		removeProperty(name: PropertyName): void;
		removeProperty(prop: DesignProperty): void;
	}

	export interface DesignProperty {
		/**
		 * \`\`\`ts
		 * prop.setName('SomeVariable');
		 * \`\`\`
		 **/
		setName(name: string): void;

		/**
		 * \`\`\`ts
		 * const name = prop.getName();
		 * \`\`\`
		 **/
		getName(): PropertyName;

		/**
		 * \`\`\`ts
		 * const value = prop.getValue();
		 * \`\`\`
		 **/
		getValue(): string | undefined;

		/**
		 * \`\`\`ts
		 * prop.setValue('World');
		 * \`\`\`
		 **/
		setValue(value: string): void;
	}

	/**
	 * Alva UserStore during runtime.
	 * Properties can not be added or removed, but their values can be read/set.
	 **/
	export interface RuntimeStore {
		/**
		 * \`\`\`ts
		 * store.getProperties()
		 *   .forEach(prop => {
		 *      if (prop.getValue() === 'Hello') {
		 *         prop.setValue('Hello World');
		 *      }
		 *   })
		 * \`\`\`
		 **/
		getProperties(): RuntimeProperty[];

		/**
		 * \`\`\`ts
		 * const prop = store.getProperty('Hello');
		 *
		 * if (prop) {
		 *     prop.setValue('World');
		 * }
		 * \`\`\`
		 **/
		getProperty(name: PropertyName): RuntimeProperty;
	}

	export interface RuntimeProperty {
		/**
		 * \`\`\`ts
		 * const name = prop.getName();
		 * \`\`\`
		 **/
		getName(): PropertyName;

		/**
		 * \`\`\`ts
		 * const value = prop.getValue();
		 * \`\`\`
		 **/
		getValue(): string | undefined;

		/**
		 * \`\`\`ts
		 * prop.setValue('World');
		 * \`\`\`
		 **/
		setValue(value: string): void;
	}
}`;

export const defaultCode = `import * as Alva from 'alva';

export function onStoreCreate(store: Alva.DesignStore): Alva.DesignStore {
	// Add properties to your store here, e.g.:
	// store.addProperty('Hello', 'World');
	return store;
}

export function onStoreUpdate(store: Alva.RuntimeStore): Alva.RuntimeStore {
	// Set property values here, e.g.
	// store.setProperty('Hello', store.getProperty('Hello') + ' World');
	return store;
}
`;

export class UserStoreEnhancer {
	@Mobx.observable private id: string;
	@Mobx.observable private code: string;

	private usetStore: UserStore;

	public constructor(init: UserStoreEnhancerInit) {
		this.id = init.id;
		this.code = init.code;
	}

	public static from(serialized: Types.SerializedUserStoreEnhancer): UserStoreEnhancer {
		return new UserStoreEnhancer(serialized);
	}

	public getApi(): string {
		return userStoreApi(this.usetStore.getProperties().map(p => JSON.stringify(p.getName())));
	}

	public getCode(): string {
		return this.code;
	}

	@Mobx.action
	public setCode(code: string): void {
		this.code = code;
	}

	public setUserStore(userStore: UserStore): void {
		this.usetStore = userStore;
	}

	public toJSON(): Types.SerializedUserStoreEnhancer {
		return {
			id: this.id,
			code: this.code
		};
	}

	public update(b: this): void {
		this.code = b.code;
	}
}
