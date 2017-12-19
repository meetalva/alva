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
	padding: 0 ${getSpace(Size.L)}px;
	margin: 0;

	> div {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
`;

const StyledPatternLabel = styled.div`
	margin-bottom: ${getSpace(Size.S)}px;
	margin-top: ${getSpace(Size.L)}px;
	margin-left: ${getSpace(Size.L)}px;
	color: ${colors.grey60.toString()};
	text-transform: capitalize;

	&:first-of-type {
		margin-top: ${getSpace(Size.S)}px;
	}
`;

const StyledPatternListItem = styled.li`
	display: block;
	padding: ${getSpace(Size.S)}px;
	margin: 0 0 ${getSpace(Size.XS)}px 0;
	border-radius: 3px;
	background: ${colors.white.toString()};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 12px;
	color: ${colors.black.toString()};
	width: calc(50% - ${getSpace(Size.XS)/2}px);
	box-sizing: border-box;
	text-align: center;

	box-shadow: 0 1px 3px 0 rgba(0,0,0,0.15);
	transition: box-shadow 0.2s;

	&:hover {
		box-shadow: 0 1px 3px 0 rgba(0,0,0,0.3);
	}

	${(props: PatternListItemProps) =>
		props.draggable ? 'cursor: move;' : props.onClick ? 'cursor: pointer;' : ''};
`;

const StyledSVG = styled.svg`
	margin-right: ${getSpace(Size.L)}px;
	fill: ${colors.grey50.toString()};
`;

const StyledIcon = styled(Icon)`
	margin: 0 auto;
	display: block;
	margin-bottom: ${getSpace(Size.XS)}px;
`;

const StyledPatternListItemLabel = styled.div`
	text-align: center;
	width: 100%;
	display: block;
	text-transform: capitalize;
	color: ${colors.grey36.toString()};
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
					color={colors.grey60}
				/>
			)}
			<StyledPatternListItemLabel>{props.children}</StyledPatternListItemLabel>
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
