import { colors } from '../colors';
import { Icon, IconName, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export const PatternAnchor = {
	icon: 'data-icon'
};

export interface PatternListItemProps {
	draggable?: boolean;
	icon?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	onDragStart?: React.DragEventHandler<HTMLElement>;
}

const StyledPatternList = styled.div`
	margin-bottom: 30px;
`;

const StyledPatternLabel = styled.div`
	font-size: 12px;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	margin-bottom: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px;
	font-weight: 700;
	color: ${colors.grey50.toString()};
	user-select: none;
	cursor: default;
`;

const StyledPatternListItem = styled.div`
	display: flex;
	background: ${colors.white.toString()};
	margin-bottom: ${getSpace(SpaceSize.XS)}px;
	padding: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px ${getSpace(SpaceSize.S)}px;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.15);
	border-radius: 3px;
	transition: box-shadow 0.2s, color 0.2s;
	align-items: center;
	color: ${colors.grey20.toString()};

	&:hover {
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
		color: ${colors.black.toString()};
	}

	${(props: PatternListItemProps) =>
		props.draggable ? 'cursor: move;' : props.onClick ? 'cursor: pointer;' : ''};
`;

const StyledIcon = styled(Icon)`
	margin-right: 6px;
`;

const StyledPatternListItemLabel = styled.div`
	font-size: 15px;
`;

export interface PatternFolderViewProps {
	name: string;
}

export const PatternFolderView: React.SFC<PatternFolderViewProps> = props => (
	<PatternList>
		{props.name && <PatternLabel>{props.name}</PatternLabel>}
		{props.children}
	</PatternList>
);

export const PatternListItem: React.StatelessComponent<PatternListItemProps> = props => {
	const { draggable, onDragStart, icon, onClick } = props;
	return (
		<StyledPatternListItem
			onDoubleClick={props.onDoubleClick}
			onDragStart={onDragStart}
			draggable={draggable}
			onClick={onClick}
		>
			{icon ? (
				<img {...{ [PatternAnchor.icon]: 'true' }} src={icon} />
			) : (
				<StyledIcon
					dataIcon="true"
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
