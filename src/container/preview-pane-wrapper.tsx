import { setSearch } from '../alva-util';
import { PreviewFrame, PreviewPane } from '../components';
import { PreviewDocumentMode } from '../preview';
import * as React from 'react';

import { Copy, CopySize } from '../components/copy';
import { Icon, IconName, IconSize } from '../components/icons';
import { Overlay } from '../components/overlay';
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
						<Icon name={IconName.Robo} size={IconSize.S} />
					</Space>
					<Copy size={CopySize.M}>Drop the component on the left element list</Copy>
				</Overlay>
			</PreviewPane>
		);
	}
}
