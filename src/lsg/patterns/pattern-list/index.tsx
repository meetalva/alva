import { colors } from '../colors';
import { fonts } from '../fonts';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface PatternListItemProps {
	draggable?: boolean;
	handleDragStart?: React.DragEventHandler<HTMLElement>;
	icon?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

const StyledPatternList = styled.ul`
	box-sizing: border-box;
	display: block;
	padding: 0;
	margin: 0;
`;

const StyledPatternLabel = styled.div`
	margin-bottom: ${getSpace(Size.S)}px;
	color: ${colors.grey70.toString()};
`;

const StyledPatternListItem = styled.li`
	display: flex;
	align-items: center;
	padding: ${getSpace(Size.S)}px;
	border: 1px solid ${colors.grey90.toString()};
	margin: 0 0 ${getSpace(Size.S)}px 0;
	border-radius: 3px;
	background: ${colors.white.toString()};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 12px;
	color: ${colors.black.toString()};

	${(props: PatternListItemProps) =>
		props.draggable ? 'cursor: move;' : props.onClick ? 'cursor: pointer;' : ''};
`;

const StyledSVG = styled.svg`
	margin-right: ${getSpace(Size.L)}px;
	fill: ${colors.grey70.toString()};
`;

const StyledIcon = styled(Icon)`
	margin-right: ${getSpace(Size.L)}px;
`;

export const PatternListItem: React.StatelessComponent<PatternListItemProps> = props => {
	const { draggable, handleDragStart, icon, onClick } = props;
	return (
		<StyledPatternListItem onDragStart={handleDragStart} draggable={draggable} onClick={onClick}>
			{icon ? (
				<StyledSVG className="pattern__icon">{icon}</StyledSVG>
			) : (
				<StyledIcon
					className="pattern__icon"
					name={IconName.Robo}
					size={IconSize.XS}
					color={colors.grey70}
				/>
			)}
			{props.children}
		</StyledPatternListItem>
	);
};

export const PatternLabel: React.StatelessComponent<{}> = props => (
	<StyledPatternLabel>{props.children}</StyledPatternLabel>
);

const PatternList: React.StatelessComponent<{}> = props => (
	<StyledPatternList>{props.children}</StyledPatternList>
);

export default PatternList;
