import DemoContainer from '../demo-container';
import { Image } from './index';
import * as React from 'react';

const ImageDemo = () => {
	const image = {
		alt: 'Gourgeously crafted alternate text',
		src: 'https://meetalva.github.io/media/alva.svg'
	};
	return (
		<DemoContainer title="Image">
			<Image alt={image.alt} src={image.src} />
		</DemoContainer>
	);
};

export default ImageDemo;
