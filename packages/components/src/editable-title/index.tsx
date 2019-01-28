import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';

export enum EditableTitleState {
	Editable = 'Editable',
	Editing = 'Editing',
	Neutral = 'Neutral'
}

export interface EditableTitleProps {
	name: string;
	state: EditableTitleState;
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
	onClick?: React.MouseEventHandler<HTMLElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface StyledEditableTitleProps {
	children?: React.ReactNode;
	editable: boolean;
	focused?: boolean;
}

const StyledTitle =
	styled.div <
	StyledEditableTitleProps >
	`
	box-sizing: border-box;
	border: 0;
	padding: 0;
	overflow: hidden;
	color: inherit;
	text-align: inherit;
	font-size: inherit;
	font-weight: normal;
	cursor: ${props => (props.editable ? 'text' : 'default')};
	white-space: nowrap;
	text-overflow: ellipsis;
	line-height: inherit;
`;

const StyledEditableTitle = styled.input`
	box-sizing: border-box;
	border: 0;
	padding: 0;
	overflow: hidden;
	color: inherit;
	text-align: inherit;
	font-size: inherit;
	font-weight: normal;
	line-height: inherit;
	cursor: text;
	&:focus {
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
	<React.Fragment>
		{props.state === EditableTitleState.Editing ? (
			<EditableInput
				autoFocus
				autoSelect
				data-title={true}
				onBlur={props.onBlur}
				onClick={props.onClick}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				value={props.name}
			/>
		) : (
			<StyledTitle
				data-title={true}
				editable={props.state === EditableTitleState.Editable}
				onClick={props.onClick}
			>
				{props.name}
			</StyledTitle>
		)}
	</React.Fragment>
);
