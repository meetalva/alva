import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';
import { Headline, HeadlineLevel } from '../headline';
import { Layout, LayoutProps, LayoutDirection } from '../layout';
import { Space, SpaceSize } from '../space';

export interface TeaserProps {
	/** @name Headline*/
	headline: string;

	/** @name Image @asset */
	image?: string;
}

const StyledTeaser = styled.div`
	background-position: center;
	background-size: cover;
	background-image: url('${(props: TeaserProps) => props.image || ''}');
	width: 100%;
	position: relative;
	padding: 100px 0;
	box-sizing: border-box;

	@media screen and (min-width: 960px) {
		padding: 200px 0;
	}

	&:after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.75);
		z-index: 1;
	}
`;

const StyledLayout =
	styled(Layout) <
	LayoutProps >
	`
	z-index: 2;
	display: block;
	position: relative;
`;

/**
 * @icon Sidebar
 */
export const Teaser: React.StatelessComponent<TeaserProps> = (props): JSX.Element => {
	return (
		<StyledTeaser {...props}>
			<StyledLayout width="80%" maxWidth="960px" center>
				<Layout maxWidth="480px" direction={LayoutDirection.Vertical}>
					<svg
						style={{ marginBottom: SpaceSize.M }}
						width="60"
						height="60"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M30 60a30 30 0 1 1 0-60 30 30 0 0 1 0 60zm-4-37v15l12-7.5L26 23z"
							fill="#FFF"
							fillRule="evenodd"
						/>
					</svg>
					<Space size={SpaceSize.M} />
					<Headline level={HeadlineLevel.H3} color={Color.White}>
						{props.headline}
					</Headline>
					<Space size={SpaceSize.XL} />
				</Layout>
				{props.children}
			</StyledLayout>
		</StyledTeaser>
	);
};
