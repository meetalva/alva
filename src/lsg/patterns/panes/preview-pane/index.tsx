import { colors } from '../../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface PreviewPaneProps {
	previewFrame?: string;
}

const StyledPreviewPane = styled.div`
	flex-grow: 1;
	flex-shrink: 0;
	background: ${colors.white.toString()};
	border-radius: 6px 6px 0 0;
	box-shadow: 0 3px 9px 0 ${colors.black.toRGBString(0.15)};
	overflow: hidden;
`;

export default class PreviewPane extends React.Component<PreviewPaneProps> {
	public constructor(props: PreviewPaneProps) {
		super(props);
	}

	public render(): JSX.Element {
		const { previewFrame } = this.props;

		return (
			<StyledPreviewPane
				dangerouslySetInnerHTML={{
					__html: `<webview id="preview" style="height: 100%; border-radius: 6px 6px 0 0; overflow: hidden;" src="${previewFrame ||
						'./preview.html'}" preload="../../build/component/preview.js" partition="electron" nodeintegration />`
				}}
			/>
		);
	}
}
