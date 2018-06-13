import * as AlvaUtil from '../../alva-util';
import * as Components from '../../components';
import { ElementCapability } from '../../components';
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

		const contents = props.element.getContents();

		const [[childContent], slotContents] = partition(
			contents,
			(content: Model.ElementContent): boolean =>
				content.getSlotType() === Types.SlotType.Children
		);

		return (
			<Components.Element
				capabilities={[
					ElementCapability.Draggable,
					props.element.getRole() !== Types.ElementRole.Root && ElementCapability.Editable,
					contents.some(content => content.acceptsChildren()) &&
						props.element.getRole() !== Types.ElementRole.Root &&
						ElementCapability.Openable
				].filter((item): item is ElementCapability => Boolean(item))}
				dragging={store.getDragging()}
				id={props.element.getId()}
				contentId={childContent ? childContent.getId() : ''}
				open={open}
				onChange={AlvaUtil.noop}
				placeholder={props.element.getRole() !== Types.ElementRole.Root}
				placeholderHighlighted={props.element.getPlaceholderHighlighted()}
				state={getElementState(props.element, store)}
				title={
					props.element.getRole() === Types.ElementRole.Root ? 'Page' : props.element.getName()
				}
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
