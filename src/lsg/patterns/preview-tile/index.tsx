import * as React from 'react';
import styled from 'styled-components';

import { colors } from '../colors';
import { getSpace, Size } from '../space';

export interface PreviewTileProps {
	name: string;
}

const StyledPreview = styled.section`
	width: 245px;
	padding-bottom: ${getSpace(Size.XS)}px;
	text-align: center;
`;

const StyledPreviewTile = styled.div`
	box-sizing: border-box;
	width: inherit;
	height: 340px;
	border-radius: 5px;
	box-shadow: 0 3px 12px ${colors.blackAlpha13.toString()};
	background-color: ${colors.white.toString()};
`;

const PreviewTile: React.StatelessComponent<PreviewTileProps> = (props): JSX.Element => (
	<StyledPreview>
		{props.name}
		<StyledPreviewTile />
	</StyledPreview>
);

export default PreviewTile;
