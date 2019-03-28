import { Color } from '../colors';
import { Copy } from '../copy';
import { Icon, IconSize, getIcon, isIcon } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PatternListItemProps {
	children: React.ReactNode;
	draggable?: boolean;
	icon: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	onDragStart?: React.DragEventHandler<HTMLElement>;
}

const StyledPatternList = styled.div`
	margin-bottom: ${getSpace(SpaceSize.XXL)}px;
`;

const StyledPatternLabel = styled(Copy)`
	margin-bottom: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px;
	user-select: none;
	text-transform: uppercase;
	font-weight: bold;
	letter-spacing: 0.1em;
`;

const StyledPatternListItem = styled.div`
	display: flex;
	background: ${Color.White};
	margin-bottom: ${getSpace(SpaceSize.XS)}px;
	padding: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px ${getSpace(SpaceSize.S)}px;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.15);
	border-radius: 3px;
	transition: box-shadow 0.2s, color 0.2s;
	color: ${Color.Grey20};
	touch-action: none;

	&:hover {
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
		color: ${Color.Black};
	}

	${(props: PatternListItemProps) =>
		props.draggable ? 'cursor: move;' : props.onClick ? 'cursor: pointer;' : ''};
`;

const IconWrapper = styled.div`
	margin-top: ${getSpace(SpaceSize.XS)}px;
	margin-right: ${getSpace(SpaceSize.XS + SpaceSize.XXS)}px;
	flex: 0 0 ${IconSize.XS}px;
`;

const StyledPatternListItemContainer = styled.div`
	padding: ${getSpace(SpaceSize.XXS)}px 0;
	overflow: hidden;
`;

const StyledPatternListItemName = styled.div`
	font-size: 15px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const StyledPatternListItemDescription = styled.div`
	padding-top: ${getSpace(SpaceSize.XXS)}px;
	font-size: 12px;
	color: ${Color.Grey50};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export interface PatternFolderViewProps {
	children: React.ReactNode;
	name: string;
}

export const PatternFolderView: React.SFC<PatternFolderViewProps> = props => (
	<PatternList>
		{props.name && <PatternLabel>{props.name}</PatternLabel>}
		{props.children}
	</PatternList>
);

export const PatternListItem: React.StatelessComponent<PatternListItemProps> = props => {
	const icon = isIcon(props.icon) ? props.icon : 'Box';

	return (
		<StyledPatternListItem
			onDoubleClick={props.onDoubleClick}
			onDragStart={props.onDragStart}
			draggable={props.draggable}
			onClick={props.onClick}
			icon={props.icon}
		>
			<IconWrapper>
				{getIcon({ icon, size: IconSize.XS, color: Color.Grey50, strokeWidth: 2 })}
			</IconWrapper>
			<StyledPatternListItemContainer>{props.children}</StyledPatternListItemContainer>
		</StyledPatternListItem>
	);
};

export interface WithChildren {
	children: React.ReactNode;
	title?: string;
}

export const PatternLabel: React.StatelessComponent<WithChildren> = props => (
	<StyledPatternLabel textColor={Color.Grey50}>{props.children}</StyledPatternLabel>
);

export const PatternItemLabel: React.StatelessComponent<WithChildren> = props => (
	<StyledPatternListItemName title={props.title}>{props.children}</StyledPatternListItemName>
);

export const PatternItemDescription: React.StatelessComponent<WithChildren> = props => (
	<StyledPatternListItemDescription title={props.title}>
		{props.children}
	</StyledPatternListItemDescription>
);

export const PatternList: React.StatelessComponent<WithChildren> = props => (
	<StyledPatternList>{props.children}</StyledPatternList>
);
