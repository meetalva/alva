import * as React from 'react';

export interface ElementButtonProps {
	onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const ElementButton: React.SFC<ElementButtonProps> = props => (
	<button onClick={props.onClick}>Show element pane</button>
);
