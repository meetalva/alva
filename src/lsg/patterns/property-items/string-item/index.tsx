import { colors } from '../../colors';
import { fonts } from '../../fonts';
import { getSpace, Size } from '../../space/index';
import * as React from 'react';
import styled from 'styled-components';

export interface StringItemProps {
	label: string;
	value?: string;
	className?: string;
	handleChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const StyledStringItem = styled.div`
	width: 100%;
`;

const StyledLabel = styled.span`
	display: block;
	margin-bottom: ${getSpace(Size.XS)}px;
	font-size: 14px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey70.toString()};
`;

const StyledInput = styled.input`
	display: block;
	box-sizing: border-box;
	width: 100%;
	text-overflow: ellipsis;
`;

export const StringItem: React.StatelessComponent<StringItemProps> = props => {
	const { className, handleChange, label, value } = props;

	return (
		<StyledStringItem className={className}>
			<label>
				<StyledLabel>{label}</StyledLabel>
				<StyledInput onChange={handleChange} type="textarea" defaultValue={value} />
			</label>
		</StyledStringItem>
	);
};

export default StringItem;
