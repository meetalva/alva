import * as _ from 'lodash';
import * as Mobx from 'mobx';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface PatternPropertyInit<T> {
	contextId: string;
	defaultValue?: T;
	description?: string;
	example?: string;
	group?: string;
	hidden?: boolean;
	id?: string;
	inputType: Types.PatternPropertyInputType;
	label: string;
	propertyName: string;
	required?: boolean;
}

export abstract class PatternPropertyBase<T> {
	public readonly model = Types.ModelName.PatternProperty;

	@Mobx.observable protected contextId: string;
	@Mobx.observable protected defaultValue: T;
	@Mobx.observable protected description?: string;
	@Mobx.observable protected example: string;
	@Mobx.observable protected group: string;
	@Mobx.observable protected hidden: boolean = false;
	@Mobx.observable protected id: string;
	@Mobx.observable protected inputType: Types.PatternPropertyInputType;
	@Mobx.observable protected label: string;
	@Mobx.observable protected propertyName: string;
	@Mobx.observable protected required: boolean = false;
	@Mobx.observable public type: Types.PatternPropertyType = Types.PatternPropertyType.Unknown;

	public constructor(init: PatternPropertyInit<T>) {
		this.contextId = init.contextId;
		this.id = init.id || uuid.v4();
		this.inputType = init.inputType;
		this.label = init.label;
		this.propertyName = init.propertyName;

		if (typeof init.description !== 'undefined') {
			this.description = init.description;
		}

		if (typeof init.hidden !== 'undefined') {
			this.hidden = init.hidden;
		}

		if (typeof init.required !== 'undefined') {
			this.required = init.required;
		}

		this.example = init.example || '';
		this.group = init.group || '';
		this.defaultValue = this.coerceValue(init.defaultValue);
	}

	// tslint:disable-next-line:no-any
	public abstract coerceValue(value: any): T;

	public equals(b: this): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
	}

	public hasDefault(): boolean {
		return typeof this.defaultValue !== 'undefined';
	}

	public getContextId(): string {
		return this.contextId;
	}

	public getDefaultValue(): T | undefined {
		return this.defaultValue;
	}

	public getDescription(): string | undefined {
		return this.description;
	}

	public getExample(): string {
		return this.example;
	}

	public getGroup(): string {
		return this.group;
	}

	public getHidden(): boolean {
		return this.hidden;
	}

	public getId(): string {
		return this.id;
	}

	public getInputType(): Types.PatternPropertyInputType {
		return this.inputType;
	}

	public getLabel(): string {
		return this.label;
	}

	public getPropertyName(): string {
		return this.propertyName;
	}

	public getRequired(): boolean {
		return this.required;
	}

	public getType(): Types.PatternPropertyType {
		return this.type;
	}

	public abstract toJSON(): Types.SerializedPatternProperty;
	public abstract update(
		patternProperty: PatternPropertyBase<T> | Types.SerializedPatternProperty
	): void;
}
