import { setSearch } from '../alva-util';
import { PreviewFrame, PreviewPane } from '../components';
import { Copy, CopySize } from '../components/copy';
import { IconSize } from '../components/icons';
import { Overlay } from '../components/overlay';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { Layout } from 'react-feather';
import { Space, SpaceSize } from '../components/space';
import { WithStore } from '../store';
import * as Types from '../types';

export interface PreviewPaneProps {
	isDragging: boolean;
	previewFrame: string;
}

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

	public render(): JSX.Element {
		const props = this.props as PreviewPaneProps & WithStore;

		return (
			<PreviewPane>
				<PreviewFrame
					ref={frame => (this.frame = frame)}
					src={setSearch(props.previewFrame, { mode: Types.PreviewDocumentMode.Live })}
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
