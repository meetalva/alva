import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import { partition, groupBy } from 'lodash';
import { PropertyListItem } from './property-list-item';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import * as Model from '../../model';
import * as Components from '../../components';

export interface PropertyListContainerProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyListContainer extends React.Component<PropertyListContainerProps> {
	@Mobx.observable private codeDetails = false;
	@Mobx.action
	private toggleCodeDetails(e: React.MouseEvent<HTMLElement>) {
		if (this.props.onClick) {
			this.props.onClick(e);
		}

		e.preventDefault();
		this.codeDetails = !this.codeDetails;
	}

	public render(): React.ReactNode {
		const { store } = this.props as { store: ViewStore };
		const selectedElement = store.getSelectedElement();

		if (!selectedElement) {
			return null;
		}

		const relevantProps = selectedElement.getProperties().filter(p => !p.getHidden());

		const [eventHandlerProps, props] = partition(
			relevantProps,
			isPropertyType(Types.PatternPropertyType.EventHandler)
		);

		const [unknownProps, regularProps] = partition(
			props,
			isPropertyType(Types.PatternPropertyType.Unknown)
		);

		const [groupedProps, ungroupedProps] = partition(regularProps, isGrouped(true));

		const groupedPropsObject = groupBy(groupedProps, elementProperty =>
			elementProperty.getGroup()
		);

		return (
			<div>
				{ungroupedProps.map(elementProperty => (
					<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
				))}
				{Object.entries(groupedPropsObject).map(([groupName, group]) => {
					if (group.length === 0) {
						return null;
					}

					return (
						<Components.PropertyDetails
							open
							onClick={e => e.preventDefault()}
							key={groupName}
							summary={
								<Components.Headline type="primary" order={4}>
									{groupName}
								</Components.Headline>
							}
						>
							{group.map(property => (
								<PropertyListItem key={property.getId()} property={property} />
							))}
						</Components.PropertyDetails>
					);
				})}
				{eventHandlerProps.map(elementProperty => (
					<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
				))}
				{unknownProps.length > 0 && (
					<Components.PropertyDetails
						open={this.codeDetails}
						onClick={e => this.toggleCodeDetails(e)}
						toggleable
						summary={
							<div>
								<Components.Headline type="primary" order={4}>
									Code Properties
								</Components.Headline>
								<Components.Space sizeBottom={Components.SpaceSize.XS} />
								<Components.Copy>This component accepts code properties</Components.Copy>
							</div>
						}
					>
						{unknownProps.map(elementProperty => (
							<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
						))}
					</Components.PropertyDetails>
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

function isGrouped(grouped: boolean): (p: Model.ElementProperty) => boolean {
	return p => {
		const patternProperty = p.getPatternProperty();
		const hasGroup = typeof patternProperty !== 'undefined' && patternProperty.getGroup() !== '';
		return typeof patternProperty !== 'undefined' && hasGroup === grouped;
	};
}
