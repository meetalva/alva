import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';

import { Color } from '../colors';
import { CopySize } from '../copy';
import { getSpace, SpaceSize } from '../space';

export enum EditState {
	Editable = 'Editable',
	Editing = 'Editing'
}

export interface EditableTitleProps {
	fontSize?: CopySize;
	focused: boolean;
	name: string;
	nameState: EditState;
	secondary?: boolean;
	value: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface EditableInputProps {
	autoFocus: boolean;
	autoSelect: boolean;
	fontSize?: CopySize;
	secondary?: boolean;
	value: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface StyledEditableTitleProps {
	children: React.ReactNode;
	editable: boolean;
	fontSize?: CopySize;
	focused?: boolean;
	secondary?: boolean;
}

interface StyledInputProps {
	fontSize?: CopySize;
	secondary?: boolean;
}

const StyledTitle = (props: StyledEditableTitleProps): JSX.Element => {
	const Strong = styled.strong`
		box-sizing: border-box;
		display: inline-block;
		width: ${props.secondary ? '130px' : '100%'};
		padding: 0;
		margin: ${props.secondary ? `0 ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXS)}px` : 0};
		font-size: ${props.fontSize ? `${props.fontSize}px` : `${CopySize.S}px`};
		color: ${props.secondary ? Color.Grey36 : Color.Black};
		font-weight: normal;
		text-align: center;
		cursor: ${props.editable ? 'text' : 'default'};
		overflow: ${props.secondary ? 'none' : 'hidden'};
		white-space: nowrap;
		text-overflow: ellipsis;
	`;
	return <Strong data-title={true}>{props.children}</Strong>;
};

const StyledEditableTitle = styled.input`
	box-sizing: border-box;
	display: inline-block;
	width: ${(props: StyledInputProps) => (props.secondary ? '130px' : '100%')};
	border: 0;
	padding: 0;
	margin: ${(props: StyledInputProps) =>
		props.secondary ? `0 ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXS)}px` : '3px 0px'};
	font-size: ${(props: StyledInputProps) =>
		props.fontSize ? `${props.fontSize}px` : `${CopySize.S}px`};
	text-align: center;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	outline-offset: 0;

	:focus {
		outline: none;
	}
`;

class EditableInput extends React.Component<EditableInputProps> {
	public componentDidMount(): void {
		const node = ReactDOM.findDOMNode(this);
		if (!node) {
			return;
		}
		const element = node as HTMLInputElement;

		if (this.props.autoSelect) {
			element.setSelectionRange(0, this.props.value.length);
		}
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<StyledEditableTitle
				autoFocus
				data-title={true}
				fontSize={props.fontSize}
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				secondary={props.secondary}
				value={props.value}
			/>
		);
	}
}

export const EditableTitle: React.SFC<EditableTitleProps> = (props): JSX.Element => (
	<div onClick={props.onClick}>
		{props.nameState === EditState.Editing ? (
			<EditableInput
				autoFocus
				autoSelect
				data-title={true}
				fontSize={props.fontSize}
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				secondary={props.secondary}
				value={props.name}
			/>
		) : (
			<StyledTitle
				editable={props.focused}
				fontSize={props.fontSize}
				secondary={props.secondary}
			>
				{props.name}
			</StyledTitle>
		)}
	</div>
);
