import { Color } from '../colors';
import { Copy, CopySize } from '../copy';
import { Headline } from '../headline';
import * as React from 'react';
import { Space, getSpace, SpaceSize } from '../space';
import styled from 'styled-components';
import { IconSize } from '../icons';
const Icon = require('react-feather');

export interface TeaserProps {
	headline: string;
	description?: string;
	color: Color;
	size: TeaserSize;
	icon?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

export enum TeaserSize {
	Medium,
	Large
}

const StyledContainer = styled.div`
	box-sizing: border-box;
	padding: ${getSpace(SpaceSize.S)}px;
	background: ${(props: TeaserProps) => (props.color ? props.color : Color.Blue20)};
	border-radius: 6px;
	text-align: left;
	color: ${Color.White};

	margin: 0 ${getSpace(SpaceSize.XS)}px;
	flex-shrink: 0;
	box-shadow: 3px 3px 18px 0 rgba(0, 0, 0, 0.3);

	${(props: TeaserProps) => {
		switch (props.size) {
			case TeaserSize.Large:
				return `
					width: 100%;
				`;
			case TeaserSize.Medium:
			default:
				return `
					width: 180px;
				`;
		}
	}};
`;

const StyledTeaserRow = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
	width: 100%;
	box-sizing: border-box;
	padding: ${getSpace(SpaceSize.L)}px ${getSpace(SpaceSize.M)}px;
`;

export const TeaserRow: React.SFC = props => <StyledTeaserRow>{props.children}</StyledTeaserRow>;

export const Teaser: React.SFC<TeaserProps> = props => {
	const IconImage = Icon.hasOwnProperty(props.icon) ? Icon[props.icon || 'Box'] : Icon.Box;

	return (
		<StyledContainer {...props}>
			<IconImage stroke-width={1.5} size={IconSize.S} />
			<Space sizeBottom={SpaceSize.XS} />
			<Headline order={4}>{props.headline}</Headline>
			<Space sizeBottom={SpaceSize.XS} />
			<Copy textColor={Color.WhiteAlpha75} size={CopySize.S}>
				{props.description}
			</Copy>
		</StyledContainer>
	);
};
