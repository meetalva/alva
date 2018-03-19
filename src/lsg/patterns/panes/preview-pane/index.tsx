import { colors } from '../../colors';
import { remote } from 'electron';
import * as React from 'react';
import styled from 'styled-components';

export interface PreviewPaneProps {
	previewFrame?: string;
	handleMouseDownLeft?: React.MouseEventHandler<HTMLElement>;
	handleMouseDownRight?: React.MouseEventHandler<HTMLElement>;
	handleMouseMove?: React.MouseEventHandler<HTMLElement>;
	handleMouseUp?: React.MouseEventHandler<HTMLElement>;
	width?: number;
	handlePreviewWidthUpdate?(previewWidth: number): void;
}

const StyledPreviewWrapper = styled.div`
	display: inline-flex;
	justify-content: center;
	flex-grow: 1;
	flex-shrink: 0;
`;

const StyledPreviewResizer = styled.div`
	width: 12px;
	height: 100%;
	cursor: ew-resize;
	&::after {
		content: '';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		height: 36px;
		width: 6px;
		margin: 3px;
		border-radius: 5px;
		background: grey;
	}
`;

const BaseStyledPreviewPane = styled.div`
	flex-grow: 1;
	overflow: hidden;
	background: ${colors.white.toString()};
	border-radius: 6px 6px 0 0;
	box-shadow: 0 3px 9px 0 ${colors.black.toRGBString(0.15)};
`;

const StyledPreviewPane = BaseStyledPreviewPane.extend.attrs({
	style: (props: PreviewPaneProps) => ({
		maxWidth: `${props.width}px` || 'none'
	})
}) `${(props: PreviewPaneProps) => ({})}`;

export default class PreviewPane extends React.Component<PreviewPaneProps> {
	private previewPane: HTMLElement;

	public constructor(props: PreviewPaneProps) {
		super(props);
	}

	private updatePreviewWidth(): void {
		if (!this.props.handlePreviewWidthUpdate) {
			return;
		}

		const previewWidth = this.previewPane.offsetWidth;
		this.props.handlePreviewWidthUpdate(previewWidth);
	}

	public componentDidMount(): void {
		this.updatePreviewWidth();

		remote.getCurrentWindow().addListener('resize', this.updatePreviewWidth.bind(this));
	}

	public render(): JSX.Element {
		const {
			handleMouseDownLeft,
			handleMouseDownRight,
			handleMouseMove,
			handleMouseUp,
			width,
			previewFrame
		} = this.props;

		return (
			<StyledPreviewWrapper
				innerRef={(ref: HTMLElement) => (this.previewPane = ref)}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
			>
				<StyledPreviewResizer onMouseDown={handleMouseDownLeft} />
				<StyledPreviewPane
					width={width}
					dangerouslySetInnerHTML={{
						__html: `<webview id="preview" style="height: 100%; border-radius: 6px 6px 0 0; overflow: hidden;" src="${previewFrame ||
							'./preview.html'}" preload="../../build/component/preview.js" partition="electron" />`
					}}
				/>
				<StyledPreviewResizer onMouseDown={handleMouseDownRight} />
			</StyledPreviewWrapper>
		);
	}
}
