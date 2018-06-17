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
	public render(): JSX.Element {
		const props = this.props as PreviewPaneProps & WithStore;
		const app = props.store.getApp();

		return (
			<PreviewPane>
				<PreviewFrame
					src={setSearch(props.previewFrame, { mode: Types.PreviewDocumentMode.Live })}
					offCanvas={false}
					onMouseEnter={() => app.setHoverArea(Types.HoverArea.Preview)}
					onMouseLeave={() => {
						props.store.unsetHighlightedElement();
						props.store.unsetHighlightedElementContent();
						app.setHoverArea(Types.HoverArea.Chrome);
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
