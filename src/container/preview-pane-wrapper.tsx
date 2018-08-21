import { setSearch } from '../alva-util';
import { PreviewFrame, PreviewPane } from '../components';
import { Copy, CopySize } from '../components/copy';
import { IconSize } from '../components/icons';
import { Overlay } from '../components/overlay';
import { PreviewDocumentMode } from '../preview';
import * as React from 'react';
import { Layout } from 'react-feather';
import { Space, SpaceSize } from '../components/space';

export interface PreviewPaneProps {
	isDragging: boolean;
	previewFrame: string;
}

export class PreviewPaneWrapper extends React.Component<PreviewPaneProps> {
	public render(): JSX.Element {
		const { props } = this;

		return (
			<PreviewPane>
				<PreviewFrame
					src={setSearch(props.previewFrame, { mode: PreviewDocumentMode.Live })}
					offCanvas={false}
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
