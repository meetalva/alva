import * as React from 'react';

import Copy from '../copy';
import { Headline } from '../headline';
import { PreviewTile } from './index';
import Layout from '../layout';
import Space, { SpaceSize } from '../space';

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
					editable={false}
					focused={false}
					onChange={handleChange}
					name="Page Name"
					named={true}
					value="Editable"
				/>
			</Space>
			<Space size={SpaceSize.S}>
				<PreviewTile
					editable={false}
					focused={true}
					onChange={handleChange}
					name="Focused Page"
					named={true}
					value="Page Name"
				/>
			</Space>
			<Space size={SpaceSize.S}>
				<PreviewTile
					editable={true}
					focused={true}
					onChange={handleChange}
					name="Focused and Editable"
					named={true}
					value="Editable Page Name"
				/>
			</Space>
			<Space size={SpaceSize.S}>
				<PreviewTile
					editable={false}
					focused={false}
					onChange={handleChange}
					name="Page Name"
					named={true}
					value="Editable Page Name"
				/>
			</Space>
			<Space size={SpaceSize.S}>
				<PreviewTile
					editable={false}
					focused={false}
					onChange={handleChange}
					name="Page Name"
					named={true}
					value="Editable Page Name"
				/>
			</Space>
		</Layout>
	</Space>
);
