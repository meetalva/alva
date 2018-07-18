import * as React from 'react';
import { Color } from '../colors';
import { fonts } from '../fonts';
import { getSpace, SpaceSize } from '../space';
import styled, { StyledComponentClass } from 'styled-components';
import { Link2 } from 'react-feather';

const StyledReference = styled.div`
	display: inline-block;
	box-sizing: border-box;
	width: 70%;
	border: 0.5px solid ${Color.Blue};
	padding-top: ${getSpace(SpaceSize.XS)}px;
	padding-right: 5px;
	padding-bottom: ${getSpace(SpaceSize.XS)}px;
	padding-left: ${getSpace(SpaceSize.XS + SpaceSize.XXS)}px;
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	border-radius: 3px;
	background: ${Color.Blue90};
	color: ${Color.Grey20};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 15px;
	text-overflow: ellipsis;
`;

const StyledReferenceHead = styled.div`
	position: relative;
	display: flex;
	align-items: center;
`;

const StyledReferenceName = styled.div`
	box-sizing: border-box;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: ${Color.Blue20};
	font-size: 15px;
`;

const StyledReferenceValue = styled.div`
	box-sizing: border-box;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: ${Color.Grey60};
	font-size: 12px;
	padding-top: 6px;
`;

// tslint:disable-next-line:no-any
export const StyledLinkIcon: StyledComponentClass<{}, any, any> = styled(Link2)`
	box-sizing: border-box;
	width: 15px;
	height: 15px;
	cursor: pointer;
	transition: stroke 0.3s ease-in-out;
	stroke: ${Color.Blue};
	&:hover {
		stroke: ${Color.Red};
	}
`;

export interface PropertyReferenceProps {
	name: string;
	value: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onLinkClick?: React.MouseEventHandler<HTMLElement>;
}

export const PropertyReference: React.SFC<PropertyReferenceProps> = props => (
	<StyledReference onClick={props.onClick}>
		<StyledReferenceHead>
			<StyledReferenceName>{props.name}</StyledReferenceName>
			<StyledLinkIcon onClick={props.onLinkClick} />
		</StyledReferenceHead>
		{props.value && <StyledReferenceValue>{props.value}</StyledReferenceValue>}
	</StyledReference>
);
