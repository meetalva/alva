import { PropertyItemAsset, PropertyItemAssetInputType } from '.';
import DemoContainer from '../demo-container';
import * as React from 'react';

const NOOP = () => {}; // tslint:disable-line no-empty

const AssetItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Asset Item">
		<PropertyItemAsset
			label="Empty"
			inputType={PropertyItemAssetInputType.File}
			inputValue=""
			imageSrc=""
		/>
		<PropertyItemAsset
			onChooseClick={NOOP}
			onClearClick={NOOP}
			onInputChange={NOOP}
			inputType={PropertyItemAssetInputType.File}
			label="Internal"
			imageSrc="http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/light-bulb-icon.png"
		/>
		<PropertyItemAsset
			onChooseClick={NOOP}
			onClearClick={NOOP}
			onInputChange={NOOP}
			inputType={PropertyItemAssetInputType.Url}
			label="External"
			inputValue="http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/light-bulb-icon.png"
			imageSrc="http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/light-bulb-icon.png"
		/>
	</DemoContainer>
);

export default AssetItemDemo;
