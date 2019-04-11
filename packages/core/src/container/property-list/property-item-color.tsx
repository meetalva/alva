import * as Components from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as Model from '@meetalva/model';
import * as React from 'react';
import { ViewStore } from '../../store';
import { debounce } from 'lodash';

const OutsideClickHandler = require('react-outside-click-handler').default;

export interface PropertyItemColorProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemColor extends React.Component<PropertyItemColorProps> {
	private commit = debounce(() => {
		const props = this.props as PropertyItemColorProps & { store: ViewStore };
		props.store.commit();
	}, 300);

	private handleColorPickerChange = (color: { hex: string }) => {
		const { property } = this.props;
		property.setValue(color.hex);
	};

	private handleColorPickerChangeComplete = (color: { hex: string }) => {
		const { property } = this.props;
		property.setValue(color.hex);
		this.commit();
	};

	private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { property } = this.props;
		property.setValue(e.target.value);
	};

	public render(): JSX.Element | null {
		const props = this.props as PropertyItemColorProps & { store: ViewStore };
		const { property } = props;

		const patternProperty = property.getPatternProperty();

		if (!patternProperty) {
			return null;
		}

		const example = patternProperty.getExample();

		return (
			<OutsideClickHandler onOutsideClick={() => patternProperty.setFocused(false)}>
				<Components.PropertyItemColor
					description={patternProperty.getDescription()}
					onShow={() => patternProperty.setFocused(true)}
					onHide={() => patternProperty.setFocused(false)}
					onChange={this.handleChange}
					label={patternProperty.getLabel()}
					color={(this.props.property.getValue() || '') as string}
					show={patternProperty.getFocused() || false}
					onBlur={() => window.requestIdleCallback(() => props.store.commit())}
					onColorPickerChange={this.handleColorPickerChange}
					onColorPickerChangeComplete={this.handleColorPickerChangeComplete}
					placeholder={example ? `${example}` : ''}
				/>
			</OutsideClickHandler>
		);
	}
}
