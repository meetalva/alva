import * as _ from 'lodash';
import * as Mobx from 'mobx';
import { Element } from '../../element';
import { AnyPatternProperty } from '../../pattern-property';
import { UserStoreProperty } from '../../user-store-property';
import { UserStoreReference } from '../../user-store-reference';
import { Project } from '../../project';
import * as Types from '../../../types';
import * as uuid from 'uuid';

export interface ElementPropertyInit {
	id: string;
	patternPropertyId: string;
	setDefault: boolean;
}

export interface ElementPropertyContext {
	element: Element;
	project: Project;
}

export class ElementProperty {
	public readonly model = Types.ModelName.ElementProperty;
	private project: Project;
	private element: Element;

	@Mobx.observable private id: string;
	@Mobx.observable private patternPropertyId: string;
	@Mobx.observable private setDefault: boolean;
	@Mobx.observable private value: Types.ElementPropertyValue;

	@Mobx.computed
	private get patternProperty(): AnyPatternProperty | undefined {
		return this.project.getPatternPropertyById(this.patternPropertyId);
	}

	@Mobx.computed
	private get userStoreReference(): UserStoreReference | undefined {
		return this.project.getUserStore().getReferenceByElementProperty(this);
	}

	@Mobx.computed
	private get referencedUserStoreProperty(): UserStoreProperty | undefined {
		if (!this.userStoreReference) {
			return;
		}

		const userStorePropertyId = this.userStoreReference.getUserStorePropertyId();

		if (!userStorePropertyId) {
			return;
		}

		return this.project.getUserStore().getPropertyById(userStorePropertyId);
	}

	public constructor(init: ElementPropertyInit, context: ElementPropertyContext) {
		this.project = context.project;
		this.element = context.element;

		this.id = init.id;
		this.patternPropertyId = init.patternPropertyId;
		this.setDefault = init.setDefault;

		const patternProperty = this.project.getPatternPropertyById(this.patternPropertyId);

		if (typeof this.value === 'undefined' && this.setDefault && patternProperty) {
			this.value = patternProperty.getDefaultValue();
		}
	}

	public static from(
		serialized: Types.LegacySerializedElementProperty,
		context: ElementPropertyContext
	): ElementProperty {
		return new ElementProperty(
			{
				id: serialized.id,
				patternPropertyId: serialized.patternPropertyId,
				setDefault: serialized.setDefault
			},
			context
		);
	}

	public static fromPatternProperty(
		patternProperty: AnyPatternProperty,
		context: ElementPropertyContext
	): ElementProperty {
		return new ElementProperty(
			{
				id: uuid.v4(),
				patternPropertyId: patternProperty.getId(),
				setDefault: patternProperty.getRequired()
			},
			context
		);
	}

	public clone(): ElementProperty {
		return new ElementProperty(
			{
				id: uuid.v4(),
				patternPropertyId: this.patternPropertyId,
				setDefault: this.setDefault
			},
			{
				project: this.project,
				element: this.element
			}
		);
	}

	public equals(b: this): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
	}

	public getHidden(): boolean | undefined {
		const patternProperty = this.getPatternProperty();

		if (!patternProperty) {
			return;
		}

		return patternProperty.getHidden();
	}

	public getElement(): Element | undefined {
		return this.element;
	}

	public getId(): string {
		return this.id;
	}

	public getPatternProperty(): AnyPatternProperty | undefined {
		return this.patternProperty;
	}

	public getPatternPropertyId(): string {
		return this.patternPropertyId;
	}

	public getValue(): Types.ElementPropertyValue {
		if (this.referencedUserStoreProperty && this.patternProperty) {
			const referencedValue = this.referencedUserStoreProperty.getValue();
			return this.patternProperty.coerceValue(referencedValue);
		}

		return this.element.getPropertyValue(this.patternPropertyId);
	}

	public getUserStoreReference(): UserStoreReference | undefined {
		return this.userStoreReference;
	}

	public getReferencedUserStoreProperty(): UserStoreProperty | undefined {
		return this.referencedUserStoreProperty;
	}

	public hasPatternProperty(patternProperty: AnyPatternProperty): boolean {
		return this.patternPropertyId === patternProperty.getId();
	}

	@Mobx.action
	public setValue(value: Types.ElementPropertyValue): void {
		if (this.referencedUserStoreProperty && this.patternProperty) {
			this.referencedUserStoreProperty.setValue(value as string);
		}

		return this.element.setPropertyValue(this.patternPropertyId, value);
	}

	public toJSON(): Types.LegacySerializedElementProperty {
		return {
			model: this.model,
			id: this.id,
			patternPropertyId: this.patternPropertyId,
			setDefault: this.setDefault,
			value: this.value
		};
	}

	@Mobx.action
	public update(b: ElementProperty): void {
		this.id = b.id;
		this.patternPropertyId = b.patternPropertyId;
		this.setDefault = b.setDefault;
		this.value = b.value;
	}
}
