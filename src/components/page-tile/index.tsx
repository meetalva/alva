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
	id?: string;
	name: string;
	nameState: EditState;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface EditableTitleProps {
	autoFocus: boolean;
	autoSelect: boolean;
	focused: boolean;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
	value: string;
}

interface StyledPageTileProps {
	focused: boolean;
}

interface StyledPageTitleProps {
	children: React.ReactNode;
	editable: boolean;
}

const StyledPageTile = styled.div`
	position: relative;
	box-sizing: border-box;
	height: 90px;
	width: 100%;
	border: 4px solid;
	border-color: ${(props: StyledPageTileProps) => (props.focused ? Color.Blue40 : 'transparent')};
	border-radius: 6px;
	box-shadow: 0 3px 12px ${Color.BlackAlpha13};
	background-color: ${Color.White};
	overflow: hidden;
	margin: ${getSpace(SpaceSize.S)}px;
`;

const StyledTitle = (props: StyledPageTitleProps): JSX.Element => {
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

	&:focus {
		outline: none;
	}
`;

const StyledContainer = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	padding: ${getSpace(SpaceSize.S)}px 0;
	background: ${Color.White};
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
		focused={props.focused}
		onClick={props.onClick}
		onDoubleClick={props.onDoubleClick}
	>
		<StyledContainer>
			{props.nameState === EditState.Editing ? (
				<EditableTitle
					autoFocus
					autoSelect
					data-title={true}
					focused={props.focused}
					onBlur={props.onBlur}
					onChange={props.onChange}
					onFocus={props.onFocus}
					onKeyDown={props.onKeyDown}
					value={props.name}
				/>
			) : (
				<StyledTitle editable={props.focused}>{props.name}</StyledTitle>
			)}
		</StyledContainer>
	</StyledPageTile>
);
