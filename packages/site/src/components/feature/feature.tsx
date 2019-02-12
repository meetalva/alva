import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';
import { Copy, CopySize } from '../copy';
import { Headline, HeadlineLevel } from '../headline';
import { Space, SpaceSize } from '../space';
import { AppFrame } from './app-frame';

export interface FeatureProps {
	/** @name Layout */
	layout?: FeatureLayout;

	/** @name Feature level */
	featureLevel: FeatureLevel;

	/** @name Headline */
	headline: string;

	/** @name Copy */
	copy: string;

	/** @name Frame */
	frame?: React.ReactNode;

	/** @name Link */
	link?: React.ReactNode;

	/** @name NegativeTop */
	negativeTop?: boolean;

	children?: React.ReactNode;
}

export enum FeatureLevel {
	Large = 'feature-large',
	Medium = 'feature-medium'
}

export enum FeatureLayout {
	Left = 'feature-left',
	Center = 'feature-center',
	Right = 'feature-right'
}

const Wrapper = styled.div`
	width: 90%;
	max-width: 1280px;
	${(props: FeatureProps) =>
		props.layout === FeatureLayout.Center
			? `
		display: block;
	`
			: `
		display: block;
		@media screen and (min-width: 960px) {
			display: flex;
		}
	`};
	margin: 0 auto;
	${(props: FeatureProps) =>
		(props.negativeTop && 'margin-top: -100px;') || ''} position: relative;
`;

const StyledAppFrame = styled(AppFrame)`
	${(props: FeatureProps) => {
		switch (props.layout) {
			case FeatureLayout.Left:
				return `
				@media screen and (min-width: 960px) {
					transform: translate(50%,0);
				}
			`;
			case FeatureLayout.Right:
				return `
				@media screen and (min-width: 960px) {
					transform: translate(-50%,0);
				}
			`;
			default:
			case FeatureLayout.Center:
				return '';
		}
	}};

	img {
		width: 100%;
	}
`;

const StyledBox = styled.div`
	width: 80%;

	@media screen and (min-width: 960px) {
		width: 40%;
	}

	padding-top: 60px;
	text-align: center;

	${(props: FeatureProps) =>
		props.layout === FeatureLayout.Center
			? `


		`
			: `
			@media screen and (min-width: 960px) {
				position: absolute;
				top: 50%;
				transform: translate(0,-50%);
				text-align: left;
				padding-top: 0;
			}
		`};

	${(props: FeatureProps) =>
		props.layout === FeatureLayout.Right
			? `
		@media screen and (min-width: 960px) {
			left: 60%;
		}
	`
			: ''};
	color: ${Color.Black};
	max-width: 480px;
	margin: 0 auto;
`;

const StyledCopy = styled(Copy)`
	color: ${Color.Grey50};
`;

export const Feature: React.StatelessComponent<FeatureProps> = (props): JSX.Element => {
	return (
		<div>
			<Wrapper {...props}>
				<StyledAppFrame {...props}>{props.frame}</StyledAppFrame>
				<StyledBox {...props}>
					<Headline level={HeadlineLevel.H3}>{props.headline}</Headline>
					<Space size={SpaceSize.S} />
					<StyledCopy size={CopySize.Medium}>
						{props.copy}
						<Space size={SpaceSize.S} />
						{props.link}
					</StyledCopy>
				</StyledBox>
			</Wrapper>
		</div>
	);
};
