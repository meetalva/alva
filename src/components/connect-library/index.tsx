import Button, { ButtonOrder, ButtonSize } from '../button';
import { colors } from '../colors';
import { Copy } from '../copy';
import { Headline } from '../headline';
// import Link from '../link';
import * as React from 'react';
import Space, { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface ConnectLibraryProps {
	description?: string;
	headline?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onPrimaryButtonClick?: React.MouseEventHandler<HTMLElement>;
	onSecondaryButtonClick?: React.MouseEventHandler<HTMLElement>;
	primaryButton?: string;
	secondaryButton?: string;
}

const StyledConnectLibrary = styled.div`
	background: linear-gradient(
		to bottom right,
		${colors.orange.toString()},
		${colors.red.toString()}
	);
	box-sizing: border-box;
	padding: ${getSpace(SpaceSize.XL)}px ${getSpace(SpaceSize.L)}px;
	color: ${colors.white.toString()};
`;

export const ConnectLibrary: React.SFC<ConnectLibraryProps> = props => (
	<StyledConnectLibrary>
		<Space sizeBottom={SpaceSize.S}>
			<Headline order={3}>{props.headline}</Headline>
		</Space>
		<Space sizeBottom={SpaceSize.L}>
			<Copy>{props.description}</Copy>
		</Space>
		<Space sizeBottom={SpaceSize.XS}>
			<Button
				textColor={colors.red}
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
