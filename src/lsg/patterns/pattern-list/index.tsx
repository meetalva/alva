import { colors } from '../colors';
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

const StyledPatternList = styled.div`
	box-sizing: border-box;
	display: flex;
	flex-wrap: wrap;
	flex-basis: 100%;
	margin: 0;
`;

const StyledPatternLabel = styled.div`
	flex-basis: 100%;
	margin-top: ${getSpace(Size.L)}px;
	margin-bottom: ${getSpace(Size.S)}px;
	color: ${colors.grey60.toString()};

	&:first-of-type {
		margin-top: ${getSpace(Size.S)}px;
	}
`;

const StyledPatternListItem = styled.div`
	box-sizing: border-box;
	width: calc(50% - ${getSpace(Size.XS) / 2}px);
	padding: ${getSpace(Size.S)}px;
	margin: 0 ${getSpace(Size.XS)}px ${getSpace(Size.XS)}px 0;
	border-radius: 3px;
	background: ${colors.white.toString()};
	font-size: 12px;
	color: ${colors.black.toString()};
	text-align: center;

	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.15);
	transition: box-shadow 0.2s;

	&:hover {
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
	}

	:nth-child(2n) {
		margin-right: 0;
	}

	${(props: PatternListItemProps) =>
		props.draggable ? 'cursor: move;' : props.onClick ? 'cursor: pointer;' : ''};
`;

const StyledIcon = styled(Icon)`
	display: block;
	margin: 0 auto ${getSpace(Size.XS)}px;
`;

const StyledImg = styled.img`
	display: block;
	width: 18px;
	height: 18px;
	margin: 0 auto ${getSpace(Size.XS)}px;
`;

const StyledPatternListItemLabel = styled.div`
	text-align: center;
	color: ${colors.grey36.toString()};
`;

export const PatternListItem: React.StatelessComponent<PatternListItemProps> = props => {
	const { draggable, handleDragStart, icon, onClick } = props;
	return (
		<StyledPatternListItem onDragStart={handleDragStart} draggable={draggable} onClick={onClick}>
			{icon ? (
				<StyledImg className="pattern__icon" src={icon} />
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
