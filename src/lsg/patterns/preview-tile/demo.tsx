import * as React from 'react';
import DemoContainer from '../demo-container';
import PreviewTile from './index';

const DemoPreviewTile: React.StatelessComponent<{}> = (): JSX.Element => (
	<DemoContainer>
		<PreviewTile name="Page Name" />
	</DemoContainer>
);

export default DemoPreviewTile;
