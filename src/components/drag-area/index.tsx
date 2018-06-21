import * as React from 'react';
import styled from 'styled-components';

export interface DragAreaProps {
	innerRef?: React.Ref<HTMLElement>;
	onBlur?: React.FocusEventHandler<HTMLElement>;
	onChange?: React.FormEventHandler<HTMLElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onContextMenu?: React.MouseEventHandler<HTMLElement>;
	onDragStart: React.DragEventHandler<HTMLElement>;
	onDragLeave: React.DragEventHandler<HTMLElement>;
	onDragOver: React.DragEventHandler<HTMLElement>;
	onDrop: React.DragEventHandler<HTMLElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
	onMouseLeave?: React.MouseEventHandler<HTMLElement>;
	onMouseOver?: React.MouseEventHandler<HTMLElement>;
}

const StyledDragArea = styled.div`
	width: 100%;
	height: 100%;
`;

export const DragArea: React.SFC<DragAreaProps> = props => (
	<StyledDragArea
		data-drag-root
		onBlur={props.onBlur}
		onChange={props.onChange}
		onClick={props.onClick}
		onContextMenu={props.onContextMenu}
		onDragStart={props.onDragStart}
		onDragLeave={props.onDragLeave}
		onDragOver={props.onDragOver}
		onDrop={props.onDrop}
		onKeyDown={props.onKeyDown}
		onMouseLeave={props.onMouseLeave}
		onMouseOver={props.onMouseOver}
	>
		{props.children}
	</StyledDragArea>
);
