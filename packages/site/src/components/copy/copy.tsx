import * as React from 'react';
import styled from '@emotion/styled';
import { fonts } from '../fonts';
import { TextAlign } from '../types';

export interface CopyProps {
	/** @name CSS Class @ignore */ className?: string;
	/** @name Copy Size @default Default */ size?: CopySize;
	/** @name Text Align @default Left */ textAlign?: TextAlign;
	/** @name Color @default #000000 */ color?: string;
	/** @name Uppercase @default false */ uppercase?: boolean;

	children?: React.ReactNode;
}

export enum CopySize {
	Small = 'copy-small',
	Medium = 'copy-medium',
	Large = 'copy-large'
}

/**
 * @icon Type
 */
export const Copy =
	styled.div <
	CopyProps >
	`
	margin: 0;
	font-family: ${fonts().NORMAL_FONT};
	color: ${(props: CopyProps) => props.color || 'inherit'};
	line-height: 1.5;

	${props => {
		switch (props.size) {
			case CopySize.Small:
				return 'font-size: 12px;';
			case CopySize.Medium:
			default:
				return 'font-size: 16px';
			case CopySize.Large:
				return `
					font-size: 18px;

					@media screen and (min-width: 960px) {
						font-size: 24px;
					}
				`;
		}
	}};

	${props => {
		switch (props.textAlign) {
			case TextAlign.Center:
				return `text-align: center;`;
			case TextAlign.Right:
				return `text-align: right;`;
			case TextAlign.Left:
				return `text-align: left;`;
			default:
				return `text-align: inherit`;
		}
	}};

	${props =>
		props.uppercase
			? `letter-spacing: 1px;
				text-transform: uppercase;`
			: ''};
`;
