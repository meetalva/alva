import { Color } from '../colors';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export enum EditState {
	Editable = 'Editable',
	Editing = 'Editing'
}

export interface PreviewTileProps {
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

interface StyledPreviewTileProps {
	focused: boolean;
}

interface StyledPreviewTitleProps {
	children: React.ReactNode;
	editable: boolean;
}

const StyledPreview = styled.section`
	width: 245px;
	text-align: center;
	user-select: none;
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

const StyledTitle = (props: StyledPreviewTitleProps): JSX.Element => {
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

export const PreviewTile: React.StatelessComponent<PreviewTileProps> = (props): JSX.Element => (
	<StyledPreview data-id={props.id} onClick={props.onClick} onDoubleClick={props.onDoubleClick}>
		<StyledPreviewTile focused={props.focused}>
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
		</StyledPreviewTile>
	</StyledPreview>
);
