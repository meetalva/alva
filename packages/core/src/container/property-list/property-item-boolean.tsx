import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import { debounce } from 'lodash';

export interface PropertyItemBooleanProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemBoolean extends React.Component<PropertyItemBooleanProps> {
	private commit = debounce(() => {
		const props = this.props as PropertyItemBooleanProps & { store: ViewStore };
		props.store.commit();
	}, 300);

	private handleChange(e: React.ChangeEvent<HTMLElement>): void {
		const props = this.props as PropertyItemBooleanProps & { store: ViewStore };
		const target = e.target as HTMLInputElement;
		props.property.setValue(target.checked);
		this.commit();
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
