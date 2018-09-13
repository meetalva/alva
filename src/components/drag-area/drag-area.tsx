import * as React from 'react';
import styled from 'styled-components';

export interface DragAreaProps {
	onBlur?: React.FocusEventHandler<HTMLElement>;
	onChange?: React.FormEventHandler<HTMLElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onContextMenu?: React.MouseEventHandler<HTMLElement>;
	onDragEnter: React.DragEventHandler<HTMLElement>;
	onDragStart: React.DragEventHandler<HTMLElement>;
	onDragLeave: React.DragEventHandler<HTMLElement>;
	onDragOver: React.DragEventHandler<HTMLElement>;
	onDrop: React.DragEventHandler<HTMLElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
	onMouseLeave?: React.MouseEventHandler<HTMLElement>;
	onMouseOver?: React.MouseEventHandler<HTMLElement>;
	// tslint:disable-next-line:no-any
	innerRef?(instance: any): void;
}

const StyledDragArea = styled.div`
	width: 100%;
	height: 100%;
`;

export const DragArea: React.SFC<DragAreaProps> = props => (
	<StyledDragArea data-drag-root {...props}>
		{props.children}
	</StyledDragArea>
);
