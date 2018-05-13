import * as Mobx from 'mobx';
import { PatternProperty, PatternPropertyType } from '../../pattern-property';
import * as Types from '../../types';
import * as uuid from 'uuid';
import { ViewStore } from '../../view-store';

export interface ElementPropertyInit {
	id: string;
	patternPropertyId: string;
	setDefault: boolean;
	value: Types.ElementPropertyValue;
}

export class ElementProperty {
	private id: string;
	private patternPropertyId: string;
	private setDefault: boolean;
	@Mobx.observable private value: Types.ElementPropertyValue;

	public constructor(init: ElementPropertyInit) {
		this.id = init.id;
		this.patternPropertyId = init.patternPropertyId;
		this.setDefault = init.setDefault;
		this.value = init.value;

		const store = ViewStore.getInstance();
		const patternLibrary = store.getPatternLibrary();
		const patternProperty = patternLibrary
			? patternLibrary.getPatternPropertyById(this.patternPropertyId)
			: undefined;

		if (typeof this.value === 'undefined' && this.setDefault && patternProperty) {
			this.value = patternProperty.getDefaultValue();
		}
	}

	public static from(serialized: Types.SerializedElementProperty): ElementProperty {
		return new ElementProperty({
			id: serialized.id,
			patternPropertyId: serialized.patternPropertyId,
			setDefault: serialized.setDefault,
			value: serialized.value
		});
	}

	public clone(): ElementProperty {
		return new ElementProperty({
			id: uuid.v4(),
			patternPropertyId: this.patternPropertyId,
			setDefault: this.setDefault,
			value: this.value
		});
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

	public getPatternProperty(): PatternProperty | undefined {
		const store = ViewStore.getInstance();
		const patternLibrary = store.getPatternLibrary();

		if (!patternLibrary) {
			return undefined;
		}

		return patternLibrary.getPatternPropertyById(this.patternPropertyId);
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

	public hasPatternProperty(patternProperty: PatternProperty): boolean {
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
