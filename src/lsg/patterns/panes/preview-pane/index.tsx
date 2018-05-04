import { colors } from '../../colors';
import { remote } from 'electron';
import * as React from 'react';
import styled from 'styled-components';

export interface PreviewPaneProps {
	id?: string;
	onMouseDownLeft?: React.MouseEventHandler<HTMLElement>;
	onMouseDownRight?: React.MouseEventHandler<HTMLElement>;
	onMouseMove?: React.MouseEventHandler<HTMLElement>;
	onMouseUp?: React.MouseEventHandler<HTMLElement>;
	previewFrame?: string;
	width?: number;
	onPreviewWidthUpdate?(previewWidth: number): void;
}

const StyledPreviewWrapper = styled.div`
	display: inline-flex;
	justify-content: center;
	flex-grow: 1;
	flex-shrink: 0;
`;

const StyledPreviewResizer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 11px;
	height: 100%;
	cursor: ew-resize;
	background-color: ${colors.blackAlpha13.toString()};
	opacity: 0;
	transition: opacity 0.15s ease-in-out;

	&::after {
		content: '';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		height: 36px;
		width: 3px;
		margin: 4px;
		border-radius: 2px;
		background: ${colors.grey80.toString()};
	}

	&:hover {
		opacity: 1;
		&::after {
			background: ${colors.grey60.toString()};
		}
	}
	&:active {
		opacity: 1;
		&::after {
			background: ${colors.white.toString()};
		}
	}
	&:last-of-type {
		right: 0;
		left: auto;
	}
`;

const BaseStyledPreviewPane = styled.div`
	position: relative;
	flex-grow: 1;
	overflow: hidden;
	background: ${colors.white.toString()};
`;

const StyledPreviewPane = BaseStyledPreviewPane.extend.attrs({
	style: (props: PreviewPaneProps) => ({
		maxWidth: `${props.width}px` || 'none'
	})
})`${(props: PreviewPaneProps) => ({})}`;

export default class PreviewPane extends React.Component<PreviewPaneProps> {
	private onResize: () => void;
	private previewPane: HTMLElement;

	public componentDidMount(): void {
		this.updatePreviewWidth();

		this.onResize = () => this.updatePreviewWidth();
		remote.getCurrentWindow().addListener('resize', this.onResize);
	}

	public componentWillUnmount(): void {
		remote.getCurrentWindow().removeListener('resize', this.onResize);
	}

	public render(): JSX.Element {
		const props = this.props;

		return (
			<StyledPreviewWrapper
				innerRef={(ref: HTMLElement) => (this.previewPane = ref)}
				onMouseMove={props.onMouseMove}
				onMouseUp={props.onMouseUp}
			>
				<StyledPreviewPane width={props.width}>
					<StyledPreviewResizer onMouseDown={props.onMouseDownLeft} />
					<StyledPreviewFrame src={props.previewFrame} />
					<StyledPreviewResizer onMouseDown={props.onMouseDownRight} />
				</StyledPreviewPane>
			</StyledPreviewWrapper>
		);
	}

	private updatePreviewWidth(): void {
		if (!this.props.onPreviewWidthUpdate) {
			return;
		}

		const previewWidth = this.previewPane.offsetWidth;
		this.props.onPreviewWidthUpdate(previewWidth);
	}
}

const StyledPreviewFrame = styled('iframe')`
	width: 100%;
	height: 100%;
	border: none;
	border-radius: 6px 6px 0 0;
	overflow: hidden;
`;
