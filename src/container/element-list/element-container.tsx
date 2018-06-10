import * as AlvaUtil from '../../alva-util';
import * as Components from '../../components';
import { ElementContentContainer } from './element-content-container';
import { ElementSlotContainer } from './element-slot-container';
import { partition } from 'lodash';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import * as Types from '../../types';
import { ViewStore } from '../../store';

export interface ElementContainerProps {
	element: Model.Element;
}

@MobxReact.inject('store')
@MobxReact.observer
export class ElementContainer extends React.Component<ElementContainerProps> {
	public render(): JSX.Element | null {
		const { store } = this.props as ElementContainerProps & { store: ViewStore };

		const { props } = this;
		const open = props.element.getOpen() || props.element.getForcedOpen();

		// Ensure mobx registers
		// props.element.getSelected();
		// props.element.getNameEditable();
		// props.element.getHighlighted();
		// props.element.acceptsChildren();

		const [[childContent], slotContents] = partition(
			props.element.getContents(),
			(content: Model.ElementContent): boolean =>
				content.getSlotType() === Types.SlotType.Children
		);

		return (
			<Components.Element
				draggable={true}
				dragging={store.getDragging()}
				id={props.element.getId()}
				contentId={childContent ? childContent.getId() : ''}
				mayOpen={
					props.element.acceptsChildren() && props.element.getRole() !== Types.ElementRole.Root
				}
				open={open}
				onChange={AlvaUtil.noop}
				placeholder={props.element.getRole() !== Types.ElementRole.Root}
				placeholderHighlighted={props.element.getPlaceholderHighlighted()}
				state={getElementState(props.element, store)}
				title={props.element.getName()}
			>
				<Components.Element.ElementSlots>
					{slotContents.map(slotContent => (
						<ElementSlotContainer key={slotContent.getId()} content={slotContent} />
					))}
				</Components.Element.ElementSlots>
				{childContent && (
					<Components.Element.ElementChildren>
						<ElementContentContainer content={childContent} />
					</Components.Element.ElementChildren>
				)}
			</Components.Element>
		);
	}
}

const getElementState = (element: Model.Element, store: ViewStore): Components.ElementState => {
	const childContent = element.getContentBySlotType(Types.SlotType.Children);
	const draggedElement = store.getDraggedElement();

	if (element.getSelected() && element.getNameEditable()) {
		return Components.ElementState.Editable;
	}

	if (element.getSelected()) {
		return Components.ElementState.Active;
	}

	if (store.getDragging() && !element.acceptsChildren()) {
		return Components.ElementState.Disabled;
	}

	if (draggedElement && !element.accepts(draggedElement)) {
		return Components.ElementState.Disabled;
	}

	if (element.getHighlighted() || (childContent && childContent.getHighlighted())) {
		return Components.ElementState.Highlighted;
	}

	return Components.ElementState.Default;
};
