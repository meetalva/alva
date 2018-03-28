import * as React from 'react';

export interface PlaceholderProps {
	src?: string;
}

export const Placeholder: React.StatelessComponent<PlaceholderProps> = props => {
	if (props.src === undefined || props.src === null || props.src === '') {
		return null;
	}

	return <img src={props.src} />;
};
