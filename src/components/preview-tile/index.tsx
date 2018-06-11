import { Color } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PreviewTileProps {
	focused: boolean;
	id?: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface StyledPreviewTileProps {
	focused: boolean;
}

const StyledPreview = styled.section`
	width: 245px;
	text-align: center;
`;

const StyledPreviewTile = styled.div`
	position: relative;
	box-sizing: border-box;
	width: inherit;
	height: 340px;
	border: 4px solid;
	border-color: ${(props: StyledPreviewTileProps) =>
		props.focused ? Color.Blue40 : 'transparent'};
	border-radius: 6px;
	box-shadow: 0 3px 12px ${Color.BlackAlpha13};
	background-color: ${Color.White};
	overflow: hidden;
`;

const StyledContainer = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	padding: ${getSpace(SpaceSize.S)}px 0;
	background: ${Color.White};
`;

export const PreviewTile: React.StatelessComponent<PreviewTileProps> = (props): JSX.Element => (
	<StyledPreview data-id={props.id} onClick={props.onClick} onDoubleClick={props.onDoubleClick}>
		<StyledPreviewTile focused={props.focused}>
			<StyledContainer>{props.children}</StyledContainer>
		</StyledPreviewTile>
	</StyledPreview>
);
