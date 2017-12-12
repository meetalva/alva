import { colors } from '../colors';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface ElementProps {
	active?: boolean;
	open?: boolean;
	title: string;

	handleClick?: React.MouseEventHandler<HTMLElement>;
	handleIconClick?: React.MouseEventHandler<SVGSVGElement>;
}

interface StyledElementLabelProps {
	active?: boolean;
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
	const { children, title, active, open, handleClick, handleIconClick } = props;

	return (
		<StyledElement title={title}>
			<StyledElementLabel active={active} onClick={handleClick}>
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
