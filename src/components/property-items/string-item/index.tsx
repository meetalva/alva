import { colors } from '../../colors';
import { fonts } from '../../fonts';
import { PropertyLabel } from '../property-label';
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
	display: flex;
	align-items: center;
	width: 100%;
	margin-bottom: ${getSpace(SpaceSize.S)}px;
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
			<label>
				<PropertyLabel label={label} />
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
