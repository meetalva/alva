import { Color } from '../../colors';
import { fonts } from '../../fonts';
import { PropertyDescription } from '../property-description';
import { PropertyLabel } from '../property-label';
import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

export interface StringItemProps {
	className?: string;
	description?: string;
	label: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	placeholder?: string;
	value?: string;
}

const StyledStringItem = styled.label`
	display: block;
	margin-bottom: ${getSpace(SpaceSize.S)}px;
`;

const StyledContainer = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	box-sizing: border-box;
`;

const StyledInput = styled.input`
	display: inline-block;
	box-sizing: border-box;
	width: 70%;
	height: 30px;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.S)}px;
	border: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	border-radius: 3px;
	background: ${Color.White};
	color: ${Color.Grey20};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 15px;
	text-overflow: ellipsis;
	transition: border-color 0.1s, box-shadow 0.1s, color 0.1s;
	::-webkit-input-placeholder {
		color: ${Color.Grey60};
	}
	&:hover {
		color: ${Color.Black};
		border-color: ${Color.Grey60};
	}
	&:focus {
		outline: none;
		border-color: ${Color.Blue40};
		color: ${Color.Black};
		box-shadow: 0 0 3px ${Color.BlueAlpha40};
	}
`;

export const StringItem: React.StatelessComponent<StringItemProps> = props => {
	const { className, description, onChange, onBlur, label, value } = props;

	return (
		<StyledStringItem className={className}>
			<StyledContainer>
				<PropertyLabel label={label} />
				<StyledInput
					onChange={onChange}
					onBlur={onBlur}
					type="text"
					value={value || ''}
					placeholder={props.placeholder}
				/>
			</StyledContainer>
			{description && <PropertyDescription description={description || ''} />}
		</StyledStringItem>
	);
};
