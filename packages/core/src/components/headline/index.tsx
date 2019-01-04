import { Color } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import styled, { css, StyledComponentClass } from 'styled-components';

export interface HeadlineProps {
	children?: React.ReactNode;
	className?: string;
	order?: 1 | 2 | 3 | 4;
	tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
	textColor?: Color;
	bold?: boolean;
}

interface StyledHeadlineProps {
	className?: string;
	order?: 1 | 2 | 3 | 4;
	textColor?: Color;
	bold?: boolean;
}

const StyledHeadline = styled.div`
	margin: 0;
	font-family: ${fonts().NORMAL_FONT};
	${(props: StyledHeadlineProps) => (props.textColor ? `color: ${props.textColor};` : '')};
	font-weight: ${(props: StyledHeadlineProps) => (props.bold ? '700' : '400')};
	${(props: HeadlineProps) => {
		switch (props.order) {
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
					font-size: 72px;
					line-height: 86px;
				`;
		}
	}};
	cursor: default;
`;

export const Headline: React.StatelessComponent<HeadlineProps> = props => {
	const tagName = props.tagName === undefined ? 'div' : props.tagName;
	const Component: StyledComponentClass<
		StyledHeadlineProps,
		HeadlineProps
	> = StyledHeadline.withComponent(tagName);

	return (
		<Component
			bold={props.bold}
			className={props.className}
			textColor={props.textColor}
			order={props.order}
		>
			{props.children}
		</Component>
	);
};
