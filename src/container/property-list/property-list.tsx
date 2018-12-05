import { ChevronDown, ChevronUp } from 'react-feather';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import { partition } from 'lodash';
import { PropertyListItem } from './property-list-item';
import * as React from 'react';
import styled from 'styled-components';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import * as Model from '../../model';
import * as Components from '../../components';

const StyledSummary = styled.summary`
	display: flex;
	justify-content: space-between;
	list-style: none;
	user-select: none;
	margin-top: ${Components.getSpace(Components.SpaceSize.S)}px;
	margin-bottom: ${Components.getSpace(Components.SpaceSize.S)}px;
	color: ${Components.Color.Grey50};

	::-webkit-details-marker {
		display: none;
	}

	:focus {
		outline: none;
	}
`;

export interface DetailsProps {
	open: boolean;
	summary: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

const Details: React.SFC<DetailsProps> = props => {
	return (
		<details open={props.open}>
			<StyledSummary onClick={props.onClick}>
				{props.summary}
				{props.open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
			</StyledSummary>
			{props.open && props.children}
		</details>
	);
};

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyListContainer extends React.Component {
	@Mobx.observable private detailsOpen = false;

	@Mobx.action
	private toggleOpen = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		this.detailsOpen = !this.detailsOpen;
	};

	public render(): React.ReactNode {
		const { store } = this.props as { store: ViewStore };
		const selectedElement = store.getSelectedElement();

		if (!selectedElement) {
			return null;
		}

		const [eventHandlerProps, props] = partition(
			selectedElement.getProperties(),
			isPropertyType(Types.PatternPropertyType.EventHandler)
		);

		const [unknownProps, regularProps] = partition(
			props,
			isPropertyType(Types.PatternPropertyType.Unknown)
		);

		return (
			<div>
				{regularProps.map(elementProperty => (
					<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
				))}
				{eventHandlerProps.map(elementProperty => (
					<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
				))}
				{unknownProps.length > 0 && (
					<Details
						open={this.detailsOpen}
						onClick={this.toggleOpen}
						summary={
							<Components.Headline type="primary" order={4}>
								Code Properties
							</Components.Headline>
						}
					>
						{unknownProps.map(elementProperty => (
							<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
						))}
					</Details>
				)}
			</div>
		);
	}
}

function isPropertyType(type: Types.PatternPropertyType): (p: Model.ElementProperty) => boolean {
	return p => {
		const patternProperty = p.getPatternProperty();
		return typeof patternProperty !== 'undefined' && patternProperty.getType() === type;
	};
}
