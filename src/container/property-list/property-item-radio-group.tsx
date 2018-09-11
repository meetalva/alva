import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface PropertyItemRadioGroupProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemRadioGroup extends React.Component<PropertyItemRadioGroupProps> {
	private handleChange(e: React.ChangeEvent<HTMLElement>): void {
		const props = this.props as PropertyItemRadioGroupProps & { store: ViewStore };
		const patternProperty = props.property.getPatternProperty() as Model.PatternEnumProperty;
		const selectedOption = patternProperty.getOptionById((e.target as HTMLSelectElement).value);
		const selectedValue = selectedOption ? selectedOption.getValue() : undefined;
		this.props.property.setValue(selectedValue);
		props.store.commit();
	}

	public render(): JSX.Element | null {
		const props = this.props as PropertyItemRadioGroupProps & { store: ViewStore };
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
			<Components.PropertyItemRadiogroup
				description={patternProperty.getDescription()}
				label={patternProperty.getLabel()}
				selectedValue={selectedValue}
				values={enumProp.getOptions().map(option => ({
					id: option.getId(),
					name: option.getName(),
					icon: option.getIcon()
				}))}
				onChange={e => this.handleChange(e)}
			/>
		);
	}
}
