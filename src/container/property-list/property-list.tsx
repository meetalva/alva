import * as Sender from '../../message/client';
import * as Component from '../../components';
import { ServerMessageType } from '../../message';
import * as MobxReact from 'mobx-react';
import { ElementProperty, PatternEnumProperty } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../model/types';
import * as uuid from 'uuid';

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

	private handleEnumChange(e: React.ChangeEvent<HTMLSelectElement>): void {
		const patternProperty = this.props.property.getPatternProperty() as PatternEnumProperty;
		const selectedOption = patternProperty.getOptionById(e.target.value);
		const selectedValue = selectedOption ? selectedOption.getValue() : undefined;
		this.props.property.setValue(selectedValue);
	}

	private handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
		this.props.property.setValue(e.target.value);
	}

	public render(): React.ReactNode {
		const { props } = this;
		const { property } = props;

		if (property.getHidden()) {
			return null;
		}

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
			case Types.PatternPropertyType.Asset: {
				const imageSrc = (property.getValue() as string | undefined) || '';
				const inputValue = imageSrc && !imageSrc.startsWith('data:') ? imageSrc : '';
				const inputType =
					imageSrc && imageSrc.startsWith('data:')
						? Component.AssetPropertyInputType.File
						: Component.AssetPropertyInputType.Url;

				return (
					<Component.AssetItem
						{...base}
						imageSrc={imageSrc}
						inputType={inputType}
						inputValue={inputValue}
						onInputChange={e => this.handleInputChange(e)}
						onClearClick={() => property.setValue('')}
						onChooseClick={() => {
							const transactionId = uuid.v4();

							Sender.receive(message => {
								if (
									message.type === ServerMessageType.AssetReadResponse &&
									message.id === transactionId
								) {
									property.setValue(message.payload);
								}
							});

							Sender.send({
								id: transactionId,
								payload: undefined,
								type: ServerMessageType.AssetReadRequest
							});
						}}
					/>
				);
			}
			case Types.PatternPropertyType.Boolean: {
				const value = property.getValue() as boolean;
				return (
					<Component.BooleanItem
						{...base}
						checked={value}
						onChange={e => this.handleCheckboxChange(e)}
					/>
				);
			}
			case Types.PatternPropertyType.Enum: {
				const value = property.getValue() as string;
				const patternProperty = property.getPatternProperty() as PatternEnumProperty;
				const selectedOption = patternProperty.getOptionByValue(value);
				const selectedValue = selectedOption ? selectedOption.getId() : undefined;

				return (
					<Component.EnumItem
						{...base}
						selectedValue={selectedValue}
						values={patternProperty.getOptions().map(option => ({
							id: option.getId(),
							name: option.getName()
						}))}
						onChange={e => this.handleEnumChange(e)}
					/>
				);
			}
			case Types.PatternPropertyType.String: {
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
