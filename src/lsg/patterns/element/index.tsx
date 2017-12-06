import { colors } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface ElementProps {
	active?: boolean;
	title: string;
}

const StyledElement = styled.div`
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
	padding-left: 15px;
`;

export const Element: React.StatelessComponent<ElementProps> = props => {
	const { children, title, active } = props;

	return (
		<StyledElement title={title} active={active}>
			{title}
			<StyledElementChild>{children}</StyledElementChild>
		</StyledElement>
	);
};
