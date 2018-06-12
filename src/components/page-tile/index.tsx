import { Color } from '../colors';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export enum EditState {
	Editable = 'Editable',
	Editing = 'Editing'
}

export interface PageTileProps {
	focused: boolean;
	highlighted: boolean;
	id?: string;
	name: string;
	nameState: EditState;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface EditableTitleProps {
	autoFocus: boolean;
	autoSelect: boolean;
	highlighted: boolean;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
	value: string;
}

interface StyledPageTileProps {
	highlighted: boolean;
	focused: boolean;
}

interface StyledPageTitleProps {
	children: React.ReactNode;
	editable: boolean;
}

const BORDER_COLOR = (props: StyledPageTileProps) => (props.focused ? Color.Blue20 : Color.Blue60);

const StyledPageTile = styled.div`
	position: relative;
	box-sizing: border-box;
	height: 72px;
	width: 100%;
	border: 3px solid;
	border-color: ${(props: StyledPageTileProps) =>
		props.highlighted ? BORDER_COLOR : 'transparent'};
	border-radius: 6px;
	box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.15);
	background-color: ${Color.White};
	overflow: hidden;
	margin: ${getSpace(SpaceSize.S)}px;
	margin-top: 0;
	font-size: 15px;
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

const StyledTitle = (props: StyledPageTitleProps): JSX.Element => {
	const Strong = styled.strong`
		display: inline-block;
		width: 100%;
		margin: 0;
		font-size: inherit;
		font-weight: normal;
		text-align: center;
		cursor: ${props.editable ? 'text' : 'default'};
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		padding: 0;
		color: inherit;
		user-select: none;
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

	&:focus {
		outline: none;
	}
`;

class EditableTitle extends React.Component<EditableTitleProps> {
	public componentDidMount(): void {
		const node = ReactDOM.findDOMNode(this);

		if (!node) {
			return;
		}

		const element = node as HTMLInputElement;

		if (this.props.autoFocus) {
			element.focus();
		}

		if (this.props.autoSelect) {
			element.setSelectionRange(0, this.props.value.length);
		}
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<StyledEditableTitle
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				value={props.value}
			/>
		);
	}
}

export const PageTile: React.StatelessComponent<PageTileProps> = (props): JSX.Element => (
	<StyledPageTile
		data-id={props.id}
		highlighted={props.highlighted}
		focused={props.focused}
		onClick={props.onClick}
	>
		{props.nameState === EditState.Editing ? (
			<EditableTitle
				autoFocus
				autoSelect
				data-title={true}
				highlighted={props.highlighted}
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				value={props.name}
			/>
		) : (
			<StyledTitle editable={props.highlighted}>{props.name}</StyledTitle>
		)}
	</StyledPageTile>
);
