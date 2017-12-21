import * as React from 'react';
import styled from 'styled-components';

const StyledProjectPane = styled.div`
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 60%;
`;

const ProjectPane: React.StatelessComponent = props => <StyledProjectPane>{props.children}</StyledProjectPane>;

export default ProjectPane;
