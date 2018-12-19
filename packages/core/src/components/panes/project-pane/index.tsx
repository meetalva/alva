import * as React from 'react';
import styled from 'styled-components';

const StyledProjectPane = styled.div`
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 60%;
`;

export interface ProjectPaneProps {
	children: React.ReactNode;
}

export const ProjectPane: React.StatelessComponent<ProjectPaneProps> = props => (
	<StyledProjectPane>{props.children}</StyledProjectPane>
);
