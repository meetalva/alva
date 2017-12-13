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
`;

const StyledElementLabel = styled.div`
	position: relative;
	display: flex;
	min-height: 20px;
	padding: 0 ${getSpace(Size.L)}px;
	border-radius: 3px;
	cursor: pointer;
	align-items: center;
	color: ${colors.black.toString()};
	${(props: StyledElementLabelProps) =>
		props.active
			? `
				color: ${colors.white.toString()};
				background: ${colors.blue.toString()};
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
	height: 10px;
	border-radius: 3px;
	${(props: StyledPlaceholder) =>
		props.highlightPlaceholder
			? `
			background: ${colors.grey90.toString()};
		`
			: ''};
`;

const StyledElementChild = styled.div`
	flex-basis: 100%;
	padding-left: ${getSpace(Size.S)}px;
	${(props: StyledElementChildProps) => (props.open ? 'display: block;' : 'display: none;')};
`;

const StyledIcon = styled(Icon)`
	position: absolute;
	left: ${getSpace(Size.L) / 2}px;
	fill: ${colors.grey70.toString()};
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
						name={IconName.Robo}
						size={IconSize.XXS}
						color={colors.grey70}
					/>
				)}
				{title}
			</StyledElementLabel>
			{children && <StyledElementChild open={open}>{children}</StyledElementChild>}
		</StyledElement>
	);
};

export default Element;
