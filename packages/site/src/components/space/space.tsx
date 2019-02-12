import styled from '@emotion/styled';

export interface SpaceProps {
	/** @name Size @default M */ size: SpaceSize;
}

export enum SpaceSize {
	XS,
	S,
	M,
	L,
	XL
}

/**
 * @icon Maximize
 */
export const Space =
	styled.div <
	SpaceProps >
	`
	display: block;
	${(props: SpaceProps) => getSpace(props.size)}
`;

export function getSpace(space: SpaceSize) {
	switch (space) {
		case SpaceSize.XS:
			return `
				width: 4px;
				height: 4px;

				@media screen and (min-width: 960px) {
					width: 8px;
					height: 8px;
				}
				@media screen and (min-width: 1280px) {
					width: 12px;
					height:12px;
				}
			`;
		case SpaceSize.S:
			return `
				width: 8px;
				height: 8px;

				@media screen and (min-width: 960px) {
					width: 16px;
					height: 16px;
				}
				@media screen and (min-width: 1280px) {
					width: 12px;
					height:12px;
				}
			`;
		case SpaceSize.M:
			return `
				width: 16px;
				height: 16px;

				@media screen and (min-width: 960px) {
					width: 32px;
					height: 32px;
				}
				@media screen and (min-width: 1280px) {
					width: 48px;
					height: 48px;
				}
			`;
		case SpaceSize.L:
			return `
				width: 32px;
				height: 32px;

				@media screen and (min-width: 960px) {
					width: 64px;
					height: 64px;
				}
				@media screen and (min-width: 1280px) {
					width: 96px;
					height: 96px;
				}
			`;
		case SpaceSize.XL:
			return `
				width: 64px;
				height: 64px;

				@media screen and (min-width: 960px) {
					width: 128px;
					height: 128px;
				}
			`;
	}
}
