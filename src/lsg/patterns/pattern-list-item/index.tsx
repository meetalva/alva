import { colors } from '../colors';
import { fonts } from '../fonts';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import styled from 'styled-components';

export interface PatternListItemProps {
	className?: string;
	icon?: string;
}

const StyledPatternListItem = styled.div`
	display: flex;
	align-items: center;
	padding: 10px;
	border: 1px solid ${colors.grey90.toString()};
	border-radius: 3px;
	background: ${colors.white.toString()};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 12px;
	color: ${colors.black.toString()};
`;

const StyledSVG = styled.svg`
	margin-right: 20px;
	fill: ${colors.grey70.toString()};
`;

const StyledIcon = styled(Icon)`
	margin-right: 20px;
`;

const PatternListItem: React.StatelessComponent<PatternListItemProps> = props => (
	<StyledPatternListItem className={props.className}>
		{props.icon
			? <StyledSVG>
				<use xlinkHref={props.icon} />
			</StyledSVG>
			: <StyledIcon name={IconName.Robo} size={IconSize.XS} color={colors.grey70} />
		}
		{props.children}
	</StyledPatternListItem>
);

export default PatternListItem;
