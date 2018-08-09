import * as _ from 'lodash';
import * as Mobx from 'mobx';
import { Project } from '../project';
import * as Types from '../../types';

export interface UserStorePropertyInit {
	id: string;
	name: string;
	initialValue: string;
	concreteValue?: string;
	valueType: Types.UserStorePropertyValueType;
	type: Types.UserStorePropertyType;
	getter?(): string;
}

const NOOP = () => '';

export class UserStoreProperty {
	public readonly model = Types.ModelName.UserStoreProperty;

	private id: string;
	private project: Project;

	@Mobx.observable private concreteValue: string | undefined;
	@Mobx.observable private initialValue: string;
	@Mobx.observable private getter: () => string;
	@Mobx.observable private name: string;
	@Mobx.observable private type: Types.UserStorePropertyType;
	@Mobx.observable private valueType: Types.UserStorePropertyValueType;

	@Mobx.computed
	private get value(): string {
		if (this.type === Types.UserStorePropertyType.Computed) {
			try {
				return this.getter();
			} catch (err) {
				console.log(this);
				console.error(err);
				return '';
			}
		}

		if (typeof this.concreteValue === 'undefined') {
			return this.initialValue;
		}

		return this.concreteValue;
	}

	public constructor(init: UserStorePropertyInit) {
		this.id = init.id;
		this.name = init.name;
		this.initialValue = init.initialValue;
		this.concreteValue = init.concreteValue;
		this.valueType = init.valueType;
		this.type = init.type;
		this.getter = init.getter || NOOP;
	}

	public static from(serialized: Types.SerializedUserStoreProperty): UserStoreProperty {
		return new UserStoreProperty({
			id: serialized.id,
			name: serialized.name,
			concreteValue: serialized.concreteValue,
			initialValue: serialized.initialValue,
			type: deserializeType(serialized.type),
			valueType: deserializeValueType(serialized.valueType)
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

	public getValue(): string {
		return this.value;
	}

	public getType(): Types.UserStorePropertyType {
		return this.type;
	}

	public getValueType(): Types.UserStorePropertyValueType {
		return this.valueType;
	}

	public getGetter(): () => string {
		return this.getter;
	}

	@Mobx.action
	public setName(name: string): void {
		this.name = name;
	}

	@Mobx.action
	public setValue(value: string): void {
		// Skip if we try to switch to a page that does not exist
		if (this.getValueType() === Types.UserStorePropertyValueType.Page) {
			if (this.project && !this.project.getPageById(value)) {
				return;
			}
		}

		this.concreteValue = value;
	}

	public setProject(project: Project): void {
		this.project = project;
	}

	public toJSON(): Types.SerializedUserStoreProperty {
		return {
			model: this.model,
			id: this.id,
			name: this.name,
			concreteValue: this.concreteValue,
			initialValue: this.initialValue,
			type: serializeType(this.type),
			valueType: serializeValueType(this.valueType)
		};
	}

	@Mobx.action
	public update(b: UserStoreProperty): void {
		this.id = b.id;
		this.name = b.name;
		this.concreteValue = b.concreteValue;
		this.valueType = deserializeValueType(b.valueType);
	}
}

function deserializeValueType(
	type: Types.SerializedUserStorePropertyValueType
): Types.UserStorePropertyValueType {
	switch (type) {
		case 'string':
			return Types.UserStorePropertyValueType.String;
		case 'page':
			return Types.UserStorePropertyValueType.Page;
	}
}

function serializeValueType(
	type: Types.UserStorePropertyValueType
): Types.SerializedUserStorePropertyValueType {
	switch (type) {
		case Types.UserStorePropertyValueType.String:
			return 'string';
		case Types.UserStorePropertyValueType.Page:
			return 'page';
	}
}

function deserializeType(type: Types.SerializedUserStorePropertyType): Types.UserStorePropertyType {
	switch (type) {
		case 'computed':
			return Types.UserStorePropertyType.Computed;
		case 'concrete':
			return Types.UserStorePropertyType.Concrete;
	}
}

function serializeType(type: Types.UserStorePropertyType): Types.SerializedUserStorePropertyType {
	switch (type) {
		case Types.UserStorePropertyType.Computed:
			return 'computed';
		case Types.UserStorePropertyType.Concrete:
			return 'concrete';
	}
}
