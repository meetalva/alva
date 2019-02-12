import * as React from 'react';
import styled from '@emotion/styled';

export interface AppFrameProps {
	children?: React.ReactNode;
}

export const AppFrame = styled.div`
	box-shadow: rgba(0, 0, 0, 0.2) 0 0 100px;
	position: relative;
	z-index: 10;
	border-radius: 6px;
	margin: 0 auto;
	text-align: center;
	overflow: hidden;
`;
