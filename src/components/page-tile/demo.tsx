import * as React from 'react';

import DemoContainer from '../demo-container';
import { EditableTitle, EditableTitleState, EditableTitleType } from '../editable-title';
import { Layout, LayoutDirection } from '../layout';
import { Space, SpaceSize } from '../space';
import { PageTile } from '.';

const handleChange = (e: React.ChangeEvent<HTMLInputElement>): string => e.target.value;

export default (): JSX.Element => (
	<DemoContainer title="Page Tile">
		<Layout direction={LayoutDirection.Column}>
			<Space size={[SpaceSize.S, SpaceSize.S, 0]}>
				<PageTile
					focused={false}
					highlighted={false}
					isDroppable={{ back: false, next: false }}
					onChange={handleChange}
				>
					<EditableTitle
						category={EditableTitleType.Primary}
						focused={false}
						name="foo"
						nameState={EditableTitleState.Editable}
						value="foo"
					/>
				</PageTile>
			</Space>
			<Space size={[SpaceSize.S, SpaceSize.S, 0]}>
				<PageTile
					focused={false}
					highlighted={true}
					isDroppable={{ back: true, next: false }}
					onChange={handleChange}
				>
					<EditableTitle
						category={EditableTitleType.Primary}
						focused={false}
						name="foo"
						nameState={EditableTitleState.Editable}
						value="foo"
					/>
				</PageTile>
			</Space>
			<Space size={[SpaceSize.S, SpaceSize.S, 0]}>
				<PageTile
					focused={true}
					highlighted={true}
					isDroppable={{ back: false, next: true }}
					onChange={handleChange}
				>
					<EditableTitle
						category={EditableTitleType.Primary}
						focused={false}
						name="foo"
						nameState={EditableTitleState.Editable}
						value="foo"
					/>
				</PageTile>
			</Space>
		</Layout>
	</DemoContainer>
);
