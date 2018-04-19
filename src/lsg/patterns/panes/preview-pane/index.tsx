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
	width: 9px;
	height: 100%;
	cursor: ew-resize;
	&::after {
		content: '';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		height: 36px;
		width: 3px;
		margin: 3px;
		border-radius: 2px;
		background: ${colors.grey80.toString()};
	}

	&:hover {
		&::after {
			background: ${colors.grey60.toString()};
		}
	}
	&:active {
		&::after {
			background: ${colors.blue40.toString()};
		}
	}
`;

const BaseStyledPreviewPane = styled.div`
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
	private previewPane: HTMLElement;

	public constructor(props: PreviewPaneProps) {
		super(props);
	}

	public componentDidMount(): void {
		this.updatePreviewWidth();

		remote.getCurrentWindow().addListener('resize', this.updatePreviewWidth.bind(this));
	}

	public render(): JSX.Element {
		const props = this.props;

		return (
			<StyledPreviewWrapper
				innerRef={(ref: HTMLElement) => (this.previewPane = ref)}
				onMouseMove={props.onMouseMove}
				onMouseUp={props.onMouseUp}
			>
				<StyledPreviewResizer onMouseDown={props.onMouseDownLeft} />
				<StyledPreviewPane width={props.width}>
					<StyledPreviewFrame src={props.previewFrame} />
				</StyledPreviewPane>
				<StyledPreviewResizer onMouseDown={props.onMouseDownRight} />
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
