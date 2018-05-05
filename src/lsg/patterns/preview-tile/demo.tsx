import * as React from 'react';

import Copy from '../copy';
import { Headline } from '../headline';
import Layout from '../layout';
import Space, { SpaceSize } from '../space';
import { EditState, PreviewTile } from '.';

const handleChange = (e: React.ChangeEvent<HTMLInputElement>): string => e.target.value;

const currentDate = new Date();

export const DemoPreviewTile = (): JSX.Element => (
	<Space size={[SpaceSize.L, SpaceSize.XXXL]}>
		<Space size={[0, 0, SpaceSize.S, 0]}>
			<Headline order={2}>Project Name</Headline>
		</Space>
		<Space size={[0, 0, SpaceSize.XXL, 0]}>
			<Copy>Last Saved {currentDate.toDateString()}</Copy>
		</Space>
		<Layout>
			<Space size={SpaceSize.S}>
				<PreviewTile
					focused={false}
					onChange={handleChange}
					name="Editable"
					nameState={EditState.Editable}
				/>
			</Space>
			<Space size={SpaceSize.S}>
				<PreviewTile
					focused={true}
					onChange={handleChange}
					name="Page Name"
					nameState={EditState.Editable}
				/>
			</Space>
			<Space size={SpaceSize.S}>
				<PreviewTile
					focused={true}
					onChange={handleChange}
					name="Editable Page Name"
					nameState={EditState.Editable}
				/>
			</Space>
			<Space size={SpaceSize.S}>
				<PreviewTile
					focused={false}
					onChange={handleChange}
					name="Editable Page Name"
					nameState={EditState.Editable}
				/>
			</Space>
			<Space size={SpaceSize.S}>
				<PreviewTile
					focused={false}
					onChange={handleChange}
					name="Editable Page Name"
					nameState={EditState.Editable}
				/>
			</Space>
		</Layout>
	</Space>
);
