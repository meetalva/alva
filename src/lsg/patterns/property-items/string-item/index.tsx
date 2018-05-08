import { colors } from '../../colors';
import { fonts } from '../../fonts';
import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

export interface StringItemProps {
	className?: string;
	label: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	value?: string;
}

const StyledStringItem = styled.label`
	width: 100%;
	display: flex;
	align-content: center;
	justify-content: space-between;
	margin-bottom: ${getSpace(SpaceSize.M)}px;
`;

const StyledLabel = styled.span`
	display: inline-block;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey50.toString()};
	width: 30%;
	padding: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px 0 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis
	user-select: none;
	cursor: default;
`;

const StyledInput = styled.input`
	display: inline-block;
	box-sizing: border-box;
	width: 70%;
	height: 30px;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.S)}px;
	border: 1px solid ${colors.grey90.toString()};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	border-radius: 3px;
	background: ${colors.white.toString()};
	color: ${colors.grey20.toString()};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 15px;
	text-overflow: ellipsis;
	transition: border-color 0.1s, box-shadow 0.1s, color 0.1s;
	::-webkit-input-placeholder {
		color: ${colors.grey60.toString()};
	}
	&:hover {
		color: ${colors.black.toString()};
		border-color: ${colors.grey60.toString()};
	}
	&:focus {
		outline: none;
		border-color: ${colors.blue40.toString()};
		color: ${colors.black.toString()};
		box-shadow: 0 0 3px ${colors.blue.toString('rgb', { alpha: 0.4 })};
	}
`;

export const StringItem: React.StatelessComponent<StringItemProps> = props => {
	const { className, onChange, onBlur, label, value } = props;

	return (
		<StyledStringItem className={className}>
			<StyledLabel title={label}>{label}</StyledLabel>
			<StyledInput
				onChange={onChange}
				onBlur={onBlur}
				type="textarea"
				value={value}
				placeholder="…"
			/>
		</StyledStringItem>
	);
};

export default StringItem;
