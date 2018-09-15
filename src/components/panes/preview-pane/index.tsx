import { Color } from '../../colors';
import * as React from 'react';
import styled from 'styled-components';

const StyledPreviewWrapper = styled.div`
	display: inline-flex;
	justify-content: center;
	flex-grow: 1;
	flex-shrink: 0;
	user-select: none;
`;

const StyledPreviewPane = styled.div`
	position: relative;
	flex-grow: 1;
	overflow: hidden;
	background: ${Color.White};
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
	onMouseEnter?: React.MouseEventHandler<HTMLElement>;
	onMouseLeave?: React.MouseEventHandler<HTMLElement>;
	src: string;
}

const PreviewFrame: React.SFC<PreviewFrameProps> = props => <StyledFrame {...props} />;

export interface PreviewPaneProps {
	children?: React.ReactNode;
	id?: string;
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

export { PreviewPane, PreviewFrame };
