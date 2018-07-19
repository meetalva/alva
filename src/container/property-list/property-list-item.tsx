import * as Sender from '../../sender/client';
import * as Components from '../../components';
import { EventHandlerPropertyView } from './event-handler-property-view';
import { MessageType } from '../../message';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import { UserStorePropertySelect } from '../user-store-property-select';
import * as uuid from 'uuid';

const OutsideClickHandler = require('react-outside-click-handler').default;

export interface PropertyListItemProps {
	property: Model.ElementProperty;
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

	private handleEnumChange(raw: Components.SimpleSelectOption | React.ChangeEvent<HTMLElement>): void {
		if (raw.hasOwnProperty('target')) {
			const e = raw as React.ChangeEvent<HTMLElement>;
			console.log(e);
			return;
		}

		const item = raw as Components.SimpleSelectOption;
		const props = this.props as PropertyListItemProps & StoreInjection;
		const patternProperty = props.property.getPatternProperty() as Model.PatternEnumProperty;
		const selectedOption = patternProperty.getOptionById(item.value);
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
		// - NumberArray
		// - Object
		// - StringArray
		switch (type) {
			case Types.PatternPropertyType.Asset: {
				const imageSrc = (property.getValue() as string | undefined) || '';
				const inputValue = imageSrc && !imageSrc.startsWith('data:') ? imageSrc : '';
				const inputType =
					imageSrc && imageSrc.startsWith('data:')
						? Components.PropertyItemAssetInputType.File
						: Components.PropertyItemAssetInputType.Url;

				return (
					<Components.PropertyItemAsset
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
									message.type === MessageType.AssetReadResponse &&
									message.id === transactionId
								) {
									property.setValue(message.payload);
									props.store.commit();
								}
							});

							Sender.send({
								id: transactionId,
								payload: undefined,
								type: MessageType.AssetReadRequest
							});
						}}
						placeholder="Or enter URL"
					/>
				);
			}
			case Types.PatternPropertyType.Boolean: {
				const value = property.getValue() as boolean;
				return (
					<Components.PropertyItemBoolean
						{...base}
						checked={value}
						onChange={e => this.handleCheckboxChange(e)}
					/>
				);
			}
			case Types.PatternPropertyType.Enum: {
				const inputType = patternProperty.getInputType() as Types.PatternPropertyInputType;
				const value = property.getValue() as string;
				const enumProp = patternProperty as Model.PatternEnumProperty;
				const selectedOption = enumProp.getOptionByValue(value);
				const selectedValue = selectedOption ? selectedOption.getId() : undefined;

				if (inputType === Types.PatternPropertyInputType.RadioGroup) {
					return (
						<Components.PropertyItemRadiogroup
							{...base}
							selectedValue={selectedValue}
							values={enumProp.getOptions().map(option => ({
								id: option.getId(),
								name: option.getName(),
								icon: option.getIcon()
							}))}
							onChange={e => this.handleEnumChange(e)}
						/>
					);
				} else {
					return (
						<Components.PropertyItemSelect
							{...base}
							selectedValue={selectedValue}
							values={enumProp.getOptions().map(option => ({
								id: option.getId(),
								name: option.getName()
							}))}
							onChange={e => this.handleEnumChange(e as Components.SimpleSelectOption)}
						/>
					);
				}
			}
			case Types.PatternPropertyType.EventHandler: {
				return <EventHandlerPropertyView elementProperty={property} />;
			}
			case Types.PatternPropertyType.Number:
				return (
					<Components.PropertyItemNumber
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
				const userStoreReference = property.getUserStoreReference();
				const referencedUserStoreProperty = property.getReferencedUserStoreProperty();

				if (userStoreReference) {
					userStoreReference.getOpen();
				}

				return (
					<Components.PropertyItemString
						{...base}
						key={id}
						value={property.getValue() as string}
						onBlur={e => this.handleInputBlur(e)}
						onChange={e => this.handleInputChange(e)}
						placeholder={example ? `e.g.: ${example}` : ''}
					>
						{renderProps => {
							if (
								!userStoreReference ||
								(!userStoreReference.getOpen() && !referencedUserStoreProperty)
							) {
								return (
									<div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
										<Components.PropertyInput
											onChange={renderProps.onChange}
											onBlur={renderProps.onBlur}
											type={Components.PropertyInputType.Text}
											value={renderProps.value || ''}
											placeholder={renderProps.placeholder}
										/>
										<Components.LinkIcon onClick={e => this.handleConnectClick(e)} />
									</div>
								);
							}
							if (userStoreReference && userStoreReference.getOpen()) {
								return (
									<div style={{ width: '100%' }}>
										<OutsideClickHandler
											onOutsideClick={() => userStoreReference.setOpen(false)}
										>
											<UserStorePropertySelect
												menuIsOpen={userStoreReference.getOpen()}
												property={referencedUserStoreProperty}
												onChange={(e, meta) =>
													this.handleUserStorePropertyChange(e, meta)
												}
												placeholder="Connect Variable"
											/>
										</OutsideClickHandler>
									</div>
								);
							}
							if (userStoreReference && !userStoreReference.getOpen()) {
								return <UserStoreReferenceContainer reference={userStoreReference} />;
							}
							return null;
						}}
					</Components.PropertyItemString>
				);
			}
		}
	}
}

interface UserStoreReferenceContainerProps {
	reference: Model.UserStoreReference;
}

@MobxReact.inject('store')
@MobxReact.observer
class UserStoreReferenceContainer extends React.Component<UserStoreReferenceContainerProps> {
	public render(): JSX.Element | null {
		const props = this.props as UserStoreReferenceContainerProps & StoreInjection;
		const store = props.store.getProject().getUserStore();
		const storeProperty = store.getPropertyByReference(props.reference);

		if (!storeProperty) {
			return null;
		}

		return (
			<Components.PropertyReference
				name={storeProperty.getName()}
				value={storeProperty.getPayload()}
				onClick={() => props.reference.setOpen(true)}
				onLinkClick={() => store.removeReference(props.reference)}
			/>
		);
	}
}
