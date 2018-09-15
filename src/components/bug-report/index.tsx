import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';

export interface BugReportProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	title: string;
}

const StyledBugReport = styled.div`
	display: flex;
	padding: 0 ${getSpace(SpaceSize.S)}px;
	align-items: center;
	justify-self: right;
	-webkit-app-region: no-drag;
	box-sizing: border-box;
	border-radius: 3px;
	background: linear-gradient(to bottom, ${Color.White} 0%, ${Color.Grey97});
	height: 21px;
	box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 0.5px 2px 0 rgba(0, 0, 0, 0.3);
	color: ${Color.Grey50};

	&:active {
		background: ${Color.Grey90};
	}
`;

export const BugReport: React.StatelessComponent<BugReportProps> = props => (
	<StyledBugReport onClick={props.onClick} onDoubleClick={props.onDoubleClick} title={props.title}>
		{props.title}
	</StyledBugReport>
);
