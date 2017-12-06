import * as React from 'react';
import styled from 'styled-components';

import colors, { Color, RGB } from './index';

interface ColorSwatchProps {
	color: Color;
}

const StyledList = styled.ul`
	display: flex;
	flex-wrap: wrap;
	margin: 0;
	padding: 48px;
`;

export default function ColorDemo() {
	return (
		<div>
			<StyledList>
				<ColorSwatch color={colors.black} />
				<ColorSwatch color={colors.grey70} />
				<ColorSwatch color={colors.grey90} />
				<ColorSwatch color={colors.white} />
			</StyledList>
			<StyledList>
				<ColorSwatch color={colors.greenDark} />
				<ColorSwatch color={colors.green} />
				<ColorSwatch color={colors.greenLight} />
			</StyledList>
		</div>
	);
}

const InnerStyles = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 25px;
`;

const ColorSwatch: React.StatelessComponent<ColorSwatchProps> = (props): JSX.Element => {
	const threshold = 250;
	const Styles = styled.li`
		display: flex;
		margin: 0 48px 48px 0;
		background: ${props.color.toString('rgb')};
		padding-bottom: 50%;
		width: 100%;
		${luminance(props.color.rgb) > threshold
			? `box-shadow: 0 2px 4px ${colors.grey70.toString()};`
			: ''
		}
		color: ${contrast(props.color.rgb)};

		@media screen and (min-width: 320px) {
			padding: 0;
			width: 250px;
			height: 250px;
		}
	`;

	return (
		<Styles>
			<InnerStyles>
				<div>
					{props.color.displayName}
				</div>
				<div>
					<div>
						{props.color.toString('rgb')}
					</div>
					<div>
						{props.color.toString('hex')}
					</div>
				</div>
			</InnerStyles>
		</Styles>
	);
};

function contrast(rgb: RGB): string {
	return isLight(rgb) ?
		colors.black.toString() :
		colors.white.toString();
}

function isLight(rgb: RGB) {
	const threshold = 100;
	return luminance(rgb) > threshold;
}

function luminance(rgb: RGB): number {
	const [r, g, b] = rgb;
	const factorR = 0.2126;
	const factorG = 0.7152;
	const factorB = 0.0722;

	return (factorR * r) + (factorG * g) + (factorB * b);
}
