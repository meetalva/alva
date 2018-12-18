import * as Components from '../../components';
import { ElementContainer } from './element-container';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface ElementSlotContainerProps {
	content: Model.ElementContent;
}

@MobxReact.inject('store')
@MobxReact.observer
export class ElementSlotContainer extends React.Component<ElementSlotContainerProps> {
	public render(): JSX.Element | null {
		const props = this.props as ElementSlotContainerProps & { store: ViewStore };
		const slot = props.content.getSlot();

		if (!slot || slot.getHidden()) {
			return null;
		}

		return (
			<Components.ElementSlot
				id={props.content.getId()}
				description={'Slot'}
				open={props.content.getOpen() || props.content.getForcedOpen()}
				state={getSlotState(props.content, props.store)}
				title={slot.getName()}
			>
				{props.content
					.getElements()
					.map(element => <ElementContainer element={element} key={element.getId()} />)}
			</Components.ElementSlot>
		);
	}
}

const getSlotState = (
	slot: Model.ElementContent,
	store: ViewStore
): Components.ElementSlotState => {
	const draggedElement = store.getDraggedElement();

	if (slot.getHighlighted()) {
		return Components.ElementSlotState.Highlighted;
	}

	if (draggedElement && slot.accepts(draggedElement)) {
		return Components.ElementSlotState.Default;
	}

	return Components.ElementSlotState.Disabled;
};
