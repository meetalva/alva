import { colors } from '../colors';
import { Icon, IconName, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PatternListItemProps {
	draggable?: boolean;
	icon?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDragStart?: React.DragEventHandler<HTMLElement>;
}

const StyledPatternList = styled.div`
	box-sizing: border-box;
	display: flex;
	flex-wrap: wrap;
	flex-basis: 100%;
	justify-content: space-between;
	margin: 0;
`;

const StyledPatternLabel = styled.div`
	flex-basis: 100%;
	margin-top: ${getSpace(SpaceSize.L)}px;
	margin-bottom: ${getSpace(SpaceSize.S)}px;
	color: ${colors.grey60.toString()};
	text-transform: capitalize;

	&:first-of-type {
		margin-top: ${getSpace(SpaceSize.S)}px;
	}
`;

const StyledPatternListItem = styled.div`
	box-sizing: border-box;
	width: calc(50% - ${getSpace(SpaceSize.XS) / 2}px);
	padding: ${getSpace(SpaceSize.S)}px;
	margin-bottom: ${getSpace(SpaceSize.XS)}px;
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

	${(props: PatternListItemProps) =>
		props.draggable ? 'cursor: move;' : props.onClick ? 'cursor: pointer;' : ''};
`;

const StyledIcon = styled(Icon)`
	display: block;
	margin: 0 auto ${getSpace(SpaceSize.XS)}px;
`;

const StyledImg = styled.img`
	display: block;
	width: 18px;
	height: 18px;
	margin: 0 auto ${getSpace(SpaceSize.XS)}px;
	user-drag: none;
	user-select: none;
`;

const StyledPatternListItemLabel = styled.div`
	text-align: center;
	color: ${colors.grey36.toString()};
	user-select: none;
`;

export const PatternListItem: React.StatelessComponent<PatternListItemProps> = props => {
	const { draggable, onDragStart, icon, onClick } = props;
	return (
		<StyledPatternListItem onDragStart={onDragStart} draggable={draggable} onClick={onClick}>
			{icon ? (
				<StyledImg className="pattern__icon" src={icon} />
			) : (
				<StyledIcon
					className="pattern__icon"
					name={IconName.Pattern}
					size={IconSize.S}
					color={colors.grey50}
				/>
			)}
			<StyledPatternListItemLabel>{props.children}</StyledPatternListItemLabel>
		</StyledPatternListItem>
	);
};

export const PatternLabel: React.StatelessComponent = props => (
	<StyledPatternLabel>{props.children}</StyledPatternLabel>
);

const PatternList: React.StatelessComponent = props => (
	<StyledPatternList>{props.children}</StyledPatternList>
);

export default PatternList;
