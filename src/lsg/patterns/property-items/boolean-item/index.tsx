import { colors } from '../../colors';
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

const StyledIndicator = styled.span`
	position: relative;
	display: inline-block;
	width: ${indicatorWidth}px;
	height: ${indicatorHeight}px;
	border-radius: ${indicatorHeight / 2}px;
	box-sizing: border-box;
	box-shadow: inset 0 0 0 1px ${colors.grey80.toString()};
	transition: background 0.1s, box-shadow 0.1s;
	user-select: none;
	&::after {
		position: absolute;
		content: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><path d="M6,6L4.5,7.5L6,6L4.5,4.5L6,6z M6,6l1.5-1.5L6,6l1.5,1.5L6,6z" fill="none" stroke="${colors.grey60.toString()}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" /></svg>');
		display: block;
		width: ${indicatorHeight}px;
		height: ${indicatorHeight}px;
		transform: translateX(0);
		border-radius: 100%;
		background: ${colors.white.toString()};
		transition: transform 0.1s, border-color 0.1s, box-shadow 0.1s;
		box-sizing: border-box;
		box-shadow: inset 0 0 0 1px ${colors.grey60.toString()};
	}
	&:hover {
		&::after {
			box-shadow: inset 0 0 0 1px ${colors.grey60.toString()}, 0.5px 0.5px 3px ${colors.grey60.toString()};
		}
	}
	${(props: IndicatorProps) =>
		props.checked
			? `
			background: ${colors.blue80.toString()};
			box-shadow: inset 0 0 0 0.5px ${colors.blue40.toString()};
			&::after {
				content: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><polyline points="3.8,6 5.2,7.5 8.2,4.5 " fill="none" stroke="${colors.blue40.toString()}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>');
				transform: translateX(${indicatorWidth - indicatorHeight}px);
				background: ${colors.white.toString()};
				border-color: ${colors.blue40.toString()};
				box-shadow: inset 0 0 0 1px ${colors.blue40.toString()};
			}
			&:hover {
				&::after {
					box-shadow: inset 0 0 0 1px ${colors.blue40.toString()}, 0.5px 0.5px 3px ${colors.blue40.toString()};
				}
			}
		`
			: ''};
`;

const StyledInput = styled.input`
	display: none;
`;

export const BooleanItem: React.StatelessComponent<BooleanItemProps> = props => {
	const { className, label, children, checked, onChange } = props;

	return (
		<StyledBooleanItem className={className}>
			<PropertyLabel label={label} />
			<StyledInput onChange={onChange} type="checkbox" />
			<StyledIndicator checked={checked} />
			{children}
		</StyledBooleanItem>
	);
};

export default BooleanItem;
