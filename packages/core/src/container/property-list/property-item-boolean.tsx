import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
// import { UserStorePropertySelect } from '../user-store-property-select';
// import { UserStoreReferenceContainer } from './user-store-reference';
import { ViewStore } from '../../store';

export interface PropertyItemBooleanProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemBoolean extends React.Component<PropertyItemBooleanProps> {
	private handleChange(e: React.ChangeEvent<HTMLElement>): void {
		const props = this.props as PropertyItemBooleanProps & { store: ViewStore };
		const target = e.target as HTMLInputElement;
		props.property.setValue(target.checked);
		props.store.commit();
	}

	public render(): JSX.Element | null {
		const props = this.props as PropertyItemBooleanProps & { store: ViewStore };
		const { property } = props;

		const patternProperty = property.getPatternProperty();

		if (!patternProperty) {
			return null;
		}

		return (
			<Components.PropertyItemBoolean
				description={patternProperty.getDescription()}
				label={patternProperty.getLabel()}
				key={patternProperty.getType()}
				checked={property.getValue() as boolean}
				onChange={e => this.handleChange(e)}
			/>
		);
	}
}
