import { PreviewFrame, PreviewPane, PreviewFrameProps } from '../components';
import { Copy, CopySize } from '../components/copy';
import { IconSize } from '../components/icons';
import { Overlay } from '../components/overlay';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { Space, SpaceSize } from '../components/space';
import { WithStore } from '../store';
import * as PreviewDocument from '../preview-document/preview-document';
import * as Types from '../types';
import * as _ from 'lodash';
import * as Mobx from 'mobx';
import * as Model from '../model';
import { Layout } from 'react-feather';

export interface PreviewPaneProps {
	isDragging: boolean;
}

const getSrcDoc = (_: unknown, project: Model.Project) => {
	return PreviewDocument.previewDocument({
		transferType: Types.PreviewTransferType.Inline,
		data: project.toJSON(),
		scripts: []
	});
};

@MobxReact.inject('store')
@MobxReact.observer
export class PreviewPaneWrapper extends React.Component<PreviewPaneProps> {
	private frame: HTMLIFrameElement | null = null;

	public componentDidMount() {
		const props = this.props as PreviewPaneProps & WithStore;
		const sender = props.store.getSender();

		if (this.frame && this.frame.contentWindow) {
			sender.setWindow(this.frame.contentWindow);
		}
	}

	public render(): JSX.Element | null {
		const props = this.props as PreviewPaneProps & WithStore;
		const project = props.store.getProject();

		if (!project) {
			return null;
		}

		return (
			<PreviewPane>
				<OptimizedPreviewFrame
					frameRef={(frame: any) => (this.frame = frame)}
					project={project}
					offCanvas={false}
					onMouseLeave={() => {
						props.store.getProject().unsetHighlightedElement();
						props.store.getProject().unsetHighlightedElementContent();
					}}
				/>
				<Overlay isVisisble={props.isDragging}>
					<Space size={[0, 0, SpaceSize.L]}>
						<Layout size={IconSize.M} />
					</Space>
					<Copy size={CopySize.M}>Drop the component on the left element list</Copy>
				</Overlay>
			</PreviewPane>
		);
	}
}

interface OptimizedPreviewFrameProps extends PreviewFrameProps {
	frameRef: any;
	project: Model.Project;
}

@MobxReact.observer
class OptimizedPreviewFrame extends React.Component<OptimizedPreviewFrameProps> {
	@Mobx.observable private doc: string | undefined;

	// When mounted state changes
	// are performed via messages
	public componentWillUpdate() {
		return false;
	}

	public componentDidMount() {
		this.doc = getSrcDoc(this.props.project.getId(), this.props.project);
	}

	public render(): JSX.Element {
		return (
			<PreviewFrame
				ref={this.props.frameRef}
				srcDoc={this.doc}
				offCanvas={false}
				onMouseLeave={this.props.onMouseLeave}
			/>
		);
	}
}
