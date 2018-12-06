import * as React from 'react';
import DemoContainer from '../demo-container';
import { PropertyDetails } from './';
import { Headline } from '../headline';
import { Copy } from '../copy';
import { Space, SpaceSize } from '../space';

const DemoOverlay: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer>
		<PropertyDetails
			open={true}
			onClick={() => {}}
			summary={
				<div>
					<Headline type="primary" order={4}>
						Code Properties
					</Headline>
					<Space sizeBottom={SpaceSize.XS} />
					<Copy>This component accepts code properties</Copy>
				</div>
			}
		>
			Children Content
		</PropertyDetails>
	</DemoContainer>
);

export default DemoOverlay;
