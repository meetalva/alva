// import * as Fs from 'fs';
import * as Mobx from 'mobx';
import * as Types from '../types';
// import * as TypeScript from 'typescript';
import { UserStore } from './user-store';
import { DesignTimeUserStore } from './design-time-user-store';
import * as uuid from 'uuid';
import * as VM from 'vm';

// const MemoryFilesystem = require('memory-fs');

export interface UserStoreEnhancerModule {
	onStoreCreate(store: DesignTimeUserStore): DesignTimeUserStore;
}

export interface UserStoreEnhancerInit {
	id: string;
	typeScript: string;
	javaScript: string;
}

const userStoreApi = (names: string[]) => `
declare module "alva" {
	export type PropertyName = ${names.join(' | ')};
	export type DesignTimeDescriptor = ConcreteDesignTimeDescriptor | ComputedDesignTimeDescriptor;

	export interface ConcreteDesignTimeDescriptor {
		type?: DesignTimePropertyType.Concrete;
		value: string;
		get?: undefined;
	}
	export interface ComputedDesignTimeDescriptor {
		type?: DesignTimePropertyType.Computed;
		value?: undefined;
		get(): string;
	}
	export type QualifiedDesignTimeDescriptor =
		| QualifiedConcreteDesignTimeDescriptor
		| QualifiedComputedDesignTimeDescriptor;
	export interface QualifiedConcreteDesignTimeDescriptor {
		type: DesignTimePropertyType.Concrete;
		value: string;
		get: undefined;
	}
	export interface QualifiedComputedDesignTimeDescriptor {
		type: DesignTimePropertyType.Computed;
		value: undefined;
		get(): string;
	}
	export declare enum DesignTimePropertyType {
		Computed = 0,
		Concrete = 1,
	}
	export declare class DesignTimeUserStore {
		getProperties(): DesignTimeProperty[];
		getProperty(name: PropertyName): DesignTimeProperty;
		defineProperty(name: string, descriptor: DesignTimeDescriptor): DesignTimeProperty;
	}
	export interface DesignTimePropertyInit {
		name: string;
		type: DesignTimePropertyType;
		value: string | undefined;
		getter: Computation | undefined;
	}
	export declare type Computation = () => string;
	export declare class DesignTimeProperty {
		configureProperty(descriptor: DesignTimeDescriptor): void;
		getName(): PropertyName;
		getType(): DesignTimePropertyType;
		getValue(): string | undefined;
		getGetter(): Computation | undefined;
	}
}`;

export const defaultCode = `import * as Alva from 'alva';

export function onStoreCreate(store: Alva.DesignTimeUserStore): Alva.DesignTimeUserStore {
	// Add properties to your store here, e.g.:
	// store.defineProperty('hello', { value: 'Hello' });
	// store.defineProperty('world', { value: 'World' });
	// store.defineProperty('helloWorld', { get: () => store.getProperty('hello').getValue() + ' ' + store.getProperty('world').getValue() });
	return store;
}
`;

export const defaultJavaScript =
	'exports.onStoreCreate = function onStoreCreate(store) { return store; }';

export class UserStoreEnhancer {
	public readonly model = Types.ModelName.UserStoreEnhancer;

	@Mobx.observable private id: string;
	@Mobx.observable private typeScript: string;
	@Mobx.observable private javaScript: string;

	// @Mobx.computed
	// private get js(): string {
	// 	const fs = new MemoryFilesystem();
	// 	fs.writeFileSync('/file.ts', this.code);
	// 	compile('/file.ts', {
	// 		compilerOptions: {},
	// 		fs,
	// 		languageVersion: TypeScript.ScriptTarget.ESNext
	// 	});
	// 	return String(fs.readFileSync('/file.js'));
	// }

	@Mobx.computed
	private get module(): UserStoreEnhancerModule {
		const context = { exports: {}, module: { exports: {} }, console };
		VM.runInNewContext(this.javaScript, context);
		return context.exports as UserStoreEnhancerModule;
	}

	private usetStore: UserStore;

	public constructor(init: UserStoreEnhancerInit) {
		this.id = init.id;
		this.typeScript = init.typeScript;
		this.javaScript = init.javaScript;

		if (!init) {
			this.id = uuid.v4();
			this.typeScript = defaultCode;
			this.javaScript = defaultJavaScript;
		}
	}

	public static from(serialized: Types.SerializedUserStoreEnhancer): UserStoreEnhancer {
		return new UserStoreEnhancer(serialized || {});
	}

	public getApi(): string {
		return userStoreApi(this.usetStore.getProperties().map(p => JSON.stringify(p.getName())));
	}

	public getId(): string {
		return this.id;
	}

	public getTypeScript(): string {
		return this.typeScript;
	}

	public getModule(): UserStoreEnhancerModule {
		return this.module;
	}

	@Mobx.action
	public setTypeScript(code: string): void {
		this.typeScript = code;
	}

	@Mobx.action
	public setJavaScript(javaScript: string): void {
		this.javaScript = javaScript;
	}

	public setUserStore(userStore: UserStore): void {
		this.usetStore = userStore;
	}

	public toJSON(): Types.SerializedUserStoreEnhancer {
		return {
			model: this.model,
			id: this.id,
			typeScript: this.typeScript,
			javaScript: this.javaScript
		};
	}

	public update(b: this): void {
		this.typeScript = b.typeScript;
	}
}
