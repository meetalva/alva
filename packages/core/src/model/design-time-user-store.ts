import * as Mobx from 'mobx';
import * as Types from '@meetalva/types';
import { UserStoreProperty } from './user-store-property';

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

export enum DesignTimePropertyType {
	Computed,
	Concrete
}

export class DesignTimeUserStore {
	@Mobx.observable private internalStoreProperties: UserStoreProperty[] = [];
	@Mobx.observable private internalProperties: DesignTimeProperty[] = [];

	@Mobx.computed
	private get storeProperties(): DesignTimeProperty[] {
		return this.internalStoreProperties.map(p => DesignTimeProperty.fromProperty(p));
	}

	@Mobx.computed
	private get allProperties(): Map<string, DesignTimeProperty> {
		return [...this.storeProperties, ...this.internalProperties].reduce((m, p) => {
			m.set(p.getName(), p);
			return m;
		}, new Map());
	}

	public constructor({ properties }: { properties: UserStoreProperty[] }) {
		this.internalStoreProperties = properties;
	}

	public getProperties(): DesignTimeProperty[] {
		return [...this.allProperties.values()];
	}

	public getDesignProperties(): DesignTimeProperty[] {
		return this.internalProperties;
	}

	public getProperty(name: string): DesignTimeProperty | undefined {
		return this.allProperties.get(name);
	}

	public defineProperty(name: string, descriptor: DesignTimeDescriptor): DesignTimeProperty {
		const prop = DesignTimeProperty.fromDescriptor(name, descriptor);
		this.internalProperties.push(prop);

		return prop;
	}
}

export interface DesignTimePropertyInit {
	name: string;
	type: DesignTimePropertyType;
	value: string | undefined;
	getter: Computation | undefined;
}

export type Computation = () => string;

export class DesignTimeProperty {
	@Mobx.observable private internalName: string;
	@Mobx.observable private internalType: DesignTimePropertyType;
	@Mobx.observable private internalValue: string | undefined;
	@Mobx.observable private internalGetter: Computation | undefined;
	private property: UserStoreProperty | undefined;

	@Mobx.computed
	private get name(): string {
		if (this.property) {
			return this.property.getName();
		}

		return this.internalName;
	}

	@Mobx.computed
	private get type(): DesignTimePropertyType {
		if (this.property) {
			return this.property.getType() === Types.UserStorePropertyType.Concrete
				? DesignTimePropertyType.Concrete
				: DesignTimePropertyType.Computed;
		}

		return this.internalType;
	}

	@Mobx.computed
	private get value(): string | undefined {
		if (this.property) {
			this.property.getValue();
		}

		return this.internalValue;
	}

	@Mobx.computed
	private get getter(): Computation | undefined {
		if (this.property) {
			this.property.getGetter();
		}

		return this.internalGetter;
	}

	public constructor(init: DesignTimePropertyInit) {
		this.internalName = init.name;
		this.internalType = init.type;
		this.internalValue = init.value;
		this.internalGetter = init.getter;
	}

	public static fromProperty(property: UserStoreProperty): DesignTimeProperty {
		const prop = new DesignTimeProperty({
			name: property.getName(),
			type:
				property.getType() === Types.UserStorePropertyType.Concrete
					? DesignTimePropertyType.Concrete
					: DesignTimePropertyType.Computed,
			value: property.getValue(),
			getter: property.getGetter()
		});

		prop.setProperty(property);
		return prop;
	}

	public static fromDescriptor(
		name: string,
		descriptor: DesignTimeDescriptor
	): DesignTimeProperty {
		const qualified = qualifyDescriptor(descriptor);

		return new DesignTimeProperty({
			name,
			type: qualified.type,
			value: qualified.value,
			getter: qualified.get
		});
	}

	public configureProperty(descriptor: DesignTimeDescriptor): void {
		const qualified = qualifyDescriptor(descriptor);

		this.internalType = qualified.type;
		this.internalValue = qualified.value;
		this.internalGetter = qualified.get;
	}

	public getName(): string {
		return this.name;
	}

	public getType(): DesignTimePropertyType {
		return this.type;
	}

	public getValue(): string | undefined {
		return this.value;
	}

	public getGetter(): Computation | undefined {
		return this.getter;
	}

	public getProperty(): UserStoreProperty | undefined {
		return this.property;
	}

	public setProperty(property: UserStoreProperty): void {
		this.property = property;

		Mobx.autorun(() => {
			this.internalName = property.getName();
			this.internalType =
				property.getType() === Types.UserStorePropertyType.Concrete
					? DesignTimePropertyType.Concrete
					: DesignTimePropertyType.Computed;
			this.internalValue = property.getValue();
			this.internalGetter = property.getGetter();
		});
	}
}

function qualifyDescriptor(descriptor: DesignTimeDescriptor): QualifiedDesignTimeDescriptor {
	if (typeof descriptor.get === 'function') {
		return {
			type: DesignTimePropertyType.Computed,
			get: descriptor.get,
			value: undefined
		};
	}

	return {
		type: DesignTimePropertyType.Concrete,
		get: undefined,
		value: descriptor.value || ''
	};
}
