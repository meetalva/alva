import * as Mobx from 'mobx';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface PatternPropertyInit<T> {
	contextId: string;
	defaultValue?: T;
	description?: string;
	example?: string;
	hidden?: boolean;
	id?: string;
	label: string;
	origin: Types.PatternPropertyOrigin;
	propertyName: string;
	required?: boolean;
}

export abstract class PatternPropertyBase<T> {
	@Mobx.observable protected contextId: string;
	@Mobx.observable protected defaultValue: T;
	@Mobx.observable protected description: string;
	@Mobx.observable protected example: string;
	@Mobx.observable protected hidden: boolean = false;
	@Mobx.observable protected id: string;
	@Mobx.observable protected label: string;
	@Mobx.observable protected origin: Types.PatternPropertyOrigin;
	@Mobx.observable protected propertyName: string;
	@Mobx.observable protected required: boolean = false;
	@Mobx.observable public type: Types.PatternPropertyType;

	public constructor(init: PatternPropertyInit<T>) {
		this.contextId = init.contextId;
		this.id = init.id || uuid.v4();
		this.label = init.label;
		this.origin = init.origin;
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
		this.defaultValue = this.coerceValue(init.defaultValue);
	}

	// tslint:disable-next-line:no-any
	public abstract coerceValue(value: any): T;

	public getContextId(): string {
		return this.contextId;
	}

	public getDefaultValue(): T | undefined {
		return this.defaultValue;
	}

	public getDescription(): string {
		return this.description;
	}

	public getExample(): string {
		return this.example;
	}

	public getHidden(): boolean {
		return this.hidden;
	}

	public getId(): string {
		return this.id;
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
	public abstract update(patternProperty: PatternPropertyBase<T>): void;
}

export function deserializeOrigin(
	input: Types.SerializedPatternOrigin
): Types.PatternPropertyOrigin {
	switch (input) {
		case 'built-in':
			return Types.PatternPropertyOrigin.BuiltIn;
		case 'user-provided':
			return Types.PatternPropertyOrigin.UserProvided;
	}
	throw new Error(`Unknown pattern property origin: ${input}`);
}

export function serializeOrigin(
	input: Types.PatternPropertyOrigin
): Types.SerializedPatternPropertyOrigin {
	switch (input) {
		case Types.PatternPropertyOrigin.BuiltIn:
			return 'built-in';
		case Types.PatternPropertyOrigin.UserProvided:
			return 'user-provided';
	}
	throw new Error(`Unknown pattern property origin: ${input}`);
}
