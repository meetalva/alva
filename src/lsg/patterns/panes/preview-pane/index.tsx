import { colors } from '../../colors';
import * as React from 'react';
import styled from 'styled-components';

const StyledPreviewPane = styled.div`
	flex-grow: 1;
	flex-shrink: 0;
	background: ${colors.white.toString()};
	border-radius: 6px 6px 0 0;
	box-shadow: 0 3px 9px 0 ${colors.black.toRGBString(0.15)};
	overflow: hidden;
`;

const PreviewPane: React.StatelessComponent = props => (
	<StyledPreviewPane
		dangerouslySetInnerHTML={{
			__html:
				'<webview id="preview" style="height: 100%; border-radius: 6px 6px 0 0; overflow: hidden;" src="./preview.html" partition="electron" nodeintegration />'
		}}
	/>
);

export default PreviewPane;
