import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { ViewStore } from '../../store';
import { PropertyListVirtual } from './property-list-virtual';
import * as Components from '../../components';
import * as T from '../../types';

export interface PropertyListContainerProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyListContainer extends React.Component<PropertyListContainerProps> {
	public render(): React.ReactNode {
		const { store } = this.props as { store: ViewStore };
		const selectedElement = store.getSelectedElement();

		if (!selectedElement || selectedElement.getRole() === T.ElementRole.Root) {
			return (
				<Components.EmptyState
					headline="Properties"
					copy="Select an element to edit properties"
				/>
			);
		}
		return <PropertyListVirtual element={selectedElement} />;
	}
}
