import { Color } from '../colors';
import { Layout } from '../layout';
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
	margin: 0 auto;
	padding: 0 5vw;
	color: ${props => props.textColor};

`;

/**
 * @icon Square
 */
export const Hero: React.StatelessComponent<HeroProps> = (props): JSX.Element => {
	return (
		<Layout backgroundColor={props.backgroundColor || Color.White}>
			<Layout width="100%" maxWidth="1280px" center>
				<StyledWrapper textColor={props.textColor || 'inherit'}>{props.children}</StyledWrapper>
			</Layout>
		</Layout>
	);
};
