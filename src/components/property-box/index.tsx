import { Color } from '../colors';
import { Copy } from '../copy';
import { Headline } from '../headline';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PropertyBoxProps {
	headline: string;
	copy: string;
}

const StyledPropertyBox = styled.div`
	box-sizing: border-box;
	padding: ${getSpace(SpaceSize.M)}px;
	background: ${Color.White};
	border: 1px solid ${Color.Grey90};
	border-radius: 6px;
	width: 100%;
	user-select: none;
	cursor: default;
	margin-bottom: ${getSpace(SpaceSize.S)}px;
	overflow: hidden;
`;

const StyledPropertyBoxBar = styled.div`
	margin-top: ${getSpace(SpaceSize.M)}px;
	margin-right: -${getSpace(SpaceSize.M)}px;
	margin-bottom: -${getSpace(SpaceSize.M)}px;
	margin-left: -${getSpace(SpaceSize.M)}px;
`;

export const PropertyAction: React.SFC = props => <>{props.children}</>;

export const PropertyBox: React.SFC<PropertyBoxProps> = props => (
	<StyledPropertyBox>
		<Headline type="primary" order={4}>
			{props.headline}
		</Headline>
		<Copy textColor={Color.Grey50}>{props.copy}</Copy>
		{props.children}
	</StyledPropertyBox>
);

export const PropertyBoxBar: React.SFC = props => (
	<StyledPropertyBoxBar>{props.children}</StyledPropertyBoxBar>
);
