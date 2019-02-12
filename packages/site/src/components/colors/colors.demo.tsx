import * as React from 'react';
import styled from '@emotion/styled';

import { Color } from './index';

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
				<ColorSwatch color={Color.Black} />
				<ColorSwatch color={Color.Blue} />
				<ColorSwatch color={Color.BlueLight} />
				<ColorSwatch color={Color.Red} />
				<ColorSwatch color={Color.Grey70} />
				<ColorSwatch color={Color.Grey90} />
				<ColorSwatch color={Color.White} />
			</StyledList>
			<StyledList>
				<ColorSwatch color={Color.GreenDark} />
				<ColorSwatch color={Color.Green} />
				<ColorSwatch color={Color.GreenLight} />
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
	const Styles = styled.li`
		display: flex;
		margin: 0 48px 48px 0;
		background: ${props.color};
		padding-bottom: 50%;
		width: 100%;

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
					<div>{props.color}</div>
				</div>
			</InnerStyles>
		</Styles>
	);
};
