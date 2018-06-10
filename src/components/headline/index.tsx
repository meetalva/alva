import { Color } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import styled, { css, StyledComponentClass } from 'styled-components';

export interface HeadlineProps {
	children?: React.ReactNode;
	className?: string;
	order?: 1 | 2 | 3;
	tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
	textColor?: Color;
}

interface StyledHeadlineProps {
	className?: string;
	order?: 1 | 2 | 3;
	textColor?: Color;
}

const StyledHeadline = styled.div`
	margin-top: 0;
	font-family: ${fonts().NORMAL_FONT};
	font-weight: 500;
	user-select: none;
	${(props: StyledHeadlineProps) => (props.textColor ? `color: ${props.textColor};` : '')};

	${(props: HeadlineProps) => {
		switch (props.order) {
			case 3:
				return css`
					font-size: 24px;
					line-height: 30px;
					font-weight: 700;
					margin-bottom: 0.2em;
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
					font-weight: 700;
					margin-bottom: 0.2em;
				`;
		}
	}};
`;

export const Headline: React.StatelessComponent<HeadlineProps> = props => {
	const tagName = props.tagName === undefined ? 'div' : props.tagName;
	const Component: StyledComponentClass<
		StyledHeadlineProps,
		HeadlineProps
	> = StyledHeadline.withComponent(tagName);

	return (
		<Component className={props.className} textColor={props.textColor} order={props.order}>
			{props.children}
		</Component>
	);
};
