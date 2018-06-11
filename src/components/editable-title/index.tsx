import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';

export enum EditState {
	Editable = 'Editable',
	Editing = 'Editing'
}

export interface EditableTitleProps {
	focused: boolean;
	name: string;
	nameState: EditState;
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
}

const StyledTitle = (props: StyledEditableTitleProps): JSX.Element => {
	const Strong = styled.strong`
		display: inline-block;
		width: 100%;
		margin: 0;
		font-size: 12px;
		font-weight: normal;
		text-align: center;
		cursor: ${props.editable ? 'text' : 'default'};
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		padding: 0;
	`;
	return <Strong data-title={true}>{props.children}</Strong>;
};

const StyledEditableTitle = styled.input`
	border: 0;
	display: inline-block;
	width: 100%;
	margin: 0;
	font-size: inherit;
	line-height: inherit;
	font-weight: normal;
	text-align: center;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	padding: 3px 0;

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
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
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
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				value={props.name}
			/>
		) : (
			<StyledTitle editable={props.focused}>{props.name}</StyledTitle>
		)}
	</div>
);
