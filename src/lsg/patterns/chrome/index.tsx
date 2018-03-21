import { colors } from '../colors';
import { fonts } from '../fonts';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size as SpaceSize } from '../space';
import styled from 'styled-components';

export interface ChromeProps {
	active?: boolean;
	handleClick?: React.MouseEventHandler<HTMLElement>;
	open?: boolean;
	title?: string;
}

export interface ChromeTitleProps {
	handleClick?: React.MouseEventHandler<HTMLElement>;
	open?: boolean;
}

interface StyledChromeIconProps {
	open?: boolean;
}

export interface StyledChromeDropDownItemProps {
	active?: boolean;
}

const StyledChrome = styled.div`
	box-sizing: border-box;
	position: absolute;
	top: 0;
	display: flex;
	align-items: center;
	width: 100%;
	height: 54px;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXL) * 3}px;
	font-family: ${fonts().NORMAL_FONT};
	-webkit-app-region: drag;
	-webkit-user-select: none;
	user-select: none;
`;

const StyledChromeTitle = styled.div`
	display: flex;
	align-items: center;
	margin: 0 auto;
	color: ${colors.grey36.toString()};
	font-size: 15px;
`;

const StyledChromeIcon = styled(Icon)`
	margin-left: ${getSpace(SpaceSize.XS)}px;
	fill: ${colors.grey36.toString()};
	transition: transform 0.2s;

	${(props: StyledChromeIconProps) =>
		props.open ? 'transform: rotate(-90deg)' : 'transform: rotate(90deg)'};
`;

const ChromeComponent: React.StatelessComponent<ChromeProps> = props => (
	<StyledChrome>
		<StyledChromeTitle onClick={props.handleClick}>
			{props.title}
			<StyledChromeIcon size={IconSize.XXS} name={IconName.ArrowFill} open={props.open} />
		</StyledChromeTitle>
		{props.children}
	</StyledChrome>
);

export default ChromeComponent;
