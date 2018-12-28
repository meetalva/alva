import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';

export interface TargetSignalProps {
	visible: boolean;
}

interface StyledTargetSignalProps {
	visible: boolean;
}

const TARGET_SIGNAL_SCALE = (props: StyledTargetSignalProps): number => (props.visible ? 1 : 0);

const StyledTargetSignal = styled.div`
	position: absolute;
	height: ${getSpace(SpaceSize.S)}px;
	width: 100%;
	margin-top: -${getSpace(SpaceSize.XS)}px;
	margin-bottom: -${getSpace(SpaceSize.XS)}px;
	z-index: 10;

	&::before {
		content: '';
		display: block;
		position: absolute;
		height: 6px;
		width: 6px;
		left: 0;
		top: 3px;
		border-radius: 3px;
		background: ${Color.Blue40};
		transform: scale(${TARGET_SIGNAL_SCALE});
		transition: transform 0.2s;
		z-index: 20;
	}

	&::after {
		content: '';
		display: block;
		position: absolute;
		height: 2px;
		width: calc(100% - 6px);
		left: ${getSpace(SpaceSize.XS)};
		top: 5px;
		background: ${Color.Blue40};
		transform: scaleY(${TARGET_SIGNAL_SCALE});
		transition: transform 0.2s;
		z-index: 20;
	}
`;

export const TargetSignal: React.SFC<TargetSignalProps> = ({
	visible,
	...dataPlaceHolder
}): JSX.Element => <StyledTargetSignal {...dataPlaceHolder} visible={visible} />;
