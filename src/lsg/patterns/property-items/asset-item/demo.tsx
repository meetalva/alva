import AssetItem from './index';
import * as React from 'react';
import styled from 'styled-components';

const NOOP = () => {}; // tslint:disable-line no-empty

const StyledDemo = styled.div`
	width: 200px;
	margin-bottom: 20px;
`;

const AssetItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<div>
		<StyledDemo>
			<AssetItem label="Empty" />
		</StyledDemo>
		<StyledDemo>
			<AssetItem
				handleChooseClick={NOOP}
				handleInputChange={NOOP}
				label="Internal"
				imageSrc="http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/light-bulb-icon.png"
			/>
		</StyledDemo>
		<StyledDemo>
			<AssetItem
				handleChooseClick={NOOP}
				handleInputChange={NOOP}
				label="External"
				inputValue="http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/light-bulb-icon.png"
			/>
		</StyledDemo>
	</div>
);

export default AssetItemDemo;
