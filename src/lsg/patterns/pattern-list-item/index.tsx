import { colors } from '../colors';
import { fonts } from '../fonts';
import { Icon, IconName, Size as IconSize } from '../icons';
import { LiProps } from '../list';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface PatternListItemProps extends LiProps {
	className?: string;
	icon?: string;
}

const StyledPatternListItem = styled.li`
	display: flex;
	align-items: center;
	cursor: default;
	padding: ${getSpace(Size.S)}px;
	border: 1px solid ${colors.grey90.toString()};
	margin: 0 0 ${getSpace(Size.S)}px 0;
	border-radius: 3px;
	background: ${colors.white.toString()};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 12px;
	color: ${colors.black.toString()};
`;

const StyledSVG = styled.svg`
	margin-right: ${getSpace(Size.L)}px;
	fill: ${colors.grey70.toString()};
`;

const StyledIcon = styled(Icon)`
	margin-right: ${getSpace(Size.L)}px;
`;

const PatternListItem: React.StatelessComponent<PatternListItemProps> = props => (
	<StyledPatternListItem {...props}>
		{props.icon
			? <StyledSVG>
				{props.icon}
			</StyledSVG>
			: <StyledIcon name={IconName.Robo} size={IconSize.XS} color={colors.grey70} />
		}
		{props.children}
	</StyledPatternListItem>
);

export default PatternListItem;
