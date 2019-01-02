import * as React from 'react';
import * as S from './item.styles';

export interface ItemProps {
	icon: React.ReactNode;
	title: React.ReactNode;
	details: React.ReactNode;
}

export function Item(props: ItemProps) {
	return (
		<S.Item>
			<S.ItemSymbol>{props.icon}</S.ItemSymbol>
			<S.ItemContent>
				<S.ItemTitle>{props.title}</S.ItemTitle>
				<S.ItemDetails>{props.details}</S.ItemDetails>
			</S.ItemContent>
		</S.Item>
	);
}
