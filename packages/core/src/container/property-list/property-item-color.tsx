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

export interface PropertyItemColorState {
	propertyOverlay: boolean;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemColor extends React.Component<PropertyItemColorProps> {
	public state = {
		displayColorPicker: false,
		color: (this.props.property.getValue() || '') as string
	};

	private commit = debounce(() => {
		const props = this.props as PropertyItemColorProps & { store: ViewStore };
		props.store.commit();
	}, 300);

	private handleColorPickerChange = (color: { hex: string }) => {
		const { property } = this.props;
		property.setValue(color.hex);
		this.setState({ color: color.hex });
	};

	private handleColorPickerChangeComplete = (color: { hex: string }) => {
		const { property } = this.props;
		property.setValue(color.hex);
		this.setState({ color: color.hex });
		this.commit();
	};

	private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { property } = this.props;
		property.setValue(e.target.value);
		this.setState({ color: e.target.value });
	};

	private showPropertyOverlay = () => {
		this.setState({ displayColorPicker: true });
		console.log('show it');
	};

	private hidePropertyOverlay = () => {
		this.setState({ displayColorPicker: false });
		console.log('hide it');
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
			<OutsideClickHandler onOutsideClick={() => this.hidePropertyOverlay()}>
				<Components.PropertyItemColor
					description={patternProperty.getDescription()}
					onShow={() => this.showPropertyOverlay()}
					onHide={() => this.hidePropertyOverlay()}
					onChange={this.handleChange}
					label={patternProperty.getLabel()}
					color={this.state.color}
					show={this.state.displayColorPicker}
					onBlur={() => window.requestIdleCallback(() => props.store.commit())}
					onColorPickerChange={this.handleColorPickerChange}
					onColorPickerChangeComplete={this.handleColorPickerChangeComplete}
					placeholder={example ? `e.g.: ${example}` : ''}
				/>
			</OutsideClickHandler>
		);
	}
}
