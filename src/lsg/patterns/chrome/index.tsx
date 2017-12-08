import * as React from 'react';
//import { colors } from '../colors';
import { fonts } from '../fonts';
import Space, { Size } from '../space';
import styled from 'styled-components';

export interface ChromeProps {
	title: string;
}

const StyledChrome = styled(Space).attrs({
	size: Size.XS,
	sizeLeft: Size.XXL * 3,
	inside: true
}) `
	display: flex;
	align-items: center;
	font-family: ${fonts().NORMAL_FONT};
	height: 38px;
	-webkit-app-region: drag;
	-webkit-user-select: none;
	user-select: none;
`;

const StyledChromeTitle = styled.div`
	display: flex;
	align-items: center;
	margin-right: auto;
`;

export default class Chrome extends React.Component<ChromeProps> {
	public render(): JSX.Element {
		return (
			<StyledChrome>
				<StyledChromeTitle>{this.props.title}</StyledChromeTitle>
			</StyledChrome>
		);
	}
}
