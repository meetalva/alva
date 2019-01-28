import * as Components from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';

const OutsideClickHandler = require('react-outside-click-handler').default;

export interface ActionPayloadSelectProps {
	autoFocus?: boolean;
	placeholder?: string;
	menuIsOpen?: boolean;
	elementAction: Model.ElementAction;
	onChange?: Components.SelectProps['onChange'];
	onBlur?: React.ChangeEventHandler<HTMLElement>;
	onOutsideClick?: React.MouseEventHandler<HTMLElement>;
}

@MobxReact.inject('store')
@MobxReact.observer
export class ActionPayloadSelect extends React.Component<ActionPayloadSelectProps> {
	public render(): JSX.Element | null {
		const props = this.props as ActionPayloadSelectProps & { store: ViewStore };

		const elementId = props.elementAction.getElementPropertyId();
		const elementProperty = props.store.getProject().getElementPropertyById(elementId);

		if (!elementProperty) {
			return null;
		}

		const element = elementProperty.getElement();

		if (!element) {
			return null;
		}

		const patternProperty = elementProperty.getPatternProperty() as Model.PatternEventHandlerProperty;

		if (!patternProperty) {
			return null;
		}

		const eventOptions = patternProperty
			.getEvent()
			.getPayloadFields()
			.map(field => ({ label: field, value: field }));

		const elementOptions = element
			.getProperties()
			.filter(p => p.getId() !== elementProperty.getId())
			.map(p => {
				const pp = p.getPatternProperty();
				return pp ? { label: pp ? pp.getLabel() : 'Unknown', value: p.getId() } : undefined;
			})
			.filter((p): p is Components.SimpleSelectOption => typeof p !== 'undefined');

		const options = [
			{
				label: 'Event Payload',
				options: eventOptions
			},
			{
				label: 'Element Property',
				options: elementOptions
			}
		];

		const value =
			eventOptions.find(e => e.value === props.elementAction.getPayload()) ||
			elementOptions.find(o => o.value === props.elementAction.getPayload());

		return (
			<OutsideClickHandler onOutsideClick={props.onOutsideClick}>
				<Components.Select
					menuIsOpen={this.props.menuIsOpen}
					options={options}
					placeholder={this.props.placeholder}
					onBlur={this.props.onBlur}
					onChange={this.props.onChange}
					value={value}
				/>
			</OutsideClickHandler>
		);
	}
}
