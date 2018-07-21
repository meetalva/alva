import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';

import { PropertyItemAsset } from './property-item-asset';
import { PropertyItemBoolean } from './property-item-boolean';
import { PropertyItemEnum } from './property-item-enum';
import { PropertyItemEvent } from './property-item-event';
import { PropertyItemNumber } from './property-item-number';
import { PropertyItemString } from './property-item-string';
import { PropertyItemRadioGroup } from './property-item-radio-group';
import { ReferenceSelect } from './reference-select';

export interface PropertyListItemProps {
	property: Model.ElementProperty;
}

export interface StoreInjection {
	store: ViewStore;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyListItem extends React.Component<PropertyListItemProps> {
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
					<ReferenceSelect key={id} property={property}>
						<PropertyItemString property={property} />
					</ReferenceSelect>
				);
			}
		}
	}
}
