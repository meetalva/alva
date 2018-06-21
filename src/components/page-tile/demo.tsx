import * as React from 'react';

import { Copy } from '../copy';
import DemoContainer from '../demo-container';
import { Headline } from '../headline';
import { Layout } from '../layout';
import { Space, SpaceSize } from '../space';
import { PageTile } from '.';

const handleChange = (e: React.ChangeEvent<HTMLInputElement>): string => e.target.value;

const currentDate = new Date();

export default (): JSX.Element => (
	<DemoContainer title="Page Tile">
		<Space size={[SpaceSize.L, SpaceSize.XXXL]}>
			<Space size={[0, 0, SpaceSize.S, 0]}>
				<Headline order={2}>Project Name</Headline>
			</Space>
			<Space size={[0, 0, SpaceSize.XXL, 0]}>
				<Copy>Last Saved {currentDate.toDateString()}</Copy>
			</Space>
			<Layout>
				<Space size={SpaceSize.S}>
					<PageTile
						focused={false}
						highlighted={false}
						isdragging={false}
						onChange={handleChange}
					/>
				</Space>
				<Space size={SpaceSize.S}>
					<PageTile
						focused={false}
						highlighted={true}
						isdragging={false}
						onChange={handleChange}
					/>
				</Space>
				<Space size={SpaceSize.S}>
					<PageTile
						focused={true}
						highlighted={true}
						isdragging={false}
						onChange={handleChange}
					/>
				</Space>
			</Layout>
		</Space>
	</DemoContainer>
);
