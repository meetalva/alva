import { Color } from '../../colors';
import { fonts } from '../../fonts';
import { Icon, IconName, IconSize } from '../../icons';
import { PropertyDescription } from '../property-description';
import { PropertyLabel } from '../property-label';
import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

export interface EnumItemValues {
	id: string;
	name: string;
}

export interface EnumItemProps {
	className?: string;
	description?: string;
	label: string;
	onChange?: React.ChangeEventHandler<HTMLSelectElement>;
	required?: boolean;
	selectedValue?: string;
	values: EnumItemValues[];
}

const StyledEnumItem = styled.label`
	display: block;
	margin-bottom: ${getSpace(SpaceSize.S)}px;
`;

const StyledContainer = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	box-sizing: border-box;
`;

const StyledSelectWrapper = styled.div`
	width: 70%;
	height: 30px;
	position: relative;
	display: inline-block;
	box-sizing: border-box;
	border-radius: 3px;
	background-color: ${Color.White};
`;

const StyledSelect = styled.select`
	appearance: none;
	box-sizing: border-box;
	width: 100%;
	height: 30px;
	padding: 0 ${getSpace(SpaceSize.XL)}px 0 ${getSpace(SpaceSize.S)}px;
	border: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	background: none;
	border-radius: 3px;
	color: ${Color.Grey20};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 15px;
	text-overflow: ellipsis;
	transition: border-color 0.1s, box-shadow 0.1s, color 0.1s;
	&:hover {
		color: ${Color.Black};
		border-color: ${Color.Grey60};
	}
	&:focus {
		outline: none;
		color: ${Color.Black};
		border-color: ${Color.Blue40};
		box-shadow: 0 0 3px ${Color.BlueAlpha40};
	}
`;

const StyledIcon = styled(Icon)`
	position: absolute;
	right: 0;
	fill: ${Color.Grey60};
	width: 12px;
	height: 12px;
	padding: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px;
	transform: rotate(90deg);
	pointer-events: none;
`;

export const EnumItem: React.StatelessComponent<EnumItemProps> = props => {
	const { className, description, values, selectedValue, onChange, label, required } = props;

	return (
		<StyledEnumItem className={className}>
			<StyledContainer>
				<PropertyLabel label={label} />
				<StyledSelectWrapper>
					<StyledSelect
						className={className}
						onChange={onChange}
						value={selectedValue ? selectedValue : ''}
					>
						{!required && <option key="empty" value="" />}
						{values.map(value => (
							<option key={value.id} value={value.id}>
								{value.name}
							</option>
						))}
					</StyledSelect>
					<StyledIcon
						name={IconName.ArrowFillRight}
						size={IconSize.XXS}
						color={Color.Grey60}
					/>
				</StyledSelectWrapper>
			</StyledContainer>
			{description && <PropertyDescription description={description || ''} />}
		</StyledEnumItem>
	);
};
