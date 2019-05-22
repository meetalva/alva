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
 * @description plain text for everything
 * @icon Type
 * @patternType synthetic:text
 */
export const Text: React.SFC<TextProps> = props => {
	return <span style={style}>{props.text}</span>;
};
