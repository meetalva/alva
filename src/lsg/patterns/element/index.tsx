import { colors } from '../colors';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import styled from 'styled-components';

export interface ElementProps {
	active?: boolean;
	open?: boolean;
	title: string;

	handleIconClick?: React.MouseEventHandler<SVGSVGElement>;
}

export interface StyledElementChildProps {
	open?: boolean;
}

const StyledElement = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	padding: 0 15px;
	line-height: 30px;
	margin-top: 0;
	border-radius: 3px;
	${(props: ElementProps) =>
		props.active
			? `
				color: ${colors.white.toString()};
				background: ${colors.blue.toString()};
			`
			: `
				color: ${colors.black.toString()};
				background: ${colors.grey90.toString()};
			`};
`;

const StyledElementChild = styled.div`
	flex-basis: 100%;
	padding-left: 15px;
	${(props: StyledElementChildProps) => (props.open ? 'display: block;' : 'display: none;')};
`;

const StyledIcon = styled(Icon)`
	margin-right: 20px;
	fill: ${colors.grey70.toString()};
`;

const Element: React.StatelessComponent<ElementProps> = props => {
	const { children, title, active, open, handleIconClick } = props;

	return (
		<StyledElement title={title} active={active}>
			<StyledIcon
				handleClick={handleIconClick}
				name={IconName.Robo}
				size={IconSize.XS}
				color={colors.grey70}
			/>
			{title}
			<StyledElementChild open={open}>{children}</StyledElementChild>
		</StyledElement>
	);
};

export default Element;
