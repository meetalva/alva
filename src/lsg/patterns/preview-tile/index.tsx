import { colors } from '../colors';
import Input, { InputTypes } from '../input';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface PreviewTileProps {
	editable: boolean;
	focused: boolean;
	id?: string;
	name: string;
	named: boolean;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
	value: string;
}

interface StyledPreviewTileProps {
	focused: boolean;
}

interface StyledPreviewTitle {
	named: boolean;
}

const StyledPreview = styled.section`
	width: 245px;
	text-align: center;
`;

const StyledPreviewTile = styled.div`
	box-sizing: border-box;
	width: inherit;
	height: 340px;
	border: 4px solid;
	border-color: ${(props: StyledPreviewTileProps) =>
		props.focused ? colors.blue40.toString() : 'transparent'};
	border-radius: 5px;
	box-shadow: 0 3px 12px ${colors.blackAlpha13.toString()};
	background-color: ${colors.white.toString()};
	cursor: pointer;
`;

const StyledTitle = styled.strong`
	display: inline-block;
	width: 100%;
	margin-bottom: ${getSpace(Size.S)}px;
	font-size: 12px;
	font-weight: normal;
	color: ${(props: StyledPreviewTitle) =>
		props.named ? colors.black.toString() : colors.grey80.toString()}
	cursor: pointer;
`;

const StyledEditableTitle = styled(Input)`
	display: inline-block;
	padding: 0;
	margin: 0 0 ${getSpace(Size.S)}px 0;
	font-size: 12px;
	font-weight: normal;
	text-align: center;
	::placeholder {
		color: ${colors.grey60.toString()};
	}
	:hover {
		::placeholder {
			color: ${colors.grey60.toString()};
		}
	}
`;

export const PreviewTile: React.StatelessComponent<PreviewTileProps> = (props): JSX.Element => (
	<StyledPreview data-id={props.id} onClick={props.onClick} onDoubleClick={props.onDoubleClick}>
		{props.editable ? (
			<StyledEditableTitle
				focused={props.focused}
				handleBlur={props.onBlur}
				handleChange={props.onChange}
				handleKeyDown={props.onKeyDown}
				type={InputTypes.string}
				value={props.value}
			>
				{props.value}
			</StyledEditableTitle>
		) : (
			<StyledTitle named={props.named}>{props.name}</StyledTitle>
		)}
		<StyledPreviewTile focused={props.focused} />
	</StyledPreview>
);
