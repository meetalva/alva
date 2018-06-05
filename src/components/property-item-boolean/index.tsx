import { Color } from '../colors';
import { Icon, IconName, IconSize } from '../icons';
import { PropertyItem } from '../property-item';
import * as React from 'react';
import styled from 'styled-components';

export interface PropertyItemBooleanProps {
	checked?: boolean;
	className?: string;
	description?: string;
	label: string;
	onChange?: React.ChangeEventHandler<HTMLElement>;
}

interface IndicatorProps {
	checked: boolean;
}

const INDICATOR_WIDTH = 30;
const INDICATOR_HEIGHT = 30;

const INDICATOR_TRACK_WIDTH = 48;
const INDICATOR_TRACK_HEIGHT = INDICATOR_HEIGHT;

const StyledIndicatorKnob = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	width: ${INDICATOR_HEIGHT}px;
	height: ${INDICATOR_HEIGHT}px;
	margin: -1px 0 0 -1px;
	transform: translateX(0);
	border-radius: 100%;
	background: ${Color.White};
	transition: transform 0.1s, border-color 0.1s, box-shadow 0.1s;
	box-sizing: border-box;
	border: 1px solid ${(props: IndicatorProps) => (props.checked ? Color.Blue40 : Color.Grey60)};
	background: ${Color.White};
	transform: translateX(
		${props => (props.checked ? `calc(${INDICATOR_TRACK_WIDTH}px - 100%)` : 0)}
	);

	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
`;

const StyledIndicatorTrack = styled.div`
	position: relative;
	display: inline-block;
	width: ${INDICATOR_TRACK_WIDTH}px;
	height: ${INDICATOR_TRACK_HEIGHT}px;
	border-radius: ${INDICATOR_WIDTH / 2}px;
	box-sizing: border-box;
	border: 1px solid ${Color.Grey80};
	transition: background-color 0.1s, box-shadow 0.1s;
	user-select: none;

	&:hover {
		${StyledIndicatorKnob} {
			border-color: ${Color.Grey60};
			box-shadow: 0.5px 0.5px 3px ${Color.Grey60};

			${(props: IndicatorProps) =>
				props.checked
					? `
				border-color: ${Color.Blue40};
				box-shadow: 0.5px 0.5px 3px ${Color.Blue40};
			`
					: ''};
		}
	}

	${(props: IndicatorProps) =>
		props.checked
			? `
		background: ${Color.Blue80};
		border-color: ${Color.Blue40};
	`
			: ''};
`;

const StyledIcon = styled(Icon)`
	transform: translate(-0.5px, -0.5px); // fix to align icon properly
`;

const StyledInput = styled.input`
	display: none;
`;

export const PropertyItemBoolean: React.StatelessComponent<PropertyItemBooleanProps> = props => {
	const icon = props.checked ? IconName.Check : IconName.Uncheck;
	const color = props.checked ? Color.Blue40 : Color.Grey60;

	return (
		<PropertyItem description={props.description} label={props.label}>
			<StyledInput onChange={props.onChange} checked={props.checked} type="checkbox" />
			<StyledIndicatorTrack checked={props.checked || false}>
				<StyledIndicatorKnob checked={props.checked || false}>
					<StyledIcon name={icon} size={IconSize.XS} color={color} />
				</StyledIndicatorKnob>
			</StyledIndicatorTrack>
		</PropertyItem>
	);
};
