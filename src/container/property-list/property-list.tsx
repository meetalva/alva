import * as Component from '../../components';
import * as MobxReact from 'mobx-react';
import { ElementProperty, PatternEnumProperty } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import { PatternPropertyType as P } from '../../model/types';

@MobxReact.observer
export class PropertyListContainer extends React.Component {
	public render(): React.ReactNode {
		const selectedElement = ViewStore.getInstance().getSelectedElement();

		if (!selectedElement) {
			return null;
		}

		return (
			<>
				{selectedElement
					.getProperties()
					.map(elementProperty => (
						<PropertyViewContainer key={elementProperty.getId()} property={elementProperty} />
					))}
			</>
		);
	}
}

interface PropertyViewContainerProps {
	property: ElementProperty;
}

@MobxReact.observer
class PropertyViewContainer extends React.Component<PropertyViewContainerProps> {
	private handleCheckboxChange(e: React.ChangeEvent<HTMLElement>): void {
		const target = e.target as HTMLInputElement;
		this.props.property.setValue(target.checked);
	}

	private handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
		this.props.property.setValue(e.target.value);
	}

	public render(): React.ReactNode {
		const { props } = this;
		const { property } = props;

		const id = property.getId();
		const label = property.getLabel();
		const type = property.getType();

		if (!label || !type) {
			return null;
		}

		const base = { key: id, label };

		// TODO: Split ElementProperty into type-specific classes for better type safety
		// TODO: Implement inputs for
		// - Number
		// - NumberArray
		// - Object
		// - StringArray
		switch (type) {
			case P.Asset: {
				const value = property.getValue() as string | undefined;
				const inputValue = value && !value.startsWith('data:') ? value : '';
				return (
					<Component.AssetItem
						{...base}
						imageSrc={''}
						inputValue={inputValue}
						onInputChange={e => this.handleInputChange(e)}
					/>
				);
			}
			case P.Boolean: {
				const value = property.getValue() as boolean;
				return (
					<Component.BooleanItem
						{...base}
						checked={value}
						onChange={e => this.handleCheckboxChange(e)}
					/>
				);
			}
			case P.Enum: {
				const value = property.getValue() as string;
				const patternProperty = property.getPatternProperty() as PatternEnumProperty;
				const selectedOption = patternProperty.getOptionById(value);
				const selectedValue = selectedOption ? selectedOption.getId() : undefined;

				return (
					<Component.EnumItem
						{...base}
						selectedValue={selectedValue}
						values={patternProperty.getOptions().map(option => ({
							id: option.getId(),
							name: option.getName()
						}))}
						onChange={e => this.handleInputChange(e)}
					/>
				);
			}
			case P.String: {
				const value = property.getValue() as string | undefined;
				return (
					<Component.StringItem
						{...base}
						value={value}
						onChange={e => this.handleInputChange(e)}
					/>
				);
			}
			default: {
				return (
					<div key={id}>
						<Component.StringItem
							{...base}
							value={property.getValue() as string}
							onChange={e => this.handleInputChange(e)}
						/>
					</div>
				);
			}
		}
	}
}
