import * as Mobx from 'mobx';
import { PatternLibrary } from '../../pattern-library';
import { AnyPatternProperty, PatternPropertyType } from '../../pattern-property';
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
	private id: string;
	private patternLibrary: PatternLibrary;
	private patternPropertyId: string;
	private setDefault: boolean;

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

	public getId(): string {
		return this.id;
	}

	public getLabel(): string | undefined {
		const patternProperty = this.getPatternProperty();

		if (!patternProperty) {
			return;
		}

		return patternProperty.getLabel();
	}

	public getPatternProperty(): AnyPatternProperty | undefined {
		return this.patternLibrary.getPatternPropertyById(this.patternPropertyId);
	}

	public getType(): PatternPropertyType | undefined {
		const patternProperty = this.getPatternProperty();

		if (!patternProperty) {
			return;
		}

		return patternProperty.getType();
	}

	public getValue(): Types.ElementPropertyValue {
		return this.value;
	}

	public hasPatternProperty(patternProperty: AnyPatternProperty): boolean {
		return this.patternPropertyId === patternProperty.getId();
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
