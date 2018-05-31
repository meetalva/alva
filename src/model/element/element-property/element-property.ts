import * as Mobx from 'mobx';
import { PatternLibrary } from '../../pattern-library';
import { AnyPatternProperty } from '../../pattern-property';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface ElementPropertyInit {
	id: string;
	patternPropertyId: string;
	setDefault: boolean;
	value: Types.ElementPropertyValue;
}

export interface ElementPropertyContext {
	patternLibrary: PatternLibrary;
}

export class ElementProperty {
	@Mobx.observable private id: string;
	@Mobx.observable private patternLibrary: PatternLibrary;
	@Mobx.observable private patternPropertyId: string;
	@Mobx.observable private setDefault: boolean;
	@Mobx.observable private value: Types.ElementPropertyValue;

	public constructor(init: ElementPropertyInit, context: ElementPropertyContext) {
		this.id = init.id;
		this.patternPropertyId = init.patternPropertyId;
		this.setDefault = init.setDefault;
		this.value = init.value;
		this.patternLibrary = context.patternLibrary;

		const patternProperty = this.patternLibrary.getPatternPropertyById(this.patternPropertyId);

		if (typeof this.value === 'undefined' && this.setDefault && patternProperty) {
			this.value = patternProperty.getDefaultValue();
		}
	}

	public static from(
		serialized: Types.SerializedElementProperty,
		context: ElementPropertyContext
	): ElementProperty {
		return new ElementProperty(
			{
				id: serialized.id,
				patternPropertyId: serialized.patternPropertyId,
				setDefault: serialized.setDefault,
				value: serialized.value
			},
			context
		);
	}

	public clone(): ElementProperty {
		return new ElementProperty(
			{
				id: uuid.v4(),
				patternPropertyId: this.patternPropertyId,
				setDefault: this.setDefault,
				value: this.value
			},
			{
				patternLibrary: this.patternLibrary
			}
		);
	}

	public getHidden(): boolean | undefined {
		const patternProperty = this.getPatternProperty();

		if (!patternProperty) {
			return;
		}

		return patternProperty.getHidden();
	}

	public getId(): string {
		return this.id;
	}

	public getPatternProperty(): AnyPatternProperty | undefined {
		return this.patternLibrary.getPatternPropertyById(this.patternPropertyId);
	}

	public getPatternPropertyId(): string {
		return this.patternPropertyId;
	}

	public getValue(): Types.ElementPropertyValue {
		return this.value;
	}

	public hasPatternProperty(patternProperty: AnyPatternProperty): boolean {
		return this.patternPropertyId === patternProperty.getId();
	}

	@Mobx.action
	public setPatternLibrary(patternLibrary: PatternLibrary): void {
		this.patternLibrary = patternLibrary;
	}

	@Mobx.action
	public setValue(value: Types.ElementPropertyValue): void {
		this.value = value;
	}

	public toJSON(): Types.SerializedElementProperty {
		return {
			id: this.id,
			patternPropertyId: this.patternPropertyId,
			setDefault: this.setDefault,
			value: this.value
		};
	}
}
