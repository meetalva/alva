import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';
import { IconSize } from '../icons';

export interface SpinnerProps {
	size: IconSize;
}

const Wrapper = styled.div`
	width: ${(props: SpinnerProps) => props.size}px;
	height: ${(props: SpinnerProps) => props.size}px;

	animation: intro 0.1s 0.2s ease-out both;
	@keyframes intro {
		from {
			transform: scale(0.5);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
`;

const StyledSpinner = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;

	animation: spin 2s linear infinite;
	@keyframes spin {
		100% {
			transform: rotate(360deg);
		}
	}
`;

const StyledInnerSpinner = styled.div`
	height: 100%;
	width: 100%;
	box-sizing: border-box;

	border-radius: 50%;
	border: 1.5px solid ${Color.White};
	border-left-color: transparent;

	animation: spin 1.5s ease infinite;
`;

export const Spinner: React.StatelessComponent<SpinnerProps> = props => (
	<Wrapper size={props.size}>
		<StyledSpinner>
			<StyledInnerSpinner />
		</StyledSpinner>
	</Wrapper>
);
