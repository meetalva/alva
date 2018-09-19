import * as React from 'react';

import DemoContainer from '../demo-container';
import { Headline } from '../headline';
import { Space, SpaceSize } from '../space';
import { EditableTitle, EditableTitleState, EditableTitleType } from '.';

export default (): JSX.Element => (
	<DemoContainer title="Preview Tile">
		<Space size={[SpaceSize.L, SpaceSize.XXXL]}>
			<Headline type="primary" order={2}>
				Editable Title
			</Headline>
			<EditableTitle
				focused={true}
				name="Well crafted title"
				nameState={EditableTitleState.Editable}
				category={EditableTitleType.Primary}
				value="Well crafted title"
			/>
		</Space>
		<Space size={[SpaceSize.L, SpaceSize.XXXL]}>
			<Headline type="primary" order={2}>
				Editable Title
			</Headline>
			<EditableTitle
				focused={true}
				name="Well crafted title"
				nameState={EditableTitleState.Editable}
				category={EditableTitleType.Secondary}
				value="Well crafted title"
			/>
		</Space>
	</DemoContainer>
);
