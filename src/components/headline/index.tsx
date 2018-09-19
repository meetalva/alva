import { Color } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import styled, { css, StyledComponentClass } from 'styled-components';

export type HeadlineType = 'primary' | 'secondary';

export interface HeadlineProps {
	children?: React.ReactNode;
	className?: string;
	order?: 1 | 2 | 3 | 4;
	tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
	textColor?: Color;
	type: HeadlineType;
}

interface StyledHeadlineProps {
	className?: string;
	order?: 1 | 2 | 3 | 4;
	textColor?: Color;
	type: HeadlineType;
}

const StyledHeadline = styled.div`
	margin-top: 0;
	font-family: ${fonts().NORMAL_FONT};
	${(props: StyledHeadlineProps) => (props.textColor ? `color: ${props.textColor};` : '')};
	font-weight: ${(props: StyledHeadlineProps) => {
			switch (props.type) {
				case 'secondary':
					return 700;
				default:
					return 300;
			}
		}}
		${(props: HeadlineProps) => {
			switch (props.order) {
				case 4:
					return css`
						font-size: 15px;
						line-height: 18px;
						font-weight: 400;
						margin-bottom: 0.3em;
					`;
				case 3:
					return css`
						font-size: 24px;
						line-height: 30px;
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
						margin-bottom: 0.2em;
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
			type={props.type}
			className={props.className}
			textColor={props.textColor}
			order={props.order}
		>
			{props.children}
		</Component>
	);
};
