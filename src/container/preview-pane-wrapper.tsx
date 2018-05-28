import { setSearch } from '../alva-util';
import { PreviewFrame, PreviewPane } from '../components';
import { PreviewDocumentMode } from '../preview';
import * as React from 'react';

export interface PreviewPaneProps {
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
			</PreviewPane>
		);
	}
}
