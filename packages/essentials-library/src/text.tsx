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

export const Text: React.SFC<TextProps> = props => {
	return <span style={style}>{props.text}</span>;
};
