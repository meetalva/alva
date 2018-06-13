import * as Component from '../../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface EventHandlerPropertyViewProps {
	elementProperty: Model.ElementProperty;
}

export interface StoreInjection {
	store: ViewStore;
}

@MobxReact.inject('store')
@MobxReact.observer
export class EventHandlerPropertyView extends React.Component<EventHandlerPropertyViewProps> {
	private handleActionChange(e: React.ChangeEvent<HTMLSelectElement>): void {
		const props = this.props as EventHandlerPropertyViewProps & StoreInjection;
		const project = props.store.getProject();
		const userStore = project.getUserStore();
		const selectedAction = userStore.getActionById((e.target as HTMLSelectElement).value);

		if (!selectedAction || selectedAction.getType() === Types.UserStoreActionType.Noop) {
			props.elementProperty.setValue('');
			return;
		}

		const elementAction = new Model.ElementAction({
			id: uuid.v4(),
			payload: '',
			storeActionId: selectedAction.getId(),
			storePropertyId: selectedAction.getUserStorePropertyId() || ''
		});

		project.addElementAction(elementAction);
		props.elementProperty.setValue(elementAction.getId());
		props.store.commit();
	}

	private handlePropertyNameChange(
		item: Component.CreateSelectOption,
		action: Component.CreateSelectAction
	): void {
		const props = this.props as EventHandlerPropertyViewProps & StoreInjection;
		const project = props.store.getProject();
		const userStore = project.getUserStore();
		const elementAction = project.getElementActionById(String(props.elementProperty.getValue()));

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
				break;
			}
			case 'create-option': {
				const newProperty = new Model.UserStoreProperty({
					id: uuid.v4(),
					name: item.value,
					type: Types.UserStorePropertyType.String,
					payload: ''
				});
				userStore.addProperty(newProperty);
				elementAction.setStorePropertyId(newProperty.getId());
				props.store.commit();
				break;
			}
			case 'pop-value': {
				const removedStoreProperty = userStore.getPropertyById(action.removedValue.value);
				if (
					removedStoreProperty &&
					elementAction.getStorePropertyId() === removedStoreProperty.getId()
				) {
					elementAction.unsetStorePropertyId();
					props.store.commit();
				}
			}
		}
	}

	public render(): JSX.Element | null {
		const props = this.props as EventHandlerPropertyViewProps & StoreInjection;
		const project = props.store.getProject();
		const patternProperty = props.elementProperty.getPatternProperty() as Model.PatternEventHandlerProperty;

		const userStore = project.getUserStore();
		const elementAction = project.getElementActionById(String(props.elementProperty.getValue()));

		const userAction =
			(elementAction && userStore.getActionById(elementAction.getStoreActionId())) ||
			userStore.getNoopAction();

		const userProperty = elementAction
			? userStore.getPropertyById(elementAction.getStorePropertyId() || '')
			: undefined;

		return (
			<div
				key={props.elementProperty.getId()}
				style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
			>
				<Component.PropertyBox
					headline={patternProperty.getLabel()}
					copy={patternProperty.getDescription()}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							flexWrap: 'nowrap',
							marginTop: '12px'
						}}
					>
						<Component.PropertyLabel label={'Action'} />
						<Component.Select
							onChange={e => this.handleActionChange(e)}
							selectedValue={userAction.getId()}
						>
							{userStore
								.getActions()
								.map(action => (
									<Component.SelectOption
										key={action.getId()}
										label={action.getName()}
										value={action.getId()}
									/>
								))}
						</Component.Select>
					</div>
					{elementAction &&
						userAction &&
						userAction.getAcceptsProperty() && (
							<div style={{ width: '100%', marginBottom: '6px' }}>
								<Component.CreateSelect
									options={project
										.getUserStore()
										.getProperties()
										.map(p => ({
											label: p.getName(),
											value: p.getId()
										}))}
									placeholder="Select Variable"
									onChange={(e, meta) => this.handlePropertyNameChange(e, meta)}
									value={
										userAction && userProperty
											? { label: userProperty.getName(), value: userProperty.getId() }
											: undefined
									}
								/>
							</div>
						)}
					{userProperty &&
						(() => {
							switch (userProperty.getType()) {
								case Types.UserStorePropertyType.String:
									return (
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												flexWrap: 'wrap',
												width: '100%'
											}}
										>
											<Component.PropertyLabel label="to" />
											<Component.PropertyInput
												type={Component.PropertyInputType.Text}
												value={userProperty.getPayload()}
												onBlur={() => props.store.commit()}
												onChange={e => {
													userProperty.setPayload(e.target.value);
												}}
											/>
										</div>
									);
								case Types.UserStorePropertyType.Page:
									return (
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												flexWrap: 'nowrap',
												marginTop: '6px'
											}}
										>
											<Component.PropertyLabel label="to" />
											<Component.Select
												onChange={e => {
													if (elementAction) {
														elementAction.setPayload(
															(e.target as HTMLSelectElement).value
														);
														props.store.commit();
													}
												}}
												selectedValue={elementAction && elementAction.getPayload()}
											>
												{project
													.getPages()
													.map(page => (
														<Component.SelectOption
															key={page.getId()}
															value={page.getId()}
															label={page.getName()}
														/>
													))}
											</Component.Select>
										</div>
									);
							}
						})()}
				</Component.PropertyBox>
			</div>
		);
	}
}
