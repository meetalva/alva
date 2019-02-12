import * as React from 'react';
import styled from '@emotion/styled';
import { Headline, HeadlineLevel } from '../headline';

import { reduce, Icon, IconName, IconRegistry, IconSize } from './icons';

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
	margin-top: 18px;
	width: 20%;
	min-width: 51px;
	text-align: center;
`;

const StyledIcon = styled(Icon)`
	margin-bottom: 9px;
`;

interface DemoIconsProps {
	names: typeof IconName;
	size: IconSize;
}

const DemoIcons = (props: DemoIconsProps) => {
	return (
		<div>
			<Headline level={HeadlineLevel.H3}>Icons {IconSize[props.size]}</Headline>
			<StyledDemoIconList>
				{reduce(props.names, (name, id) => [
					<StyledDemoListItem key={name}>
						<StyledIcon name={id} size={props.size} />
					</StyledDemoListItem>
				])}
			</StyledDemoIconList>
		</div>
	);
};

const IconRegistryDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<div>
			<DemoIcons size={IconSize.L} names={IconName} />
			<DemoIcons size={IconSize.S} names={IconName} />
			<IconRegistry names={IconName} />
		</div>
	);
};

export default IconRegistryDemo;
