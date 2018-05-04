import DemoContainer from '../demo-container';
import { Icon, IconName, IconRegistry, IconSize, reduce } from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledDemoIconList = styled.ul`
	box-sizing: border-box;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	margin-top: 20px;
	margin-bottom: 20px;
	padding-left: 0;
	width: 100%;
	list-style: none;
`;

const StyledDemoListItem = styled.li`
	margin-top: 20px;
	width: 20%;
	min-width: 51px;
	text-align: center;
`;

const StyledIcon = styled(Icon)`
	margin-bottom: 20px;
`;

interface DemoIconsProps {
	names: typeof IconName;
	size: IconSize;
}

const DemoIcons = (props: DemoIconsProps) => (
	<StyledDemoIconList>
		{reduce(props.names, (name, id) => [
			<StyledDemoListItem key={name}>
				<StyledIcon name={id} size={props.size} />
			</StyledDemoListItem>
		])}
	</StyledDemoIconList>
);

const IconRegistryDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Icons">
		<DemoIcons size={IconSize.XS} names={IconName} />
		<DemoIcons size={IconSize.S} names={IconName} />
		<IconRegistry names={IconName} />
	</DemoContainer>
);

export default IconRegistryDemo;
