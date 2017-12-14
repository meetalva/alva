import { colors } from '../colors';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface ElementProps {
	active?: boolean;
	open?: boolean;
	highlight?: boolean;
	highlightPlaceholder?: boolean;
	title: string;

	handleClick?: React.MouseEventHandler<HTMLElement>;
	handleIconClick?: React.MouseEventHandler<SVGSVGElement>;
	handleDragEnter?: React.DragEventHandler<HTMLElement>;
	handleDragLeave?: React.DragEventHandler<HTMLElement>;
	handleDragDrop?: React.DragEventHandler<HTMLElement>;
	handleDragEnterForChild?: React.DragEventHandler<HTMLElement>;
	handleDragLeaveForChild?: React.DragEventHandler<HTMLElement>;
	handleDragDropForChild?: React.DragEventHandler<HTMLElement>;
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
	highlightPlaceholder?: boolean;
	handleDragEnterForChild?: React.DragEventHandler<HTMLElement>;
	handleDragLeaveForChild?: React.DragEventHandler<HTMLElement>;
	handleDragDropForChild?: React.DragEventHandler<HTMLElement>;
}

const StyledElement = styled.div`
	cursor: default;
	position: relative;
`;

const StyledElementLabel = styled.div`
	position: relative;
	display: flex;
	padding: 9px ${getSpace(Size.L)}px 9px ${getSpace(Size.XL)}px;
	border-radius: 3px;
	cursor: pointer;
	align-items: center;
	color: ${colors.black.toString()};
	position: relative;
	text-transform: capitalize;

	&:hover {
		background: ${colors.grey90.toString()};
	}


	${(props: StyledElementLabelProps) =>
		props.active
			? `
				color: ${colors.white.toString()};
				background: ${colors.blue.toString()};

                &:hover {
                    background: ${colors.blue.toString()};
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
	height: 10px;
	width: 100%;
	margin-top: -5px;
	margin-bottom: -5px;
	border-radius: 3px;

	&::after {
		content: '';
		display: block;
		position: absolute;
		height: 100%;
		width: 100%;
		left: 0;
		top: 0;
		background: ${colors.grey90.toString()};
		transform: scaleY(0);
		transition: transform 0.2s;
	}

	${(props: StyledPlaceholder) =>
		props.highlightPlaceholder
			? `
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
	left: ${getSpace(Size.XS)}px;
	fill: ${colors.grey70.toString()};
	width: 12px;
	height: 12px;
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
		handleClick,
		handleIconClick,
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
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDrop={handleDragDrop}
				active={active}
				highlight={highlight}
				onClick={handleClick}
			>
				{children && (
					<StyledIcon
						handleClick={handleIconClick}
						name={IconName.ArrowFill}
						size={IconSize.XXS}
						color={colors.grey70}
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
