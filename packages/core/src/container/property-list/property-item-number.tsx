import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import { debounce } from 'lodash';

export interface PropertyItemNumberProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemNumber extends React.Component<PropertyItemNumberProps> {
	private commit = debounce(() => {
		const props = this.props as PropertyItemNumberProps & { store: ViewStore };
		props.store.commit();
	}, 300);

	private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { property } = this.props;
		property.setValue(e.target.value);
		this.commit();
	};

	private handlePlusClick = (e: React.MouseEvent) => {
		e.preventDefault();
		const { property } = this.props;
		const currentValue = property.getValue() === undefined ? 0 : (property.getValue() as number);
		property.setValue((currentValue + 1).toString());
		this.commit();
	};

	private handleMinusClick = (e: React.MouseEvent) => {
		e.preventDefault();
		const { property } = this.props;
		const currentValue = property.getValue() === undefined ? 0 : (property.getValue() as number);
		property.setValue((currentValue - 1).toString());
		this.commit();
	};

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
				value={property.getValue() as number | undefined}
				onBlur={() => window.requestIdleCallback(() => props.store.commit())}
				onChange={this.handleChange}
				placeholder={example ? `e.g.: ${example}` : ''}
				onMinusClick={this.handleMinusClick}
				onPlusClick={this.handlePlusClick}
			/>
		);
	}
}
