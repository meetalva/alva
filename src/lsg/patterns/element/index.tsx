import { colors } from '../colors';
import { Icon, IconName, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';
import { tag } from '../tag';

export const ElementAnchors = {
	element: 'data-element-id',
	icon: 'data-icon',
	label: 'data-element-label',
	placeholder: 'data-element-placeholder'
};

export interface ElementProps {
	active?: boolean;
	draggable?: boolean;
	dragging: boolean;
	editable?: boolean;
	highlight?: boolean;
	highlightPlaceholder?: boolean;
	id?: string;
	onChange?: React.FormEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onContextMenu?: React.MouseEventHandler<HTMLElement>;
	onDragDrop?: React.DragEventHandler<HTMLElement>;
	onDragDropForChild?: React.DragEventHandler<HTMLElement>;
	onDragEnter?: React.DragEventHandler<HTMLElement>;
	onDragEnterForChild?: React.DragEventHandler<HTMLElement>;
	onDragLeave?: React.DragEventHandler<HTMLElement>;
	onDragLeaveForChild?: React.DragEventHandler<HTMLElement>;
	onDragStart?: React.DragEventHandler<HTMLElement>;
	open?: boolean;
	title: string;
}

interface StyledElementLabelProps {
	active?: boolean;
	highlight?: boolean;
}

interface StyledIconProps {
	active?: boolean;
	id?: string;
	open?: boolean;
}

export interface StyledElementChildProps {
	open?: boolean;
}

export interface StyledPlaceholder {
	highlightPlaceholder?: boolean;
	onDragDropForChild?: React.DragEventHandler<HTMLElement>;
	onDragEnterForChild?: React.DragEventHandler<HTMLElement>;
	onDragLeaveForChild?: React.DragEventHandler<HTMLElement>;
}

const StyledElement = styled.div`
	position: relative;
	z-index: 1;
`;

const div = tag('div').omit(['active', 'highlight']);

const StyledElementLabel = styled(div)`
	position: relative;
	display: flex;
	align-items: center;
	color: ${colors.grey20.toString()};
	position: relative;
	font-size: 15px;
	line-height: 21px;
	z-index: 1;

	&::before {
		content: '';
		display: block;
		position: absolute;
		height: 100%;
		width: 240px;
		left: 0;
		top: 0;
		margin-left: -240px;
	}

	&:hover {
		background ${colors.black.toString('rgb', { alpha: 0.05 })};

		&::before {
			background: ${colors.black.toString('rgb', { alpha: 0.05 })};
		}
	}

	${(props: StyledElementLabelProps) =>
		props.active
			? `
				color: ${colors.blue.toString()};
				background: ${colors.blue80.toString()};

				&::before {
					background: ${colors.blue80.toString()};
				}

				&:hover {
					background: ${colors.blue80.toString()};

					&::before {
						background: ${colors.blue80.toString()};
					}
				}
			`
			: ''};
	${(props: StyledElementLabelProps) =>
		props.highlight
			? `
			background: ${colors.grey90.toString()};

			&::before {
				background: ${colors.grey90.toString()};
			}
		`
			: ''};
`;

const placeholderDiv = tag('div').omit(['highlightPlaceholder']);
const StyledPlaceholder = styled(placeholderDiv)`
	position: relative;
	height: ${getSpace(SpaceSize.S)}px;
	width: 100%;
	margin-top: -${getSpace(SpaceSize.XS)}px;
	margin-bottom: -${getSpace(SpaceSize.XS)}px;
	z-index: 10;

	&::before {
		content: '';
		display: block;
		position: absolute;
		height: 6px;
		width: 6px;
		left: 0;
		top: 3px;
		border-radius: 3px;
		background: ${colors.blue40.toString()};
		transform: scale(0);
		transition: transform 0.2s;
		z-index: 20;
	}

	&::after {
		content: '';
		display: block;
		position: absolute;
		height: 2px;
		width: calc(100% - 6px);
		left: ${getSpace(SpaceSize.XS)};
		top: 5px;
		background: ${colors.blue40.toString()};
		transform: scaleY(0);
		transition: transform 0.2s;
		z-index: 20;
	}

	${(props: StyledPlaceholder) =>
		props.highlightPlaceholder
			? `
			&::before {
				transform: scale(1);
			}

			&::after {
				transform: scaleY(1);
			}
		`
			: ''};
`;

const elementDiv = tag('div').omit(['open']);
const StyledElementChild = styled(elementDiv)`
	flex-basis: 100%;
	padding-left: ${getSpace(SpaceSize.L)}px;
	${(props: StyledElementChildProps) => (props.open ? 'display: block;' : 'display: none;')};
`;

const StyledIcon = styled(Icon)`
	position: absolute;
	left: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px;
	fill: ${colors.grey60.toString()};
	width: ${getSpace(SpaceSize.S)}px;
	height: ${getSpace(SpaceSize.S)}px;
	padding: ${getSpace(SpaceSize.XS)}px;
	transition: transform 0.2s;

	${(props: StyledIconProps) => (props.open ? 'transform: rotate(90deg)' : '')};
	${(props: StyledIconProps) => (props.active ? `fill: ${colors.blue20.toString()}` : '')};
`;

const LabelContent = styled.div`
	box-sizing: border-box;
	margin-left: ${getSpace(SpaceSize.XXL) - 3}px;
	overflow: hidden;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.L)}px ${getSpace(SpaceSize.XS)}px 3px;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
`;

const StyledSeamlessInput = styled.input`
	box-sizing: border-box;
	width: 100%;
	color: ${colors.grey20.toString()};
	font-size: inherit;
	line-height: inherit;
	padding: ${getSpace(SpaceSize.XS - 1)}px ${getSpace(SpaceSize.L - 1)}px
		${getSpace(SpaceSize.XS - 1)}px 3px;
	margin: 1px 1px 1px ${getSpace(SpaceSize.XXL - 3)}px;
	border: 0;
	&:focus {
		outline: none;
	}
`;

interface SeamlessInputProps {
	autoFocus?: boolean;
	autoSelect?: boolean;
	onChange?: React.FormEventHandler<HTMLInputElement>;
	value: string;
}

class SeamlessInput extends React.Component<SeamlessInputProps> {
	private ref: HTMLInputElement | null = null;

	public componentDidMount(): void {
		if (this.ref !== null && this.props.autoSelect && this.props.autoFocus) {
			const ref = this.ref as HTMLInputElement;
			ref.setSelectionRange(0, this.props.value.length);
		}
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<StyledSeamlessInput
				autoFocus={props.autoFocus}
				innerRef={ref => (this.ref = ref)}
				value={props.value}
				onChange={props.onChange}
			/>
		);
	}
}

const Element: React.StatelessComponent<ElementProps> = props => (
	<StyledElement
		{...{ [ElementAnchors.element]: props.id }}
		draggable={props.draggable}
		onClick={props.onClick}
	>
		{props.dragging && (
			<StyledPlaceholder
				{...{ [ElementAnchors.placeholder]: true }}
				highlightPlaceholder={props.highlightPlaceholder}
				onDragOver={(e: React.DragEvent<HTMLElement>) => {
					e.preventDefault();
				}}
				onDragEnter={props.onDragEnterForChild}
				onDragLeave={props.onDragLeaveForChild}
				onDrop={props.onDragDropForChild}
			/>
		)}
		<StyledElementLabel
			active={props.active}
			highlight={props.highlight}
			onContextMenu={props.onContextMenu}
			onDragOver={(e: React.DragEvent<HTMLElement>) => {
				e.preventDefault();
			}}
			onDragEnter={props.onDragEnter}
			onDragLeave={props.onDragLeave}
			onDrop={props.onDragDrop}
		>
			{Array.isArray(props.children) &&
				props.children.length > 0 && (
					<StyledIcon
						dataIcon={props.id}
						name={IconName.ArrowFillRight}
						size={IconSize.XXS}
						color={colors.grey60}
						open={props.open}
						active={props.active}
					/>
				)}
			{props.editable ? (
				<SeamlessInput
					{...{ [ElementAnchors.label]: true }}
					value={props.title}
					onChange={props.onChange}
					autoFocus
					autoSelect
				/>
			) : (
				<LabelContent {...{ [ElementAnchors.label]: true }}>{props.title}</LabelContent>
			)}
		</StyledElementLabel>
		{props.children && (
			<StyledElementChild open={props.open}>{props.children}</StyledElementChild>
		)}
	</StyledElement>
);

export default Element;
