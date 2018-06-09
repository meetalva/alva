import * as MobxReact from 'mobx-react';
import { partition } from 'lodash';
import * as Model from '../../model';
import { PropertyListItem } from './property-list-item';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyListContainer extends React.Component {
	public render(): React.ReactNode {
		const { store } = this.props as { store: ViewStore };
		const selectedElement = store.getSelectedElement();

		if (!selectedElement) {
			return null;
		}

		const [regularProps, eventHandlerProps] = partition(
			selectedElement.getProperties(),
			isEventHandlerProperty
		);

		return (
			<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
				{regularProps.map(elementProperty => (
					<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
				))}
				<div style={{ marginTop: 'auto' }}>
					{eventHandlerProps.map(elementProperty => (
						<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
					))}
				</div>
			</div>
		);
	}
}

function isEventHandlerProperty(elementProperty: Model.ElementProperty): boolean {
	const patternProperty = elementProperty.getPatternProperty();
	return (
		typeof patternProperty !== 'undefined' &&
		patternProperty.getType() !== Types.PatternPropertyType.EventHandler
	);
}
