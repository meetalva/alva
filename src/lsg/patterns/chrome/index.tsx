import { colors } from '../colors';
import { fonts } from '../fonts';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size as SpaceSize } from '../space';
import styled from 'styled-components';

export interface ChromeProps {
	leftVisible?: boolean;
	onLeftClick?: React.MouseEventHandler<HTMLElement>;
	onRightClick?: React.MouseEventHandler<HTMLElement>;
	rightVisible?: boolean;
	title?: string;
}

const StyledChrome = styled.div`
	box-sizing: border-box;
	position: absolute;
	top: 0;
	display: flex;
	align-items: center;
	width: 100%;
	height: 40px;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXL) * 3}px;
	border-bottom: 1px solid ${colors.grey90.toString()};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-bottom-width: 0.5px;
	}
	background: ${colors.white.toString()};
	font-family: ${fonts().NORMAL_FONT};
	-webkit-app-region: drag;
	-webkit-user-select: none;
	user-select: none;
	-webkit-font-smoothing: antialiased;
`;

const StyledChromeTitle = styled.div`
	display: flex;
	align-items: center;
	margin: 0 auto;
	color: ${colors.grey36.toString()};
	font-size: 15px;
`;

const StyledTitleWrapper = styled.div`
	position: relative;
	margin: -${getSpace(SpaceSize.XXS)}px ${getSpace(SpaceSize.XS)}px 0;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	text-align: center;
	width: 130px;
`;

interface StyledIconWrapperProps {
	visible: boolean;
}

const StyledIconWrapper = styled.div`
	margin: ${getSpace(SpaceSize.XS)}px;
	padding: ${getSpace(SpaceSize.XXS)}px;
	border-radius: ${getSpace(SpaceSize.XXS)}px;

	&:hover {
		background: ${colors.grey90.toString()};
	}

	${(props: StyledIconWrapperProps) =>
		props.visible ? 'visibility: visible' : 'visibility: hidden'};
`;

const StyledLeftIcon = styled(Icon)`
	fill: ${colors.grey60.toString()};
	transform: rotate(180deg);
`;

const StyledRightIcon = styled(Icon)`
	fill: ${colors.grey60.toString()};
`;

const Chrome: React.StatelessComponent<ChromeProps> = props => (
	<StyledChrome>
		<StyledChromeTitle>
			<StyledIconWrapper visible={props.leftVisible !== false} onClick={props.onLeftClick}>
				<StyledLeftIcon size={IconSize.XS} name={IconName.Arrow} />
			</StyledIconWrapper>

			<StyledTitleWrapper>{props.title}</StyledTitleWrapper>

			<StyledIconWrapper visible={props.rightVisible !== false} onClick={props.onRightClick}>
				<StyledRightIcon size={IconSize.XS} name={IconName.Arrow} />
			</StyledIconWrapper>
		</StyledChromeTitle>
		{props.children}
	</StyledChrome>
);

export default Chrome;
