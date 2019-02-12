import * as React from 'react';
import styled from '@emotion/styled';
import { fonts } from '../fonts';
import * as Types from '../types';
import { Color } from '../colors';

export interface HeadlineProps {
	/** @name CSS class @ignore */ className?: string;
	/** @name Level @default H1 */ level: HeadlineLevel;
	/** @name Text align @default Left */ textAlign?: Types.TextAlign;
	/** @name Color @default #000000 */ color?: string;
	/** @name Uppercase @default false */ uppercase?: boolean;
	/** @name Weight @default bold */ fontWeight?: Types.FontWeight;
	children?: React.ReactNode;
}

export enum HeadlineLevel {
	H1 = 'h1',
	H2 = 'h2',
	H3 = 'h3'
}

const StyledHeadline = styled.div`
	margin: 0;
	font-family: ${fonts().NORMAL_FONT};
	color: ${(props: HeadlineProps) => props.color || 'inherit'};
	line-height: 5;

	u {
		text-decoration-color: ${Color.Red};
	}

	b {
		font-weight: 500;
	}

	font-weight: ${props => props.fontWeight || Types.FontWeight.Bold};

	${(props: HeadlineProps) => {
		switch (props.level) {
			case HeadlineLevel.H3:
				return `
					font-size: 24px;

					@media screen and (min-width: 960px) {
						font-size: 32px;
					}
				`;
			case HeadlineLevel.H2:
				return `
					font-size: 32px;

					@media screen and (min-width: 450px) {
						font-size: 48px;
					}
					@media screen and (min-width: 960px) {
						font-size: 54px;
					}
				`;
			case HeadlineLevel.H1:
			default:
				return `
					font-size: 48px;

					@media screen and (min-width: 450px) {
						font-size: 64px;
					}
					@media screen and (min-width: 960px) {
						font-size: 96px;
					}
				`;
		}
	}};

	text-align: ${props => props.textAlign || 'inherit'};

	${(props: HeadlineProps) =>
		props.uppercase
			? `letter-spacing: 1px;
				text-transform: uppercase;`
			: ''};
`;

/**
 * @icon Bold
 */
export const Headline: React.StatelessComponent<HeadlineProps> = props => {
	const as = props.level || ('h1' as any);
	const Component = StyledHeadline.withComponent(as);
	return <Component {...props}>{props.children}</Component>;
};
