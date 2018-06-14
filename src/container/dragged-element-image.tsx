import * as React from 'react';
import styled from 'styled-components';
import * as Components from '../components';
import * as Model from '../model';

const StyledDraggedElement = styled.div`
	position: fixed;
	top: 100vh;
	background-color: ${Components.Color.White};
	color: ${Components.Color.Black};
	padding: 6px 18px;
	border-radius: 3px;
	font-size: 12px;
	opacity: 1;
`;

export class DraggedElementImage extends React.Component<{
	element?: Model.Element;
	innerRef(ref: HTMLElement): void;
}> {
	public render(): JSX.Element {
		const { props } = this;

		return (
			<StyledDraggedElement innerRef={props.innerRef}>
				{props.element && props.element.getName()}
			</StyledDraggedElement>
		);
	}
}
