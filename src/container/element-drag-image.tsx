import * as React from 'react';
import styled from 'styled-components';
import * as Components from '../components';
import * as Model from '../model';

const StyledElementDragImage = styled.div`
	position: fixed;
	top: 100vh;
	background-color: ${Components.Color.White};
	color: ${Components.Color.Black};
	padding: 6px 18px;
	border-radius: 3px;
	font-size: 12px;
	opacity: 1;
`;

export class ElementDragImage extends React.Component<{
	element?: Model.Element;
	dragRef: React.Ref<any>;
}> {
	public render(): JSX.Element {
		const { props } = this;

		return (
			<StyledElementDragImage ref={props.dragRef}>
				{props.element && props.element.getName()}
			</StyledElementDragImage>
		);
	}
}
