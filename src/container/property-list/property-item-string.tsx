import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { UserStorePropertySelect } from '../user-store-property-select';
import { UserStoreReferenceContainer } from './user-store-reference';
import { ViewStore } from '../../store';

const OutsideClickHandler = require('react-outside-click-handler').default;

export interface PropertyItemStringProps {
	property: Model.ElementProperty;
	onReferenceConnect: React.MouseEventHandler<HTMLElement>;
	onReferenceChange: Components.CreateSelectProps['onChange'];
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemString extends React.Component<PropertyItemStringProps> {
	public render(): JSX.Element | null {
		const props = this.props as PropertyItemStringProps & { store: ViewStore };
		const { property } = props;

		const patternProperty = property.getPatternProperty();
		const userStoreReference = property.getUserStoreReference();
		const referencedUserStoreProperty = property.getReferencedUserStoreProperty();

		if (!patternProperty) {
			return null;
		}

		const example = patternProperty.getExample();

		return (
			<Components.PropertyItemString
				description={patternProperty.getDescription()}
				label={patternProperty.getLabel()}
				value={property.getValue() as string}
				onBlur={() => props.store.commit()}
				onChange={e => property.setValue(e.target.value)}
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
								<Components.LinkIcon onClick={props.onReferenceConnect} />
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
										onChange={props.onReferenceChange}
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
