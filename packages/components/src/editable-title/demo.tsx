import * as React from 'react';

import DemoContainer from '../demo-container';
import { Headline } from '../headline';
import { Space, SpaceSize } from '../space';
import { EditableTitle, EditableTitleState } from '.';

export default (): JSX.Element => (
	<DemoContainer title="Preview Tile">
		<Space size={[SpaceSize.L, SpaceSize.XXXL]}>
			<Headline order={2}>Editable Title</Headline>
			<EditableTitle
				name="Well crafted title"
				state={EditableTitleState.Editable}
				value="Well crafted title"
			/>
		</Space>
		<Space size={[SpaceSize.L, SpaceSize.XXXL]}>
			<Headline order={2}>Editable Title</Headline>
			<EditableTitle
				name="Well crafted title"
				state={EditableTitleState.Editable}
				value="Well crafted title"
			/>
		</Space>
	</DemoContainer>
);
