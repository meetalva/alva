import { colors } from '../../colors';
import { fonts } from '../../fonts';
import * as React from 'react';
import styled from 'styled-components';
import { getSpace, Size } from '../../space';

export interface BooleanItemProps {
	label: string;
	checked?: boolean;
	className?: string;
	handleChange?: React.ChangeEventHandler<HTMLElement>;
}

interface IndicatorProps {
	checked?: boolean;
}

const StyledBooleanItem = styled.div`
	width: 100%;
`;

const StyledLabelWrapper = styled.label`
	display: flex;
	justify-content: space-between;
	align-items: center;

    margin-bottom: ${getSpace(Size.XXL)}px;
`;

const indicatorWidth = 18;
const indicatorHeight = 8;
const indicatorBorderWidth = 1;

const StyledIndicator = styled.span`
	position: relative;
	display: inline-block;
	width: ${indicatorWidth}px;
	height: ${indicatorHeight}px;
	border-radius: 5px;
	box-sizing: border-box;
	border: ${indicatorBorderWidth}px solid transparent;
	box-shadow: 0 0 0 ${indicatorBorderWidth}px ${colors.grey70.toString()};
	&::after {
		content: '';
		display: block;
		width: 6px;
		height: 6px;
		transform: translateX(0px);
		border-radius: 100%;
		background: ${colors.grey70.toString()};
		transition: transform ease-in-out 0.5s;
	}
	${(props: IndicatorProps) =>
		props.checked
			? `
			background: ${colors.blue.toString()};
			border-color: ${colors.blue.toString()};
			box-shadow: 0 0 0 ${indicatorBorderWidth}px ${colors.blue.toString()};
			&::after {
				transform: translateX(${indicatorWidth / 2 + indicatorBorderWidth}px);
				background: ${colors.white.toString()};
			}
		`
			: ''};
`;

const StyledLabel = styled.span`
	font-size: 14px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey70.toString()};
`;

const StyledInput = styled.input`
	display: none;
`;

export const BooleanItem: React.StatelessComponent<BooleanItemProps> = props => {
	const { className, label, children, checked, handleChange } = props;

	return (
		<StyledBooleanItem className={className}>
			<StyledLabelWrapper>
				<StyledLabel>{label}</StyledLabel>
				<StyledInput onChange={handleChange} type="checkbox" />
				<StyledIndicator checked={checked} />
			</StyledLabelWrapper>
			{children}
		</StyledBooleanItem>
	);
};

export default BooleanItem;
