import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';
import { PropertyDescription } from './property-description';
import { PropertyLabel } from './property-label';

const StyledPropertyItem = styled.label`
	display: flex;
	flex-wrap: wrap;
	width: 100%;
	box-sizing: border-box;
	margin-bottom: ${getSpace(SpaceSize.S)}px;
`;

const StyledPropertyItemContainer = styled.div`
	display: flex;
	align-items: center;
	flex-grow: 1;
`;

export interface PropertyItemProps {
	children?: React.ReactNode;
	description?: string;
	label?: string;
}

export const PropertyItem: React.SFC<PropertyItemProps> = props => (
	<StyledPropertyItem>
		<StyledPropertyItemContainer>
			{props.label && <PropertyLabel label={props.label} />}
			{props.children}
		</StyledPropertyItemContainer>
		{props.description && <PropertyDescription description={props.description || ''} />}
	</StyledPropertyItem>
);
