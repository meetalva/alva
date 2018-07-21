import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import * as uuid from 'uuid';

import { PropertyItemAsset } from './property-item-asset';
import { PropertyItemBoolean } from './property-item-boolean';
import { PropertyItemEnum } from './property-item-enum';
import { PropertyItemEvent } from './property-item-event';
import { PropertyItemNumber } from './property-item-number';
import { PropertyItemString } from './property-item-string';
import { PropertyItemRadioGroup } from './property-item-radio-group';

export interface PropertyListItemProps {
	property: Model.ElementProperty;
}

export interface StoreInjection {
	store: ViewStore;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyListItem extends React.Component<PropertyListItemProps> {
	private handleConnectClick(e: React.MouseEvent<HTMLElement>): void {
		const props = this.props as PropertyListItemProps & StoreInjection;
		const store = props.store.getProject().getUserStore();

		e.stopPropagation();
		e.preventDefault();

		const previous = store.getReferenceByElementProperty(props.property);

		if (previous) {
			previous.setOpen(true);
			return;
		}

		store.addReference(
			new Model.UserStoreReference({
				id: uuid.v4(),
				elementPropertyId: props.property.getId(),
				open: true,
				userStorePropertyId: undefined
			})
		);
	}

	private handleUserStorePropertyChange(
		item: Components.CreateSelectOption,
		action: Components.CreateSelectAction
	): void {
		const props = this.props as PropertyListItemProps & StoreInjection;
		const project = props.store.getProject();
		const userStore = project.getUserStore();
		const userStoreReference = props.property.getUserStoreReference();

		if (!userStoreReference) {
			return;
		}

		// const props = this.props as PropertyListItemProps & StoreInjection;
		switch (action.action) {
			case 'select-option':
				const storeProperty = userStore.getPropertyById(item.value);

				if (storeProperty && userStoreReference) {
					userStoreReference.setUserStoreProperty(storeProperty);
					userStoreReference.setOpen(false);
					props.store.commit();
				}

				break;
			case 'create-option':
				const newProperty = new Model.UserStoreProperty({
					id: uuid.v4(),
					name: item.value,
					type: Types.UserStorePropertyType.String,
					payload: ''
				});

				userStore.addProperty(newProperty);
				userStoreReference.setUserStoreProperty(newProperty);
				userStoreReference.setOpen(false);
				props.store.commit();
		}
	}

	public render(): React.ReactNode {
		const props = this.props as PropertyListItemProps & StoreInjection;
		const { property } = props;

		const patternProperty = property.getPatternProperty();

		if (!patternProperty || patternProperty.getHidden()) {
			return null;
		}

		const id = property.getId();

		switch (patternProperty.getType()) {
			case Types.PatternPropertyType.Asset: {
				return <PropertyItemAsset key={id} property={property} />;
			}
			case Types.PatternPropertyType.Boolean: {
				return <PropertyItemBoolean key={id} property={property} />;
			}
			case Types.PatternPropertyType.Enum: {
				const inputType = patternProperty.getInputType();
				return inputType === Types.PatternPropertyInputType.RadioGroup
					? <PropertyItemRadioGroup key={id} property={property}/>
					: <PropertyItemEnum key={id} property={property} />;
			}
			case Types.PatternPropertyType.EventHandler: {
				return <PropertyItemEvent key={id} property={property} />;
			}
			case Types.PatternPropertyType.Number:
				return <PropertyItemNumber key={id} property={property} />;
			case Types.PatternPropertyType.String:
			default: {
				return (
					<PropertyItemString
						key={id}
						property={property}
						onReferenceConnect={e => this.handleConnectClick(e)}
						onReferenceChange={(item, action) =>
							this.handleUserStorePropertyChange(item, action)
						}
					/>
				);
			}
		}
	}
}
