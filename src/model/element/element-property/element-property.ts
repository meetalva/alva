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

		const patternProperty = this.project.getPatternPropertyById(this.patternPropertyId);

		if (typeof this.value === 'undefined' && patternProperty) {
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
				patternPropertyId: serialized.patternPropertyId
			},
			context
		);
	}

	public static fromPatternProperty(
		patternProperty: AnyPatternProperty,
		context: ElementPropertyContext & { LEGACY_ID?: string }
	): ElementProperty {
		return new ElementProperty(
			{
				id: context.LEGACY_ID
					? context.LEGACY_ID
					: [context.element.getId(), patternProperty.getId()].join('-'),
				patternPropertyId: patternProperty.getId()
			},
			context
		);
	}

	public clone(): ElementProperty {
		return new ElementProperty(
			{
				id: uuid.v4(),
				patternPropertyId: this.patternPropertyId
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

		const concreteValue = this.getConcreteValue();

		if (typeof concreteValue !== 'undefined' && this.patternProperty) {
			return this.patternProperty.coerceValue(concreteValue);
		}

		return this.getDefaultValue();
	}

	public getRawValue(): string {
		if (this.referencedUserStoreProperty && this.patternProperty) {
			return this.referencedUserStoreProperty.getValue();
		}

		const concreteValue = this.element.getPropertyValue(this.patternPropertyId) as string;

		if (typeof concreteValue !== 'undefined') {
			return concreteValue;
		}

		return this.getDefaultValue() as string;
	}

	public getConcreteValue(): Types.ElementPropertyValue {
		const concreteValue = this.element.getPropertyValue(this.patternPropertyId);

		if (typeof concreteValue !== 'undefined' && concreteValue !== null) {
			return concreteValue;
		}

		return;
	}

	public getDefaultValue(): Types.ElementPropertyValue {
		if (this.patternProperty) {
			return this.patternProperty.getDefaultValue();
		}

		return;
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
			value: this.value
		};
	}

	@Mobx.action
	public update(b: ElementProperty): void {
		this.id = b.id;
		this.patternPropertyId = b.patternPropertyId;
		this.value = b.value;
	}
}
