import { AssetItem, AssetPropertyInputType } from '.';
import DemoContainer from '../../demo-container';
import * as React from 'react';

const NOOP = () => {}; // tslint:disable-line no-empty

const AssetItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Asset Item">
		<AssetItem label="Empty" inputType={AssetPropertyInputType.File} inputValue="" imageSrc="" />
		<AssetItem
			onChooseClick={NOOP}
			onClearClick={NOOP}
			onInputChange={NOOP}
			inputType={AssetPropertyInputType.File}
			label="Internal"
			imageSrc="http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/light-bulb-icon.png"
		/>
		<AssetItem
			onChooseClick={NOOP}
			onClearClick={NOOP}
			onInputChange={NOOP}
			inputType={AssetPropertyInputType.Url}
			label="External"
			inputValue="http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/light-bulb-icon.png"
			imageSrc="http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/light-bulb-icon.png"
		/>
	</DemoContainer>
);

export default AssetItemDemo;
