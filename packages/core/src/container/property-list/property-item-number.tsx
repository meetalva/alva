import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface PropertyItemNumberProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemNumber extends React.Component<PropertyItemNumberProps> {
	public render(): JSX.Element | null {
		const props = this.props as PropertyItemNumberProps & { store: ViewStore };
		const { property } = props;

		const patternProperty = property.getPatternProperty();

		if (!patternProperty) {
			return null;
		}

		const example = patternProperty.getExample();

		return (
			<Components.PropertyItemNumber
				description={patternProperty.getDescription()}
				label={patternProperty.getLabel()}
				value={property.getValue() as string}
				onBlur={() => props.store.commit()}
				onChange={e => property.setValue(e.target.value)}
				placeholder={example ? `e.g.: ${example}` : ''}
			/>
		);
	}
}
