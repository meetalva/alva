import * as React from 'react';
import styled from 'styled-components';

const StyledDragArea = styled.div`
	width: 100%;
	height: 100%;
`;

export const DragArea: React.SFC<{}> = props => (
	<StyledDragArea>
		{props.children}
		Hello World
	</StyledDragArea>
);
