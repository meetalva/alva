import globalStyles from './global-styles';
import { Headline } from './headline';
import * as Icon from './icons';
import * as React from 'react';
import { Space, SpaceSize } from './space';
import styled from 'styled-components';

globalStyles();

export interface DemoContainerProps {
	className?: string;
	title?: string;
}

const StyledDemoContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
`;

const DemoContainer: React.StatelessComponent<DemoContainerProps> = props => (
	<StyledDemoContainer className={props.className}>
		<Space size={SpaceSize.L}>
			{props.title && <Headline type="primary">{props.title}</Headline>}
		</Space>
		{React.Children.map(props.children, child => <Space size={SpaceSize.L}>{child}</Space>)}
		<Icon.IconRegistry />
	</StyledDemoContainer>
);

export default DemoContainer;
