import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { Space, getSpace, SpaceSize } from '../space';
import { Headline } from '../headline';
import { Copy } from '../copy';

export interface EmptyStateProps {
	headline: string;
	copy: string;
	image?: React.ReactNode;
	highlighted?: boolean;
}

const StyledEmptyState = styled.div`
	text-align: center;
	padding: ${getSpace(SpaceSize.XXXL)}px;
`;

export const EmptyState: React.StatelessComponent<EmptyStateProps> = props => (
	<StyledEmptyState>
		<Headline order={4} textColor={props.highlighted ? Color.Blue : Color.Black}>
			{props.headline}
		</Headline>
		<Space sizeTop={getSpace(SpaceSize.XS)} sizeBottom={getSpace(SpaceSize.L)}>
			<Copy textColor={props.highlighted ? Color.Blue : Color.Grey50}>{props.copy}</Copy>
		</Space>
		{props.image}
	</StyledEmptyState>
);
