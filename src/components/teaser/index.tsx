import { Button, ButtonOrder, ButtonSize } from '../button';
import { Color } from '../colors';
import { Copy } from '../copy';
import { Headline } from '../headline';
import * as React from 'react';
import { Space, getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface TeaserProps {
	description?: string;
	headline?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onPrimaryButtonClick?: React.MouseEventHandler<HTMLElement>;
	onSecondaryButtonClick?: React.MouseEventHandler<HTMLElement>;
	primaryButton?: string;
	secondaryButton?: string;
}

const OrangeToRed = `linear-gradient(to bottom right, ${Color.Orange}, ${Color.Red});`;

const StyledConnectLibrary = styled.div`
	background: ${OrangeToRed};
	box-sizing: border-box;
	padding: ${getSpace(SpaceSize.XL)}px ${getSpace(SpaceSize.L)}px;
	color: ${Color.White};
`;

export const Teaser: React.SFC<TeaserProps> = props => (
	<StyledConnectLibrary>
		<Space sizeBottom={SpaceSize.S}>
			<Headline order={3}>{props.headline}</Headline>
		</Space>
		<Space sizeBottom={SpaceSize.L}>
			<Copy>{props.description}</Copy>
		</Space>
		<Space sizeBottom={SpaceSize.XS}>
			<Button
				textColor={Color.Red}
				order={ButtonOrder.Primary}
				size={ButtonSize.Small}
				onClick={props.onPrimaryButtonClick}
				inverted={true}
			>
				{props.primaryButton}
			</Button>
		</Space>
		{/*
			<Link onClick={props.onSecondaryButtonClick}>
				<Copy>{props.secondaryButton}</Copy>
			</Link>
		*/}
	</StyledConnectLibrary>
);
