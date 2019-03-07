import { Color } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import styled, { css, StyledComponentClass } from 'styled-components';

export interface HeadlineProps {
	children?: React.ReactNode;
	className?: string;
	order?: 1 | 2 | 3 | 4 | 5;
	textColor?: Color;
	bold?: boolean;
}

interface StyledHeadlineProps {
	className?: string;
	order?: 1 | 2 | 3 | 4 | 5;
	textColor?: Color;
	bold?: boolean;
}

const StyledHeadline = styled.div`
	font-family: ${fonts().NORMAL_FONT};
	${(props: StyledHeadlineProps) => (props.textColor ? `color: ${props.textColor};` : '')};
	font-weight: ${(props: StyledHeadlineProps) => (props.bold ? '700' : '400')};
	${(props: HeadlineProps) => {
		switch (props.order) {
			case 5:
				return css`
					font-size: 11px;
					text-transform: uppercase;
					letter-spacing: 0.5px;
				`;
			case 4:
				return css`
					font-size: 15px;
					line-height: 18px;
				`;
			case 3:
				return css`
					font-size: 24px;
					line-height: 30px;
				`;
			case 2:
				return css`
					font-size: 38px;
					line-height: 45px;
				`;
			case 1:
			default:
				return css`
					font-size: 48px;
					line-height: 60px;
				`;
		}
	}};
	cursor: default;
`;

export const Headline: React.StatelessComponent<HeadlineProps> = props => {
	return (
		<StyledHeadline
			bold={props.bold}
			className={props.className}
			textColor={props.textColor}
			order={props.order}
		>
			{props.children}
		</StyledHeadline>
	);
};
