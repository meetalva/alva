import { Button, ButtonOrder, ButtonSize } from '../button';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface BugReportProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
	title: string;
}

const StyledBugReport = styled.div`
	justify-self: right;
	margin-right: -${getSpace(SpaceSize.XXL) * 2 + getSpace(SpaceSize.S - SpaceSize.L)}px; // align to top right corner
`;

export const BugReport: React.StatelessComponent<BugReportProps> = props => (
	<StyledBugReport>
		<Button order={ButtonOrder.Secondary} size={ButtonSize.Small} onClick={props.onClick}>
			{props.title}
		</Button>
	</StyledBugReport>
);
