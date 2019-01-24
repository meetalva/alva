import { Color } from '../colors';
import DemoContainer from '../demo-container';
import { LibraryBox, LibraryBoxState } from './index';
import { Button, ButtonOrder, ButtonSize } from '../button';
import * as React from 'react';

const LibraryBoxDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer>
		<LibraryBox
			color={Color.Black}
			image="http://zwainhaus.com/artanddesign/landscape_03.jpg"
			name="Wireframe Kit"
			description="Simple wireframing kit to kickstart your product ideas."
			state={LibraryBoxState.Idle}
			install={
				<Button
					order={ButtonOrder.Primary}
					size={ButtonSize.Medium}
					color={Color.Grey20}
					inverted
				>
					Already installed
				</Button>
			}
			version="v1"
		/>
	</DemoContainer>
);

export default LibraryBoxDemo;
