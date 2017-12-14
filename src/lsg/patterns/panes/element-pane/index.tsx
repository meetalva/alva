import * as React from 'react';
import styled from 'styled-components';

const StyledElementPane = styled.div`
	position: relative;
	flex-grow: 3;
	flex-shrink: 0;
	flex-basis: 60%;
	overflow: scroll;

	/*FadeOut*/
	&::after {
		content: '';
		position: sticky;
		bottom: 0;
		display: block;
		width: 100%;
		height: 40px;
		background: linear-gradient(to bottom, rgba(247,247,247,0) 0%, rgba(247,247,247,0.5) 15%, rgba(247,247,247,1) 100%);
	}
`;

const ElementPane: React.StatelessComponent<{}> = props => <StyledElementPane>{props.children}</StyledElementPane>;

export default ElementPane;
