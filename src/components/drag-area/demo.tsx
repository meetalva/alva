import * as React from 'react';
import DemoContainer from '../demo-container';

import { DragArea } from './';

export const DemoDragArea: React.SFC<{}> = (): JSX.Element => (
	<DemoContainer>
		<DragArea
			onDragStart={e => console.log(e.target)}
			onDragLeave={e => console.log(e)}
			onDragOver={e => console.log(e)}
			onDrop={e => console.log(e)}
		>
			<div draggable>Drag Area Element</div>
		</DragArea>
	</DemoContainer>
);

export default DemoDragArea;
