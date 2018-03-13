import * as React from 'react';

import Copy from '../copy';
import Layout from '../layout';
import { Headline } from '../headline';
import PreviewTile from './index';
import Space, { Size } from '../space';

const currentDate = new Date();
const DemoPreviewTile: React.StatelessComponent<{}> = (): JSX.Element => (
	<Space size={[Size.L, Size.XXXL]}>
		<Space size={[0, 0, Size.S, 0]}>
			<Headline order={2}>Project Name</Headline>
		</Space>
		<Space size={[0, 0, Size.XXL, 0]}>
			<Copy>Last Saved {currentDate.toDateString()}</Copy>
		</Space>
		<Layout>
			<Space size={Size.S}>
				<PreviewTile name="Page Name" />
			</Space>
			<Space size={Size.S}>
				<PreviewTile name="Page Name" />
			</Space>
			<Space size={Size.S}>
				<PreviewTile name="Page Name" />
			</Space>
			<Space size={Size.S}>
				<PreviewTile name="Page Name" />
			</Space>
			<Space size={Size.S}>
				<PreviewTile name="Page Name" />
			</Space>
		</Layout>
	</Space>
);

export default DemoPreviewTile;
