import { Button, ButtonOrder, ButtonSize } from '../button';
import * as React from 'react';
import styled from 'styled-components';

export interface BugReportProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
	title: string;
}

const StyledBugReport = styled.div`
	justify-self: right;
	-webkit-app-region: no-drag;
`;

export const BugReport: React.StatelessComponent<BugReportProps> = props => (
	<StyledBugReport>
		<Button order={ButtonOrder.Secondary} size={ButtonSize.Small} onClick={props.onClick}>
			{props.title}
		</Button>
	</StyledBugReport>
);
