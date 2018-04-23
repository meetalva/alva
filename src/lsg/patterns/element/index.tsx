import { colors } from '../colors';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

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

const StyledElementLabel = styled.div`
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

const StyledPlaceholder = styled.div`
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

const StyledElementChild = styled.div`
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
	${(props: StyledIconProps) => (props.active ? 'fill: #0070D6' : '')};
`;

const Element: React.StatelessComponent<ElementProps> = props => {
	const {
		children,
		title,
		active,
		open,
		highlight,
		draggable,
		dragging,
		onClick,
		onContextMenu,
		onDragEnterForChild,
		onDragLeaveForChild,
		onDragDropForChild,
		highlightPlaceholder
	} = props;

	return (
		<StyledElement data-id={props.id} onClick={onClick}>
			{dragging && (
				<StyledPlaceholder
					data-element-placeholder
					highlightPlaceholder={highlightPlaceholder}
					onDragOver={(e: React.DragEvent<HTMLElement>) => {
						e.preventDefault();
					}}
					onDragEnter={onDragEnterForChild}
					onDragLeave={onDragLeaveForChild}
					onDrop={onDragDropForChild}
				/>
			)}
			<StyledElementLabel
				data-element-label
				draggable={draggable}
				active={active}
				highlight={highlight}
				onContextMenu={onContextMenu}
			>
				{Array.isArray(children) &&
					children.length > 0 && (
						<StyledIcon
							data-element-icon
							name={IconName.ArrowFill}
							size={IconSize.XXS}
							color={colors.grey60}
							open={open}
							active={active}
						/>
					)}
				{title}
			</StyledElementLabel>
			{children && <StyledElementChild open={open}>{children}</StyledElementChild>}
		</StyledElement>
	);
};

export default Element;
