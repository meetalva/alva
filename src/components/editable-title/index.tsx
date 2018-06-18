import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';

import { Color } from '../colors';
import { CopySize } from '../copy';
import { getSpace, SpaceSize } from '../space';

export enum EditableTitleState {
	Editable = 'Editable',
	Editing = 'Editing'
}

export enum EditableTitleType {
	Primary,
	Secondary
}

export interface EditableTitleProps {
	category: EditableTitleType;
	focused: boolean;
	name: string;
	nameState: EditableTitleState;
	value: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface EditableInputProps {
	category: EditableTitleType;
	autoFocus: boolean;
	autoSelect: boolean;
	value: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface StyledEditableTitleProps {
	children: React.ReactNode;
	editable: boolean;
	focused?: boolean;
	category: EditableTitleType;
}

interface StyledInputProps {
	category: EditableTitleType;
}

const categorizedTitleStyles = (props: StyledEditableTitleProps) => {
	switch (props.category) {
		case EditableTitleType.Secondary:
			return `
			width: 130px;
			margin: 0 ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXS)}px;
			overflow: none;
			font-size: ${CopySize.M}px;
			color: ${Color.Grey36};
		`;
		case EditableTitleType.Primary:
		default:
			return `
			width: 100%
			margin: 0;
			overflow: hidden;
			font-size: ${CopySize.S}px;
			color: ${Color.Black};
		`;
	}
};

const StyledTitle = styled.strong`
	box-sizing: border-box;
	display: inline-block;
	padding: 0;
	font-weight: normal;
	text-align: center;
	cursor: ${(props: StyledEditableTitleProps) => (props.editable ? 'text' : 'default')};
	white-space: nowrap;
	text-overflow: ellipsis;

	${categorizedTitleStyles};
`;

const categorizedEditableTitleStyles = (props: StyledInputProps) => {
	switch (props.category) {
		case EditableTitleType.Secondary:
			return `
				width: 130px;
				margin: 0 ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXS)}px;
				font-size: ${CopySize.M}px;
		`;
		case EditableTitleType.Primary:
		default:
			return `
				width: 100%;
				margin: 3px 0px;
				font-size: ${CopySize.S}px;
		`;
	}
};

const StyledEditableTitle = styled.input`
	box-sizing: border-box;
	display: inline-block;
	border: 0;
	padding: 0;
	text-align: center;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	outline-offset: 0;

	${categorizedEditableTitleStyles} :focus {
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
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				category={props.category}
				value={props.value}
			/>
		);
	}
}

export const EditableTitle: React.SFC<EditableTitleProps> = (props): JSX.Element => (
	<div onClick={props.onClick}>
		{props.nameState === EditableTitleState.Editing ? (
			<EditableInput
				autoFocus
				autoSelect
				category={props.category}
				data-title={true}
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				value={props.name}
			/>
		) : (
			<StyledTitle category={props.category} data-title={true} editable={props.focused}>
				{props.name}
			</StyledTitle>
		)}
	</div>
);
