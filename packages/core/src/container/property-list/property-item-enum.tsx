import * as Components from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface PropertyItemEnumProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemEnum extends React.Component<PropertyItemEnumProps> {
	private handleChange(item: Components.SimpleSelectOption): void {
		const props = this.props as PropertyItemEnumProps & { store: ViewStore };
		const patternProperty = props.property.getPatternProperty() as Model.PatternEnumProperty;
		const selectedOption = patternProperty.getOptionById(item.value);
		const selectedValue = selectedOption ? selectedOption.getValue() : undefined;
		this.props.property.setValue(selectedValue);
		props.store.getApp().setHasFocusedInput(false);
		props.store.commit();
	}

	public render(): JSX.Element | null {
		const props = this.props as PropertyItemEnumProps & { store: ViewStore };
		const { property } = props;

		const patternProperty = property.getPatternProperty();

		if (!patternProperty) {
			return null;
		}

		const value = property.getValue() as string;
		const enumProp = patternProperty as Model.PatternEnumProperty;
		const selectedOption = enumProp.getOptionByValue(value);
		const selectedValue = selectedOption ? selectedOption.getId() : undefined;

		return (
			<Components.PropertyItemSelect
				description={patternProperty.getDescription()}
				label={patternProperty.getLabel()}
				selectedValue={selectedValue}
				values={enumProp.getOptions().map(option => ({
					id: option.getId(),
					name: option.getName()
				}))}
				onChange={e => this.handleChange(e as Components.SimpleSelectOption)}
			/>
		);
	}
}
