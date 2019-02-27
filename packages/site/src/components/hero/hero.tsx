import { Color } from '../colors';
import { Layout, LayoutDirection } from '../layout';
import * as React from 'react';
import styled from '@emotion/styled';

export interface HeroProps {
	/** @name Background Color */
	backgroundColor?: Color;

	/** @name Text Color */
	textColor?: Color;

	children?: React.ReactNode;
}

const StyledWrapper =
	styled.div <
	{ textColor: Color | 'inherit' } >
	`
	width: 100%;
	margin: 0 auto;
	color: ${props => props.textColor};

`;

/**
 * @icon Square
 */
export const Hero: React.StatelessComponent<HeroProps> = (props): JSX.Element => {
	return (
		<Layout
			direction={LayoutDirection.Vertical}
			backgroundColor={props.backgroundColor || Color.White}
		>
			<Layout width="100%" center>
				<StyledWrapper textColor={props.textColor || 'inherit'}>{props.children}</StyledWrapper>
			</Layout>
		</Layout>
	);
};
