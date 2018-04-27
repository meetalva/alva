import { colors } from '../colors';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';
import { tag } from '../tag';

export interface ElementProps {
	active?: boolean;
	draggable?: boolean;
	dragging: boolean;
	highlight?: boolean;
	highlightPlaceholder?: boolean;
	id?: string;
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
	handleDragDropForChild?: React.DragEventHandler<HTMLElement>;
	handleDragEnterForChild?: React.DragEventHandler<HTMLElement>;
	handleDragLeaveForChild?: React.DragEventHandler<HTMLElement>;
	highlightPlaceholder?: boolean;
}

const StyledElement = styled.div`
	position: relative;
	z-index: 1;
`;

const div = tag('div').omit(['active', 'highlight']);

const StyledElementLabel = styled(div)`
	position: relative;
	display: flex;
	padding: ${getSpace(Size.XS)}px ${getSpace(Size.L)}px ${getSpace(Size.XS)}px ${getSpace(
	Size.XXL
)}px;
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
	height: ${getSpace(Size.S)};
	width: 100%;
	margin-top: -${getSpace(Size.XS)};
	margin-bottom: -${getSpace(Size.XS)};
	z-index: 10;

	&::before {
		content: '';
		display: block;
		position: absolute;
		height: 6px;
		width: 6px;
		left: 6px;
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
		left: ${getSpace(Size.XS)};
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
	padding-left: ${getSpace(Size.L)}px;
	${(props: StyledElementChildProps) => (props.open ? 'display: block;' : 'display: none;')};
`;

const StyledIcon = styled(Icon)`
	position: absolute;
	left: ${getSpace(Size.XS) + getSpace(Size.XXS)}px;
	fill: ${colors.grey60.toString()};
	width: ${getSpace(Size.S)}px;
	height: ${getSpace(Size.S)}px;
	padding: ${getSpace(Size.XS)}px;
	transition: transform 0.2s;

	${(props: StyledIconProps) => (props.open ? 'transform: rotate(90deg)' : '')};
	${(props: StyledIconProps) => (props.active ? `fill: ${colors.blue20.toString()}` : '')};
`;

const Element: React.StatelessComponent<ElementProps> = props => (
	<StyledElement
		draggable={props.draggable}
		data-id={props.id}
		onClick={props.onClick}
		onMouseOver={e => e.stopPropagation()}
		onMouseLeave={e => e.stopPropagation()}
	>
		{props.dragging && (
			<StyledPlaceholder
				data-element-placeholder
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
			data-element-label
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
						name={IconName.ArrowFill}
						size={IconSize.XXS}
						color={colors.grey60}
						open={props.open}
						active={props.active}
					/>
				)}
			<div>{props.title}</div>
		</StyledElementLabel>
		{props.children && (
			<StyledElementChild open={props.open}>{props.children}</StyledElementChild>
		)}
	</StyledElement>
);

export default Element;
