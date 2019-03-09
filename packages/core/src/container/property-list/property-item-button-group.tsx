import * as Components from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as Model from '@meetalva/model';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface PropertyItemButtonGroupProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemButtonGroup extends React.Component<PropertyItemButtonGroupProps> {
	private handleChange(e: React.ChangeEvent<HTMLElement>): void {
		const props = this.props as PropertyItemButtonGroupProps & { store: ViewStore };
		const patternProperty = props.property.getPatternProperty() as Model.PatternEnumProperty;
		const selectedOption = patternProperty.getOptionById((e.target as HTMLSelectElement).value);
		const selectedValue = selectedOption ? selectedOption.getValue() : undefined;
		this.props.property.setValue(selectedValue);
		props.store.commit();
	}

	public render(): JSX.Element | null {
		const props = this.props as PropertyItemButtonGroupProps & { store: ViewStore };
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
			<Components.PropertyItemButtonGroup
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
