import { Color } from '../colors';
import { IconSize } from '../icons';
import * as React from 'react';
const { Layout } = require('react-feather');
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface LayoutSwitchProps {
	active?: boolean;
	onPrimaryClick?: React.MouseEventHandler<HTMLElement>;
	onSecondaryClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	children?: React.ReactNode;
}

export enum TLayoutSwitchState {
	Active,
	Default
}

const StyledLayoutSwitch = styled.div`
	display: flex;
	box-sizing: border-box;
	border-radius: 3px;
	background: linear-gradient(to bottom, ${Color.White} 0%, ${Color.Grey97});
	height: 21px;
	width: fit-content;
	box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 0.5px 2px 0 rgba(0, 0, 0, 0.3);
	-webkit-app-region: no-drag;
`;

const StyledPrimaryContainer = styled.div`
	display: flex;
	align-items: center;
	height: 100%;
	padding: 0 ${getSpace(SpaceSize.XS + SpaceSize.XXS)}px;
	border-radius: 3px 0 0 3px;
	background: ${(props: LayoutSwitchProps) => (props.active ? Color.Grey50 : 'transparent')};
	color: ${(props: LayoutSwitchProps) => (props.active ? Color.White : Color.Grey50)};

	&:active {
		background: ${(props: LayoutSwitchProps) => (props.active ? Color.Grey36 : Color.Grey90)};
	}
`;

const StyledSecondaryContainer = styled.label`
	display: flex;
	align-items: center;
	height: 100%;
	padding: 0 ${getSpace(SpaceSize.XXS)}px;
	border-left: 1px solid ${Color.Grey80};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-left-width: 0.5px;
	}
	border-radius: 0 3px 3px 0;
	color: ${Color.Grey50};

	&:active {
		background: ${Color.Grey90};
	}
`;

export const LayoutSwitch: React.SFC<LayoutSwitchProps> = props => (
	<StyledLayoutSwitch onDoubleClick={props.onDoubleClick}>
		<StyledPrimaryContainer onClick={props.onPrimaryClick} active={props.active}>
			<Layout size={IconSize.XS} strokeWidth={1.5} />
		</StyledPrimaryContainer>
		<StyledSecondaryContainer onClick={props.onSecondaryClick}>
			{props.children}
		</StyledSecondaryContainer>
	</StyledLayoutSwitch>
);
