import { colors } from '../../colors';
import { fonts } from '../../fonts';
import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

export interface StringItemProps {
	className?: string;
	handleBlur?: React.FocusEventHandler<HTMLInputElement>;
	handleChange?: React.ChangeEventHandler<HTMLInputElement>;
	label: string;
	value?: string;
}

const StyledStringItem = styled.div`
	width: 100%;
`;

const StyledLabel = styled.span`
	display: block;
	margin-bottom: ${getSpace(Size.XXS)}px;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey36.toString()};
`;

const StyledInput = styled.input`
	display: block;
	box-sizing: border-box;
	width: 100%;
	padding: ${getSpace(Size.XS)}px;
	margin-bottom: ${getSpace(Size.M)}px;

	border: 0.5px solid ${colors.grey90.toString()};
	border-radius: 1px;

	background: ${colors.white.toString()};
	color: ${colors.black.toString()};

	font-family: ${fonts().NORMAL_FONT};
	font-size: 12px;
	text-overflow: ellipsis;

	transition: all 0.2s;

	::-webkit-input-placeholder {
		color: ${colors.grey60.toString()};
	}

	&:hover {
		color: ${colors.black.toString()};
		border-color: ${colors.grey60.toString()};
	}

	&:focus {
		outline: none;
		border-color: ${colors.blue.toString()};
		color: ${colors.black.toString()};
		box-shadow: 0 0 3px ${colors.blue40.toString()};
	}
`;

export const StringItem: React.StatelessComponent<StringItemProps> = props => {
	const { className, handleChange, handleBlur, label, value } = props;

	return (
		<StyledStringItem className={className}>
			<label>
				<StyledLabel>{label}</StyledLabel>
				<StyledInput
					onChange={handleChange}
					onBlur={handleBlur}
					type="textarea"
					value={value}
					placeholder="Type in"
				/>
			</label>
		</StyledStringItem>
	);
};

export default StringItem;
