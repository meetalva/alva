import styled from 'styled-components';
import * as Space from '../space';
import { Color } from '../colors';

export const Item = styled.div`
	display: flex;
	justify-content: center;
	padding: ${Space.getSpace(Space.SpaceSize.XS + Space.SpaceSize.XXS)}px
		${Space.getSpace(Space.SpaceSize.S) * 2}px;
	cursor: default;

	&:hover {
		background: ${Color.White};
	}

	&:active {
		background: ${Color.Grey90};
	}
`;

export const ItemSymbol = styled.div`
	display: flex;
	justify-content: center;
	align-items: start;
	flex: 0 0 15px;
	margin-right: 10px;
	margin-top: ${Space.getSpace(Space.SpaceSize.XXS)}px;
`;

export const ItemContent = styled.div`
	flex: 1 1 100%;
	width: calc(100% - 40px);
`;

export const ItemTitle = styled.div`
	flex: 1 1 100%;
`;

export const ItemDetails = styled.div`
	flex: 1 1 100%;
	overflow: hidden;
`;
