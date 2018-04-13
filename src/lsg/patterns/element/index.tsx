import { colors } from '../colors';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface ElementProps {
	active?: boolean;
	draggable?: boolean;
	handleClick?: React.MouseEventHandler<HTMLElement>;
	handleContextMenu?: React.MouseEventHandler<HTMLElement>;
	handleDragDrop?: React.DragEventHandler<HTMLElement>;
	handleDragDropForChild?: React.DragEventHandler<HTMLElement>;
	handleDragEnter?: React.DragEventHandler<HTMLElement>;
	handleDragEnterForChild?: React.DragEventHandler<HTMLElement>;
	handleDragLeave?: React.DragEventHandler<HTMLElement>;
	handleDragLeaveForChild?: React.DragEventHandler<HTMLElement>;
	handleDragStart?: React.DragEventHandler<HTMLElement>;
	handleIconClick?: React.MouseEventHandler<SVGSVGElement>;
	highlight?: boolean;
	highlightPlaceholder?: boolean;
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
	cursor: default;
	position: relative;
`;

const StyledElementLabel = styled.div`
	position: relative;
	display: flex;
	padding: ${getSpace(Size.XS)}px ${getSpace(Size.L)}px ${getSpace(Size.XS)}px ${getSpace(Size.XL)}px;
	cursor: pointer;
	align-items: center;
	color: ${colors.black.toString()};
	position: relative;

	&:hover {
		background ${colors.black.toString('rgb', { alpha: 0.05 })};
	}

	${(props: StyledElementLabelProps) =>
		props.active
			? `
				color: ${colors.white.toString()};
				background: ${colors.blue40.toString()};

                &:hover {
                    background: ${colors.blue40.toString()};
                }
			`
			: ''};
	${(props: StyledElementLabelProps) =>
		props.highlight
			? `
			background: ${colors.grey90.toString()};
		`
			: ''};
`;

const StyledPlaceholder = styled.div`
	position: relative;
	height: 16px;
	width: 100%;
	margin-top: -6px;
	margin-bottom: -10px;
	border-radius: 3px;

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
		z-index: 100;
	}

	&::after {
		content: '';
		display: block;
		position: absolute;
		height: 2px;
		width: 100%;
		left: 6px;
		top: 5px;
		background: ${colors.blue40.toString()};
		transform: scaleY(0);
		transition: transform 0.2s;
		z-index: 50;
	}

	${(props: StyledPlaceholder) =>
		props.highlightPlaceholder
			? `
			&:before {
				transform: scale(1);
			}
			&:after {
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
	left: 0;
	fill: ${colors.grey60.toString()};
	width: 12px;
	height: 12px;
	padding: ${getSpace(Size.XS)}px;
	transition: transform 0.2s;

	${(props: StyledIconProps) => (props.open ? 'transform: rotate(90deg)' : '')};
	${(props: StyledIconProps) => (props.active ? 'fill: white' : '')};
`;

const Element: React.StatelessComponent<ElementProps> = props => {
	const {
		children,
		title,
		active,
		open,
		highlight,
		draggable,
		handleClick,
		handleContextMenu,
		handleIconClick,
		handleDragStart,
		handleDragEnter,
		handleDragLeave,
		handleDragDrop,
		handleDragEnterForChild,
		handleDragLeaveForChild,
		handleDragDropForChild,
		highlightPlaceholder
	} = props;

	return (
		<StyledElement title={title}>
			<StyledPlaceholder
				highlightPlaceholder={highlightPlaceholder}
				onDragOver={(e: React.DragEvent<HTMLElement>) => {
					e.preventDefault();
				}}
				onDragEnter={handleDragEnterForChild}
				onDragLeave={handleDragLeaveForChild}
				onDrop={handleDragDropForChild}
			/>
			<StyledElementLabel
				onDragOver={(e: React.DragEvent<HTMLElement>) => {
					e.preventDefault();
				}}
				draggable={draggable}
				onDragStart={handleDragStart}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDrop={handleDragDrop}
				active={active}
				highlight={highlight}
				onClick={handleClick}
				onContextMenu={handleContextMenu}
			>
				{children && (
					<StyledIcon
						handleClick={handleIconClick}
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
