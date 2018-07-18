import * as _ from 'lodash';
import * as Mobx from 'mobx';
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
	value: Types.ElementPropertyValue;
}

export interface ElementPropertyContext {
	project: Project;
}

export class ElementProperty {
	@Mobx.observable private id: string;
	@Mobx.observable private patternPropertyId: string;
	private project: Project;
	@Mobx.observable private setDefault: boolean;
	@Mobx.observable private value: Types.ElementPropertyValue;

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
		this.id = init.id;
		this.patternPropertyId = init.patternPropertyId;
		this.setDefault = init.setDefault;
		this.value = init.value;
		this.project = context.project;

		const patternProperty = this.project.getPatternPropertyById(this.patternPropertyId);

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

	public static fromPatternProperty(
		patternProperty: AnyPatternProperty,
		context: ElementPropertyContext
	): ElementProperty {
		return new ElementProperty(
			{
				id: uuid.v4(),
				patternPropertyId: patternProperty.getId(),
				setDefault: patternProperty.getRequired(),
				value: patternProperty.getDefaultValue()
			},
			context
		);
	}

	public clone(): ElementProperty {
		const cloneElementAction = (): string | undefined => {
			const patternProperty = this.getPatternProperty();

			if (
				!patternProperty ||
				patternProperty.getType() !== Types.PatternPropertyType.EventHandler
			) {
				return;
			}

			const elementAction = this.project.getElementActionById(this.value as string);

			if (!elementAction) {
				return;
			}

			const clonedAction = elementAction.clone();
			this.project.addElementAction(clonedAction);
			return clonedAction.getId();
		};

		const clonedActionId = cloneElementAction();

		return new ElementProperty(
			{
				id: uuid.v4(),
				patternPropertyId: this.patternPropertyId,
				setDefault: this.setDefault,
				value: clonedActionId || this.value
			},
			{
				project: this.project
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

	public getId(): string {
		return this.id;
	}

	public getPatternProperty(): AnyPatternProperty | undefined {
		return this.project.getPatternPropertyById(this.patternPropertyId);
	}

	public getPatternPropertyId(): string {
		return this.patternPropertyId;
	}

	public getValue(): Types.ElementPropertyValue {
		return this.value;
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

	@Mobx.action
	public update(b: ElementProperty): void {
		this.id = b.id;
		this.patternPropertyId = b.patternPropertyId;
		this.setDefault = b.setDefault;
		this.value = b.value;
	}
}
