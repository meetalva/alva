import { Color } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PropertyLabelProps {
	label: string;
	width?: WithWidth['width'];
}

export interface WithWidth {
	width: PropertyLabelWidth;
}

export enum PropertyLabelWidth {
	Sixth,
	Third,
	Full
}

const LABEL_WIDTH = (props: WithWidth) => {
	switch (props.width) {
		case PropertyLabelWidth.Full:
			return '100%';
		case PropertyLabelWidth.Sixth:
			return '15%';
		case PropertyLabelWidth.Third:
		default:
			return '30%';
	}
};

const StyledLabel = styled.span`
	display: inline-block;
	flex-shrink: 0;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${Color.Grey50};
	width: ${LABEL_WIDTH};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	user-select: none;
	cursor: default;
	box-sizing: border-box;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XS)}px 0;
`;

export const PropertyLabel: React.StatelessComponent<PropertyLabelProps> = props => {
	const { label } = props;

	return <StyledLabel width={props.width || PropertyLabelWidth.Third}>{label}</StyledLabel>;
};
