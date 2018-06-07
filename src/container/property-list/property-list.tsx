import * as Sender from '../../message/client';
import * as Component from '../../components';
import { ServerMessageType } from '../../message';
import * as MobxReact from 'mobx-react';
import { ElementProperty, PatternEnumProperty } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../model/types';
import * as uuid from 'uuid';

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyListContainer extends React.Component {
	public render(): React.ReactNode {
		const { store } = this.props as { store: ViewStore };
		const selectedElement = store.getSelectedElement();

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

interface StoreInjection {
	store: ViewStore;
}

@MobxReact.inject('store')
@MobxReact.observer
class PropertyViewContainer extends React.Component<PropertyViewContainerProps> {
	private handleCheckboxChange(e: React.ChangeEvent<HTMLElement>): void {
		const props = this.props as PropertyViewContainerProps & StoreInjection;
		const target = e.target as HTMLInputElement;
		props.property.setValue(target.checked);
		props.store.commit();
	}

	private handleEnumChange(e: React.ChangeEvent<HTMLSelectElement>): void {
		const props = this.props as PropertyViewContainerProps & StoreInjection;
		const patternProperty = props.property.getPatternProperty() as PatternEnumProperty;
		const selectedOption = patternProperty.getOptionById(e.target.value);
		const selectedValue = selectedOption ? selectedOption.getValue() : undefined;
		this.props.property.setValue(selectedValue);
		props.store.commit();
	}

	private handleInputBlur(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
		const props = this.props as PropertyViewContainerProps & StoreInjection;
		props.store.commit();
	}

	private handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
		this.props.property.setValue(e.target.value);
	}

	public render(): React.ReactNode {
		const props = this.props as PropertyViewContainerProps & StoreInjection;
		const { property } = props;

		const patternProperty = property.getPatternProperty();

		if (!patternProperty || patternProperty.getHidden()) {
			return null;
		}

		const description = patternProperty.getDescription();
		const id = property.getId();
		const label = patternProperty.getLabel();
		const type = patternProperty.getType();

		if (!label || !type) {
			return null;
		}

		const base = { key: id, description, label };
		const example = patternProperty.getExample();

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
						? Component.PropertyItemAssetInputType.File
						: Component.PropertyItemAssetInputType.Url;

				return (
					<Component.PropertyItemAsset
						{...base}
						imageSrc={imageSrc}
						inputType={inputType}
						inputValue={inputValue}
						onInputBlur={e => this.handleInputBlur(e)}
						onInputChange={e => this.handleInputChange(e)}
						onClearClick={() => {
							property.setValue('');
							props.store.commit();
						}}
						onChooseClick={() => {
							const transactionId = uuid.v4();

							Sender.receive(message => {
								if (
									message.type === ServerMessageType.AssetReadResponse &&
									message.id === transactionId
								) {
									property.setValue(message.payload);
									props.store.commit();
								}
							});

							Sender.send({
								id: transactionId,
								payload: undefined,
								type: ServerMessageType.AssetReadRequest
							});
						}}
						placeholder={'Or enter URL'}
					/>
				);
			}
			case Types.PatternPropertyType.Boolean: {
				const value = property.getValue() as boolean;
				return (
					<Component.PropertyItemBoolean
						{...base}
						checked={value}
						onChange={e => this.handleCheckboxChange(e)}
					/>
				);
			}
			case Types.PatternPropertyType.Enum: {
				const value = property.getValue() as string;
				const enumProp = patternProperty as PatternEnumProperty;
				const selectedOption = enumProp.getOptionByValue(value);
				const selectedValue = selectedOption ? selectedOption.getId() : undefined;

				return (
					<Component.PropertyItemEnum
						{...base}
						selectedValue={selectedValue}
						values={enumProp.getOptions().map(option => ({
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
					<Component.PropertyItemString
						{...base}
						value={value}
						onBlur={e => this.handleInputBlur(e)}
						onChange={e => this.handleInputChange(e)}
						placeholder={example ? `e.g.: ${example}` : ''}
					/>
				);
			}
			default: {
				return (
					<div key={id}>
						<Component.PropertyItemString
							{...base}
							value={property.getValue() as string}
							onBlur={e => this.handleInputBlur(e)}
							onChange={e => this.handleInputChange(e)}
							placeholder={example ? `e.g.: ${example}` : ''}
						/>
					</div>
				);
			}
		}
	}
}
