import { colors } from '../../colors';
import { Icon, IconName, IconSize } from '../../icons';
import { PropertyLabel } from '../property-label';
import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

export interface BooleanItemProps {
	checked?: boolean;
	className?: string;
	label: string;
	onChange?: React.ChangeEventHandler<HTMLElement>;
}

interface IndicatorProps {
	checked?: boolean;
}

const StyledBooleanItem = styled.label`
	display: flex;
	align-items: center;
	width: 100%;
	margin-bottom: ${getSpace(SpaceSize.M)}px;
`;

const indicatorWidth = 48;
const indicatorHeight = 30;

const StyledIndicatorKnob = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	width: ${indicatorHeight}px;
	height: ${indicatorHeight}px;
	margin: -1px 0 0 -1px;
	transform: translateX(0);
	border-radius: 100%;
	background: ${colors.white.toString()};
	transition: transform 0.1s, border-color 0.1s, box-shadow 0.1s;
	box-sizing: border-box;
	border: 1px solid ${colors.grey60.toString()};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}

	${(props: IndicatorProps) =>
		props.checked
			? `
		transform: translateX(${indicatorWidth - indicatorHeight}px);
		background: ${colors.white.toString()};
		border-color: ${colors.blue40.toString()};
	`
			: ''};
`;

const StyledIndicator = styled.span`
	position: relative;
	display: inline-block;
	width: ${indicatorWidth}px;
	height: ${indicatorHeight}px;
	border-radius: ${indicatorHeight / 2}px;
	box-sizing: border-box;
	border: 1px solid ${colors.grey80.toString()};
	transition: background 0.1s, box-shadow 0.1s;
	user-select: none;

	&:hover {
		${StyledIndicatorKnob} {
			border-color: ${colors.grey60.toString()};
			box-shadow: 0.5px 0.5px 3px ${colors.grey60.toString()};

			${(props: IndicatorProps) =>
				props.checked
					? `
				border-color: ${colors.blue40.toString()};
				box-shadow: 0.5px 0.5px 3px ${colors.blue40.toString()};
			`
					: ''};
		}
	}

	${(props: IndicatorProps) =>
		props.checked
			? `
		background: ${colors.blue80.toString()};
		border-color: ${colors.blue40.toString()};
	`
			: ''};
`;

const StyledIcon = styled(Icon)`
	transform: translate(-0.5px, -0.5px); // fix to align icon properly
`;

const StyledInput = styled.input`
	display: none;
`;

export const BooleanItem: React.StatelessComponent<BooleanItemProps> = props => {
	const { className, label, children, checked, onChange } = props;
	const icon = checked ? IconName.Check : IconName.Uncheck;
	const color = checked ? colors.blue40 : colors.grey60;

	return (
		<StyledBooleanItem className={className}>
			<PropertyLabel label={label} />
			<StyledInput onChange={onChange} checked={checked} type="checkbox" />
			<StyledIndicator checked={checked}>
				<StyledIndicatorKnob checked={checked}>
					<StyledIcon name={icon} size={IconSize.XS} color={color} />
				</StyledIndicatorKnob>
			</StyledIndicator>
			{children}
		</StyledBooleanItem>
	);
};

export default BooleanItem;
