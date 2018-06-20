import { Color } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PageTileProps {
	focused: boolean;
	highlighted: boolean;
	id?: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface StyledPageTileProps {
	highlighted: boolean;
	focused: boolean;
}

const BORDER_COLOR = (props: StyledPageTileProps) => (props.focused ? Color.Blue20 : Color.Blue60);

const StyledPageTile = styled.div`
	position: relative;
	box-sizing: border-box;
	height: 60px;
	width: 100%;
	border: 3px solid;
	border-color: ${(props: StyledPageTileProps) =>
		props.highlighted ? BORDER_COLOR : 'transparent'};
	border-radius: 6px;
	box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.15);
	background-color: ${Color.White};
	overflow: hidden;
	margin: ${getSpace(SpaceSize.S)}px;
	margin-bottom: 0;
	font-size: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: box-shadow 0.2s, color 0.2s;
	color: ${Color.Grey20};

	&:hover {
		box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.3);
		color: ${Color.Black};
	}
`;

export const PageTile: React.StatelessComponent<PageTileProps> = (props): JSX.Element => (
	<StyledPageTile
		draggable
		focused={props.focused}
		highlighted={props.highlighted}
		data-id={props.id}
		onClick={props.onClick}
		onDoubleClick={props.onDoubleClick}
	>
		{props.children}
	</StyledPageTile>
);
