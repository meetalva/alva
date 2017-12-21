import { colors } from '../../colors';
import { fonts } from '../../fonts';
import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

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
	display: block;
	margin-bottom: ${getSpace(Size.L)}px;
`;

const indicatorWidth = 42;
const indicatorHeight = 24;
const indicatorBorderWidth = 1;

const StyledIndicator = styled.span`
	position: relative;
	display: block;
	width: ${indicatorWidth}px;
	height: ${indicatorHeight}px;
	border-radius: ${indicatorHeight / 2}px;
	background: ${colors.grey90.toString()};
	box-sizing: border-box;
	box-shadow: inset 0 0 0 ${indicatorBorderWidth}px ${colors.grey60.toString()};

	&:after {
		content: '';
		display: block;
		width: ${indicatorHeight}px;
		height: ${indicatorHeight}px;
		border: ${indicatorBorderWidth}px solid ${colors.grey60.toString()};
		transform: translateX(0px);
		border-radius: 100%;
		background: ${colors.white.toString()};
		transition: all ease-in-out 0.25s;
		box-sizing: border-box;
	}
	${(props: IndicatorProps) =>
		props.checked
			? `
			background: ${colors.blue40.toString()};
			box-shadow: inset 0 0 0 ${indicatorBorderWidth}px ${colors.blue40.toString()};

			&:after {
				transform: translateX(${indicatorWidth - indicatorHeight}px);
				background: ${colors.white.toString()};
				border-color: ${colors.blue40.toString()};
			}
		`
			: ''};
`;

const StyledLabel = styled.span`
	display: block;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.black.toString()};
	margin-bottom: ${getSpace(Size.XS)}px;
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
