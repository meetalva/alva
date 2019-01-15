import * as React from 'react';

export interface TextProps {
	/**
	 * @name Text
	 * @default Text
	 */
	text: string;
}

const style = {
	display: 'inline-block'
};

/**
 * @name Text
 * @description for Headlines, Copy and more
 * @icon Type
 * @patternType synthetic:text
 */
export const Text: React.SFC<TextProps> = props => {
	return <span style={style}>{props.text}</span>;
};
