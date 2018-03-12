import * as React from 'react';

import Copy from '../copy';
import { Headline } from '../headline';
import { PreviewTile } from './index';
import Layout from '../layout';
import Space, { Size } from '../space';

const handleChange = (e: React.ChangeEvent<HTMLInputElement>): string => e.target.value;

const currentDate = new Date();

export const DemoPreviewTile = (): JSX.Element => (
	<Space size={[Size.L, Size.XXXL]}>
		<Space size={[0, 0, Size.S, 0]}>
			<Headline order={2}>Project Name</Headline>
		</Space>
		<Space size={[0, 0, Size.XXL, 0]}>
			<Copy>Last Saved {currentDate.toDateString()}</Copy>
		</Space>
		<Layout>
			<Space size={Size.S}>
				<PreviewTile
					editable={false}
					focused={false}
					onChange={handleChange}
					name="Page Name"
					value="Editable"
				/>
			</Space>
			<Space size={Size.S}>
				<PreviewTile
					editable={false}
					focused={true}
					onChange={handleChange}
					name="Focused Page"
					value="Page Name"
				/>
			</Space>
			<Space size={Size.S}>
				<PreviewTile
					editable={true}
					focused={true}
					onChange={handleChange}
					name="Focused and Editable"
					value="Editable Page Name"
				/>
			</Space>
			<Space size={Size.S}>
				<PreviewTile
					editable={false}
					focused={false}
					onChange={handleChange}
					name="Page Name"
					value="Editable Page Name"
				/>
			</Space>
			<Space size={Size.S}>
				<PreviewTile
					editable={false}
					focused={false}
					onChange={handleChange}
					name="Page Name"
					value="Editable Page Name"
				/>
			</Space>
		</Layout>
	</Space>
);
