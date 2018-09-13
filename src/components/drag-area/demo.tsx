import * as React from 'react';
import DemoContainer from '../demo-container';

import { DragArea, DragAreaAnchors } from './index';

export const DemoDragArea: React.SFC<{}> = (): JSX.Element => (
	<DemoContainer>
		<DragArea
			anchors={{
				[DragAreaAnchors.element]: '12343',
				[DragAreaAnchors.content]: '11111'
			}}
			onDragStart={e => e}
			onDragLeave={e => e}
			onDragOver={e => e}
			onDrop={e => e}
			onDragEnter={e => e}
		>
			<div draggable>Drag Area Element</div>
		</DragArea>
	</DemoContainer>
);

export default DemoDragArea;
