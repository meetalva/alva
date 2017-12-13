import { colors } from '../colors';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface ElementProps {
	active?: boolean;
	open?: boolean;
	highlight?: boolean;
	title: string;

	handleClick?: React.MouseEventHandler<HTMLElement>;
	handleIconClick?: React.MouseEventHandler<SVGSVGElement>;
	handleDragEnter?: React.DragEventHandler<HTMLElement>;
	handleDragLeave?: React.DragEventHandler<HTMLElement>;
	handleDragDrop?: React.DragEventHandler<HTMLElement>;
}

interface StyledElementLabelProps {
	active?: boolean;
	highlight?: boolean;
}

export interface StyledElementChildProps {
	open?: boolean;
}

const StyledElement = styled.div`
	cursor: default;
`;

const StyledElementLabel = styled.div`
	position: relative;
	display: flex;
	min-height: 30px;
	padding: 0 ${getSpace(Size.L)}px;
	border-radius: 3px;
	cursor: pointer;
	align-items: center;
	${(props: StyledElementLabelProps) =>
		props.active
			? `
				color: ${colors.white.toString()};
				background: ${colors.blue.toString()};
			`
			: `
				color: ${colors.black.toString()};
			`};
	${(props: StyledElementLabelProps) =>
		props.highlight
			? `
			color: ${colors.white.toString()};
			background: ${colors.blueLight.toString()};
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
		handleDragDrop
	} = props;

	return (
		<StyledElement title={title}>
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
