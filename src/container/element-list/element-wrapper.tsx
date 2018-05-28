import { Element } from '../../components';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface ElementWrapperProps {
	active: boolean;
	draggable: boolean;
	dragging: boolean;
	editable: boolean;
	highlight: boolean;
	highlightPlaceholder: boolean;
	id: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onContextMenu?: React.MouseEventHandler<HTMLElement>;
	onDragDrop?: React.DragEventHandler<HTMLElement>;
	onDragDropForChild?: React.DragEventHandler<HTMLElement>;
	onDragStart?: React.DragEventHandler<HTMLElement>;
	open: boolean;
	title: string;
}

export class ElementWrapper extends React.Component<ElementWrapperProps> {
	private handleChange(e: React.FormEvent<HTMLInputElement>): void {
		const target = e.target as HTMLInputElement;
		const store = ViewStore.getInstance();
		const element = store.getNameEditableElement();

		if (element) {
			element.setName(target.value);
		}
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<Element
				active={props.active}
				dragging={props.dragging}
				draggable={props.draggable}
				editable={props.editable}
				onChange={e => this.handleChange(e)}
				onDragStart={props.onDragStart}
				highlight={props.highlight}
				highlightPlaceholder={props.highlightPlaceholder}
				id={props.id}
				open={props.open}
				title={props.title}
			>
				{props.children}
			</Element>
		);
	}
}
