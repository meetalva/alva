import * as React from 'react';

import DemoContainer from '../demo-container';
import { Headline } from '../headline';
import { Space, SpaceSize } from '../space';
import { EditableTitle, EditState } from '.';

export default (): JSX.Element => (
	<DemoContainer title="Preview Tile">
		<Space size={[SpaceSize.L, SpaceSize.XXXL]}>
			<Headline order={2}>Editable Title</Headline>
			<EditableTitle
				focused={true}
				name="Well crafted title"
				nameState={EditState.Editable}
				value="Well crafted title"
			/>
		</Space>
	</DemoContainer>
);
