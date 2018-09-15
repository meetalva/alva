import * as React from 'react';
import styled from 'styled-components';

export enum DragAreaAnchors {
	element = 'data-id',
	content = 'data-content-id'
}

export interface DragAreaAnchorProps {
	[DragAreaAnchors.element]: string;
	[DragAreaAnchors.content]: string;
}

export interface DragAreaProps {
	anchors: DragAreaAnchorProps;
	onDragEnter: React.DragEventHandler<HTMLElement>;
	onDragStart: React.DragEventHandler<HTMLElement>;
	onDragLeave: React.DragEventHandler<HTMLElement>;
	onDragOver: React.DragEventHandler<HTMLElement>;
	onDrop: React.DragEventHandler<HTMLElement>;
	onBlur?: React.FocusEventHandler<HTMLElement>;
	onChange?: React.FormEventHandler<HTMLElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onContextMenu?: React.MouseEventHandler<HTMLElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
	onMouseLeave?: React.MouseEventHandler<HTMLElement>;
	onMouseOver?: React.MouseEventHandler<HTMLElement>;
}

const StyledDragArea = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
`;

export const DragArea: React.SFC<DragAreaProps> = props => (
	<StyledDragArea
		data-drag-root
		data-content-id={props.anchors['data-content-id']}
		data-id={props.anchors['data-id']}
		{...props}
	>
		{props.children}
	</StyledDragArea>
);
