import * as Sender from '../../message/client';
import * as Component from '../../components';
import { EventHandlerPropertyView } from './event-handler-property-view';
import { ServerMessageType } from '../../message';
import * as MobxReact from 'mobx-react';
import { ElementProperty, PatternEnumProperty } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface PropertyListItemProps {
	property: ElementProperty;
}

export interface StoreInjection {
	store: ViewStore;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyListItem extends React.Component<PropertyListItemProps> {
	private handleCheckboxChange(e: React.ChangeEvent<HTMLElement>): void {
		const props = this.props as PropertyListItemProps & StoreInjection;
		const target = e.target as HTMLInputElement;
		props.property.setValue(target.checked);
		props.store.commit();
	}

	private handleEnumChange(e: React.ChangeEvent<HTMLElement>): void {
		const props = this.props as PropertyListItemProps & StoreInjection;
		const patternProperty = props.property.getPatternProperty() as PatternEnumProperty;
		const selectedOption = patternProperty.getOptionById((e.target as HTMLSelectElement).value);
		const selectedValue = selectedOption ? selectedOption.getValue() : undefined;
		this.props.property.setValue(selectedValue);
		props.store.commit();
	}

	private handleInputBlur(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
		const props = this.props as PropertyListItemProps & StoreInjection;
		props.store.commit();
	}

	private handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
		this.props.property.setValue(e.target.value);
	}

	// tslint:disable-next-line:cyclomatic-complexity
	public render(): React.ReactNode {
		const props = this.props as PropertyListItemProps & StoreInjection;
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
						placeholder="Or enter URL"
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
				const inputType = patternProperty.getInputType() as Types.PatternPropertyInputType;
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
						inputType={inputType}
						onChange={e => this.handleEnumChange(e)}
					/>
				);
			}
			case Types.PatternPropertyType.EventHandler: {
				return <EventHandlerPropertyView elementProperty={property} />;
			}
			case Types.PatternPropertyType.Number:
				return (
					<Component.PropertyItemNumber
						{...base}
						key={id}
						value={property.getValue() as string}
						onBlur={e => this.handleInputBlur(e)}
						onChange={e => this.handleInputChange(e)}
						placeholder={example ? `e.g.: ${example}` : ''}
					/>
				);
			case Types.PatternPropertyType.String:
			default: {
				return (
					<Component.PropertyItemString
						{...base}
						key={id}
						value={property.getValue() as string}
						onBlur={e => this.handleInputBlur(e)}
						onChange={e => this.handleInputChange(e)}
						placeholder={example ? `e.g.: ${example}` : ''}
					/>
				);
			}
		}
	}
}
