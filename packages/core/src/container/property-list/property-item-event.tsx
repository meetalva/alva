import { ActionPayloadInput } from './action-payload-input';
import { UserStorePropertySelect } from '../user-store-property-select';
import { ViewStore } from '../../store';
import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import * as Types from '../../types';
import * as uuid from 'uuid';
import * as Mobx from 'mobx';

export interface PropertyItemEventProps {
	property: Model.ElementProperty;
	onDidRender?(): void;
}

export interface StoreInjection {
	store: ViewStore;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemEvent extends React.Component<PropertyItemEventProps> {
	// tslint:disable-next-line:no-empty
	private dispose = () => {};

	public componentDidMount() {
		const props = this.props as PropertyItemEventProps & StoreInjection;
		const project = props.store.getProject();
		const elementAction = project.getElementActionById(String(props.property.getValue()));

		this.dispose = Mobx.reaction(
			() => elementAction,
			() => {
				return this.props.onDidRender && this.props.onDidRender();
			}
		);
	}

	public componentWillUnmount() {
		this.dispose();
	}

	private handleActionChange(
		item: Components.SimpleSelectOption | Components.SimpleSelectOption[]
	): void {
		const selected = Array.isArray(item) ? item[0] : item;
		const props = this.props as PropertyItemEventProps & StoreInjection;
		const project = props.store.getProject();
		const userStore = project.getUserStore();
		const selectedAction = userStore.getActionById(selected.value);

		if (!selectedAction || selectedAction.getType() === Types.UserStoreActionType.Noop) {
			props.property.setValue('');
			props.store.commit();
			return;
		}

		const existingElementAction = project
			.getElementActions()
			.find(
				action =>
					action.getElementPropertyId() === props.property.getId() &&
					selectedAction.getId() === action.getStoreActionId()
			);

		const elementAction =
			existingElementAction ||
			new Model.ElementAction(
				{
					elementPropertyId: props.property.getId(),
					id: uuid.v4(),
					open: false,
					payload: '',
					payloadType: Types.ElementActionPayloadType.String,
					storeActionId: selectedAction.getId(),
					storePropertyId: selectedAction.getUserStorePropertyId() || ''
				},
				{
					userStore: project.getUserStore()
				}
			);

		project.addElementAction(elementAction);
		props.property.setValue(elementAction.getId());

		const storePropertyId = elementAction.getStorePropertyId();
		const storeProperty = storePropertyId
			? userStore.getPropertyById(storePropertyId)
			: undefined;

		if (storeProperty && storeProperty.getValueType() === Types.UserStorePropertyValueType.Page) {
			const page = props.store.getPages()[0];
			elementAction.setPayload(page ? page.getId() : '');
		}

		props.store.commit();
	}

	private handlePropertyNameChange(
		item: Components.CreateSelectOption,
		action: Components.CreateSelectAction
	): void {
		const props = this.props as PropertyItemEventProps & StoreInjection;
		const project = props.store.getProject();
		const userStore = project.getUserStore();
		const elementAction = project.getElementActionById(String(props.property.getValue()));

		if (!elementAction) {
			return;
		}

		switch (action.action) {
			case 'select-option': {
				const storeProperty = userStore.getPropertyById(item.value);

				if (storeProperty) {
					elementAction.setStorePropertyId(storeProperty.getId());
					props.store.commit();
				}

				elementAction.setPayload('');
				elementAction.setPayloadType(Types.ElementActionPayloadType.String);
				break;
			}
			case 'create-option': {
				const newProperty = new Model.UserStoreProperty({
					id: uuid.v4(),
					name: item.value,
					valueType: Types.UserStorePropertyValueType.String,
					type: Types.UserStorePropertyType.Concrete,
					initialValue: ''
				});

				userStore.addProperty(newProperty);
				elementAction.setStorePropertyId(newProperty.getId());
				elementAction.setPayload('');
				elementAction.setPayloadType(Types.ElementActionPayloadType.String);
				props.store.commit();
			}
		}
	}

	public render(): JSX.Element | null {
		const props = this.props as PropertyItemEventProps & StoreInjection;
		const project = props.store.getProject();
		const patternProperty = props.property.getPatternProperty() as Model.PatternEventHandlerProperty;

		const userStore = project.getUserStore();
		const elementAction = project.getElementActionById(String(props.property.getValue()));
		const element = props.property.getElement();

		if (!element) {
			return null;
		}

		const userAction =
			(elementAction && userStore.getActionById(elementAction.getStoreActionId())) ||
			userStore.getNoopAction();

		const userProperty = elementAction
			? userStore.getPropertyById(elementAction.getStorePropertyId() || '')
			: undefined;

		return (
			<div
				key={props.property.getId()}
				style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
			>
				<Components.PropertyBox
					headline={patternProperty.getLabel()}
					copy={[patternProperty.getEvent().getType(), patternProperty.getDescription()]
						.filter(Boolean)
						.join(' - ')}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							flexWrap: 'nowrap',
							marginTop: '12px'
						}}
					>
						<Components.PropertyLabel label="Perform" />
						<Components.Select
							onChange={e => this.handleActionChange(e)}
							onMenuOpen={() => {
								return this.props.onDidRender && this.props.onDidRender();
							}}
							options={userStore
								.getActions()
								.map(a => ({ label: a.getName(), value: a.getId() }))}
							value={{ label: userAction.getName(), value: userAction.getId() }}
						/>
					</div>
					{elementAction &&
						userAction &&
						userAction.getType() === Types.UserStoreActionType.OpenExternal && (
							<div
								style={{
									display: 'flex',
									width: '100%',
									marginTop: '6px',
									alignItems: 'center'
								}}
							>
								<Components.PropertyLabel label="to" />
								<Components.PropertyInput
									type={Components.PropertyInputType.Text}
									value={elementAction.getPayload()}
									placeholder="https://meetalva.io"
									onBlur={() => window.requestIdleCallback(() => props.store.commit())}
									onChange={e => elementAction.setPayload(e.target.value)}
								/>
							</div>
						)}
					{elementAction &&
						userAction &&
						userAction.getAcceptsProperty() && (
							<div
								style={{
									display: 'flex',
									width: '100%',
									marginTop: '6px',
									alignItems: 'center'
								}}
							>
								<Components.PropertyLabel label="named" />
								<UserStorePropertySelect
									placeholder="Select Variable"
									onChange={(e, meta) => this.handlePropertyNameChange(e, meta)}
									property={userProperty}
									type={Types.UserStorePropertyType.Concrete}
								/>
							</div>
						)}
					{elementAction && (
						<ActionPayloadInput elementAction={elementAction} element={element} />
					)}
				</Components.PropertyBox>
			</div>
		);
	}
}
