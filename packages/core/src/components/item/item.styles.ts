import styled from 'styled-components';
import * as Space from '../space';

export const Item = styled.div`
	display: flex;
	justify-content: center;
	padding: ${Space.getSpace(Space.SpaceSize.S)}px ${Space.getSpace(Space.SpaceSize.S) * 2}px;

	&:first-child {
		padding-top: ${Space.getSpace(Space.SpaceSize.S) * 2}px;
	}
	&:last-child {
		padding-bottom: ${Space.getSpace(Space.SpaceSize.S) * 2}px;
	}
`;

export const ItemSymbol = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	flex: 0 0 15px;
	margin-right: 10px;
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
