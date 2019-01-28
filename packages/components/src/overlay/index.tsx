import * as React from 'react';
import styled from 'styled-components';

import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';

export interface OverlayProps {
	isVisisble: boolean;
}

export interface StyledOverlayProps {
	isVisisble: boolean;
}

const StyledOverlay = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	box-sizing: border-box;
	width: 20vw;
	min-width: 200px;
	max-width: 500px;
	padding: ${getSpace(SpaceSize.XL)}px ${getSpace(SpaceSize.XXL)}px;
	border-radius: 3px;
	box-shadow: 0 1px 6px ${Color.Grey60};
	opacity: ${(props: StyledOverlayProps) => (props.isVisisble ? 1 : 0)};
	text-align: center;
	pointer-events: ${(props: StyledOverlayProps) => (props.isVisisble ? 'auto' : 'none')};
	background-color: ${Color.Grey97};
	transform: translate(-50%, -50%);
	transition: opacity 0.333s ease;
`;

export const Overlay: React.StatelessComponent<OverlayProps> = ({
	children,
	isVisisble
}): JSX.Element => <StyledOverlay isVisisble={isVisisble}>{children}</StyledOverlay>;
