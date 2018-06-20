import * as React from 'react';
import styled from 'styled-components';

export interface DragAreaProps {
	onDragStart: React.DragEventHandler<HTMLElement>;
}

const StyledDragArea = styled.div`
	width: 100%;
	height: 100%;
`;

export const DragArea: React.SFC<DragAreaProps> = props => (
	<StyledDragArea onDragStart={props.onDragStart}>{props.children}</StyledDragArea>
);
