import * as React from 'react';
import * as Styles from './update-badge.styles';

export interface UpdateBadgeProps {
	children?: React.ReactNode;
	title?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

export const UpdateBadge: React.SFC<UpdateBadgeProps> = props => {
	return (
		<Styles.UpdateBadge title={props.title} onClick={props.onClick}>
			<Styles.UpdateIcon />
			{props.children}
		</Styles.UpdateBadge>
	);
};
