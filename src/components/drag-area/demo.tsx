import * as React from 'react';
import DemoContainer from '../demo-container';

import { DragArea } from './';

export const DemoDragArea: React.SFC<{}> = (): JSX.Element => (
	<DemoContainer>
		<DragArea>Drag Area</DragArea>
	</DemoContainer>
);

export default DemoDragArea;
