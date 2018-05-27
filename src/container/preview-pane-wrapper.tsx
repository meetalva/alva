import { PreviewFrame, PreviewPane } from '../components';
import * as React from 'react';

export interface PreviewPaneProps {
	previewFrame: string;
}

export class PreviewPaneWrapper extends React.Component<PreviewPaneProps> {
	public render(): JSX.Element {
		const { props } = this;
		return (
			<PreviewPane>
				<PreviewFrame src={props.previewFrame} offCanvas={false} />
			</PreviewPane>
		);
	}
}
