import styled from '@emotion/styled';

export interface SpaceProps {
	/** @name Size @default M */ size?: SpaceSize;
}

export enum SpaceSize {
	XS = 8,
	S = 16,
	M = 32,
	L = 64,
	XL = 128
}

/**
 * @icon Maximize
 */
export const Space =
	styled.div <
	SpaceProps >
	`
	display: block;
	width: ${props => props.size}px;
	height: ${props => props.size}px;
`;
