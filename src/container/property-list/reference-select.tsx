import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { UserStorePropertySelect } from '../user-store-property-select';
import { Reference } from './reference';
import * as Types from '../../types';
import { ViewStore } from '../../store';
import * as uuid from 'uuid';

export interface ReferenceSelectProps {
	property: Model.ElementProperty;
}

const OutsideClickHandler = require('react-outside-click-handler').default;

@MobxReact.inject('store')
@MobxReact.observer
export class ReferenceSelect extends React.Component<ReferenceSelectProps> {
	private handleConnect(e: React.MouseEvent<HTMLElement>): void {
		const props = this.props as ReferenceSelectProps & { store: ViewStore };
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

	private handleChange(
		item: Components.CreateSelectOption,
		action: Components.CreateSelectAction
	): void {
		const props = this.props as ReferenceSelectProps & { store: ViewStore };
		const project = props.store.getProject();
		const userStore = project.getUserStore();
		const userStoreReference = props.property.getUserStoreReference();

		if (!userStoreReference) {
			return;
		}

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

	public render(): JSX.Element | null {
		const props = this.props;

		const userStoreReference = props.property.getUserStoreReference();
		const referencedUserStoreProperty = props.property.getReferencedUserStoreProperty();
		const patternProperty = props.property.getPatternProperty();

		if (!patternProperty) {
			return null;
		}

		const showConcreteValue =
			!userStoreReference || (!userStoreReference.getOpen() && !referencedUserStoreProperty);

		const showPropertySelect = userStoreReference && userStoreReference.getOpen();

		const showReference = userStoreReference && !userStoreReference.getOpen();

		return (
			<Components.RelativeArea>
				{showConcreteValue && (
					<>
						{this.props.children}
						<Components.LinkIcon onClick={e => this.handleConnect(e)} />
					</>
				)}
				{showPropertySelect &&
					userStoreReference && (
						<Components.PropertyItem
							description={patternProperty.getDescription()}
							label={patternProperty.getLabel()}
						>
							<div style={{ width: '100%' }}>
								<OutsideClickHandler
									onOutsideClick={() => userStoreReference.setOpen(false)}
								>
									<UserStorePropertySelect
										menuIsOpen={userStoreReference.getOpen()}
										property={referencedUserStoreProperty}
										onChange={(item, action) => this.handleChange(item, action)}
										placeholder="Connect Variable"
									/>
								</OutsideClickHandler>
							</div>
						</Components.PropertyItem>
					)}
				{showReference &&
					userStoreReference && (
						<Components.PropertyItem
							description={patternProperty.getDescription()}
							label={patternProperty.getLabel()}
						>
							<Reference reference={userStoreReference} />
						</Components.PropertyItem>
					)}
			</Components.RelativeArea>
		);
	}
}
