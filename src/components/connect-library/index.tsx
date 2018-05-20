import Button, { ButtonOrder, ButtonSize } from '../button';
import { colors } from '../colors';
import { getSpace, SpaceSize } from '../space';
import { Headline } from '../headline';
import { Copy } from '../copy';
import * as React from 'react';
import styled from 'styled-components';

export interface ConnectLibraryProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
	headline?: string;
	description?: string;
	primaryButton?: string;
	secondaryButton?: string;
	onPrimaryButtonClick?: React.MouseEventHandler<HTMLElement>;
	onSecondaryButtonClick?: React.MouseEventHandler<HTMLElement>;
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

const StyledHeadline = styled(Headline)`
	margin-bottom: ${getSpace(SpaceSize.M)}px;
`;

const StyledButton = styled(Button)`
	margin: ${getSpace(SpaceSize.M)}px 0;
`;

export const ConnectLibrary: React.SFC<ConnectLibraryProps> = props => (
	<StyledConnectLibrary>
		<StyledHeadline order={3}>{props.headline}</StyledHeadline>
		<Copy>{props.description}</Copy>
		<StyledButton
			textColor={colors.red}
			order={ButtonOrder.Primary}
			size={ButtonSize.Small}
			onClick={props.onPrimaryButtonClick}
			inverted={true}
		>
			{props.primaryButton}
		</StyledButton>
		<Copy>{props.secondaryButton}</Copy>
	</StyledConnectLibrary>
);
