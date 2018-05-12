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

const StyledStringItem = styled.div`
	width: 100%;
`;

const StyledLabel = styled.span`
	display: block;
	margin-bottom: ${getSpace(SpaceSize.XS)}px;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey36.toString()};
`;

const StyledInput = styled.input`
	display: block;
	box-sizing: border-box;
	width: 100%;
	text-overflow: ellipsis;
	border: none;
	border-bottom: 1px solid transparent;
	background: transparent;
	font-family: ${fonts().NORMAL_FONT};
	font-size: 15px;
	padding-bottom: ${getSpace(SpaceSize.M) / 2}px;
	color: ${colors.grey36.toString()};
	margin-bottom: ${getSpace(SpaceSize.L)}px;
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
		border-color: ${colors.blue40.toString()};
		color: ${colors.black.toString()};
	}
`;

export const StringItem: React.StatelessComponent<StringItemProps> = props => {
	const { className, onChange, onBlur, label, value } = props;

	return (
		<StyledStringItem className={className}>
			<label>
				<StyledLabel>{label}</StyledLabel>
				<StyledInput
					onChange={onChange}
					onBlur={onBlur}
					type="text"
					value={value || ''}
					placeholder="Type in"
				/>
			</label>
		</StyledStringItem>
	);
};

export default StringItem;
