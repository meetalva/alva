import * as Fs from 'fs';
import * as Mobx from 'mobx';
import * as Types from '../types';
import * as TypeScript from 'typescript';
import { UserStore } from './user-store';
import { DesignTimeUserStore } from './design-time-user-store';
import * as uuid from 'uuid';
import * as VM from 'vm';

const MemoryFilesystem = require('memory-fs');

export interface UserStoreEnhancerModule {
	onStoreCreate(store: DesignTimeUserStore): DesignTimeUserStore;
}

export interface UserStoreEnhancerInit {
	id: string;
	editedCode?: string;
	code: string;
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

export class UserStoreEnhancer {
	public readonly model = Types.ModelName.UserStoreEnhancer;

	@Mobx.observable private id: string;
	@Mobx.observable private code: string;

	@Mobx.computed
	private get js(): string {
		const fs = new MemoryFilesystem();
		fs.writeFileSync('/file.ts', this.code);
		compile('/file.ts', {
			compilerOptions: {},
			fs,
			languageVersion: TypeScript.ScriptTarget.ESNext
		});
		return String(fs.readFileSync('/file.js'));
	}

	@Mobx.computed
	private get module(): UserStoreEnhancerModule {
		const context = { exports: {}, module: { exports: {} }, console };
		VM.runInNewContext(this.getJavaScript(), context);
		return context.exports as UserStoreEnhancerModule;
	}

	private usetStore: UserStore;

	public constructor(init: UserStoreEnhancerInit) {
		this.id = init.id;
		this.code = init.code;

		if (!init) {
			this.id = uuid.v4();
			this.code = defaultCode;
		}
	}

	public static from(serialized: Types.SerializedUserStoreEnhancer): UserStoreEnhancer {
		return new UserStoreEnhancer(serialized || {});
	}

	public getApi(): string {
		return userStoreApi(this.usetStore.getProperties().map(p => JSON.stringify(p.getName())));
	}

	public getCode(): string {
		return this.code;
	}

	public getId(): string {
		return this.id;
	}

	public getJavaScript(): string {
		return this.js;
	}

	public getModule(): UserStoreEnhancerModule {
		return this.module;
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
			model: this.model,
			id: this.id,
			code: this.code
		};
	}

	public update(b: this): void {
		this.code = b.code;
	}
}

export interface CompileOptions {
	fs: typeof Fs;
	languageVersion: TypeScript.ScriptTarget;
	compilerOptions: TypeScript.CompilerOptions;
}

function compile(filename: string, opts: CompileOptions): typeof Fs {
	const compilerHost: TypeScript.CompilerHost = {
		fileExists(sourceFileName: string): boolean {
			return opts.fs.existsSync(`/${sourceFileName}`);
		},
		getCanonicalFileName(sourceFileName: string): string {
			return sourceFileName;
		},
		getCurrentDirectory(): string {
			return '';
		},
		getDefaultLibFileName(): string {
			return 'lib.d.ts';
		},
		getDirectories(): string[] {
			return [];
		},
		getNewLine(): string {
			return '\n';
		},
		getSourceFile(sourceFileName: string): TypeScript.SourceFile | undefined {
			if (!opts.fs.existsSync(`/${sourceFileName}`)) {
				return;
			}

			const source = opts.fs.readFileSync(`/${sourceFileName}`);

			if (!source) {
				return;
			}

			return TypeScript.createSourceFile(filename, source.toString(), opts.languageVersion);
		},
		useCaseSensitiveFileNames(): boolean {
			return false;
		},
		readFile(sourceFileName: string): string | undefined {
			const buffer = opts.fs.readFileSync(sourceFileName);
			return buffer ? buffer.toString() : undefined;
		},
		writeFile(sourceFileName: string, text: string): void {
			opts.fs.writeFileSync(`/${sourceFileName}`, text);
		}
	};

	const program = TypeScript.createProgram(['file.ts'], opts.compilerOptions, compilerHost);
	program.emit();

	return opts.fs;
}
