import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';
import { Image } from '../image';
import { Layout, LayoutAlignItems } from '../layout';
import { Copy, CopySize } from '../copy';

export interface MenuProps {
	/** @asset @name Logo */
	logo?: string;

	/** @name Badge */
	badge?: string;

	/** @name Sticky @default false */
	sticky?: boolean;

	children?: React.ReactNode;
}

const StyledWrapper = styled(Layout)`
	position: ${(props: MenuProps) => (props.sticky ? 'sticky' : 'static')};
	top: 0;
	background-color: ${Color.Black};
	padding: 0 5vw;
`;

const StyledMenu = styled.div`
	display: flex;
	width: 100%;
	justify-content: space-between;
	align-items: center;
	padding: 20px 0;
	box-sizing: border-box;
	color: ${Color.White};
`;

const StyledImage = styled(Image)`
	display: block;
	height: 50px;
`;

const StyledBadge = styled(Copy)`
	display: block;
	height: 24px;
	padding: 0 8px;
	margin-left: 3vw;

	border: 2px solid ${Color.VioletLight};
	border-radius: 3px;

	white-space: nowrap;
	line-height: 24px;
	color: white;
	text-decoration: none;
`;

const StyledMenuInner = styled.div`
	display: flex;
	> * {
		display: none;
	}
	> :nth-of-type(1) {
		display: block;
	}
	> :nth-of-type(2) {
		display: block;
	}
	@media screen and (min-width: 420px) {
		> :nth-of-type(3) {
			display: block;
		}
	}
	@media screen and (min-width: 520px) {
		> :nth-of-type(4) {
			display: block;
		}
	}
	@media screen and (min-width: 620px) {
		> :nth-of-type(5) {
			display: block;
		}
	}
	@media screen and (min-width: 720px) {
		> :nth-of-type(6) {
			display: block;
		}
	}
`;

/**
 * @icon Menu
 */
export const Menu: React.StatelessComponent<MenuProps> = (props): JSX.Element => {
	return (
		<StyledWrapper sticky={props.sticky}>
			<Layout width="100%" maxWidth="1280px" center>
				<StyledMenu {...props}>
					<Layout alignItems={LayoutAlignItems.Center}>
						<StyledImage size="50px" src={props.logo} />
						<a href="">
							<StyledBadge size={CopySize.Small}>{props.badge}</StyledBadge>
						</a>
					</Layout>
					<StyledMenuInner>{props.children}</StyledMenuInner>
				</StyledMenu>
			</Layout>
		</StyledWrapper>
	);
};
