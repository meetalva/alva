import { colors } from '../../colors';
import * as React from 'react';
import styled from 'styled-components';

const StyledPreviewWrapper = styled.div`
	display: inline-flex;
	justify-content: center;
	flex-grow: 1;
	flex-shrink: 0;
`;

const StyledPreviewPane = styled.div`
	position: relative;
	flex-grow: 1;
	overflow: hidden;
	background: ${colors.white.toString()};
`;

const StyledFrame = styled.iframe`
	position: ${(props: PreviewFrameProps) => (props.offCanvas ? 'absolute' : 'static')};
	top: ${(props: PreviewFrameProps) => (props.offCanvas ? '100vh' : 'auto')};
	width: 100%;
	height: 100%;
	overflow: hidden;
	border: none;
`;

export interface PreviewFrameProps {
	offCanvas: boolean;
	src: string;
}

const PreviewFrame: React.SFC<PreviewFrameProps> = props => <StyledFrame {...props} />;

export interface PreviewPaneProps {
	id?: string;
	onMouseDownLeft?: React.MouseEventHandler<HTMLElement>;
	onMouseDownRight?: React.MouseEventHandler<HTMLElement>;
	onMouseMove?: React.MouseEventHandler<HTMLElement>;
	onMouseUp?: React.MouseEventHandler<HTMLElement>;
	width?: number;
	onPreviewWidthUpdate?(previewWidth: number): void;
}

class PreviewPane extends React.Component<PreviewPaneProps> {
	public render(): JSX.Element {
		const props = this.props;

		return (
			<StyledPreviewWrapper>
				<StyledPreviewPane>{props.children}</StyledPreviewPane>
			</StyledPreviewWrapper>
		);
	}
}

export default PreviewPane;
export { PreviewPane, PreviewFrame };
