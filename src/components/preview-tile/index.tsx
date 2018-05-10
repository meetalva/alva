import { colors } from '../colors';
import Input, { InputTypes } from '../input';
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
`;

const StyledTitle = (props: StyledPreviewTitleProps): JSX.Element => {
	const Strong = styled.strong`
		display: inline-block;
		width: 100%;
		margin-bottom: ${getSpace(SpaceSize.S)}px;
		font-size: 12px;
		font-weight: normal;
		text-align: center;
		cursor: ${props.editable ? 'text' : 'default'};
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	`;
	return <Strong data-title={true}>{props.children}</Strong>;
};

const StyledEditableTitle = styled(Input)`
	display: inline-block;
	width: 100%;
	font-size: 12px;
	font-weight: normal;
	text-align: center;
	margin: 0;
	margin-bottom: ${getSpace(SpaceSize.S + 3)}px;
	padding: 0;
	::placeholder {
		color: ${colors.grey60.toString()};
	}
	:hover {
		::placeholder {
			color: ${colors.grey60.toString()};
		}
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
				focused={props.focused}
				onBlur={props.onBlur}
				onChange={props.onChange}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				type={InputTypes.string}
				value={props.value}
			/>
		);
	}
}

export const PreviewTile: React.StatelessComponent<PreviewTileProps> = (props): JSX.Element => (
	<StyledPreview data-id={props.id} onClick={props.onClick} onDoubleClick={props.onDoubleClick}>
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
		<StyledPreviewTile focused={props.focused} />
	</StyledPreview>
);
