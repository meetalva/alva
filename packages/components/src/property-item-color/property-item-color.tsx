import * as React from 'react';
import { PropertyInput, PropertyInputType } from '../property-input';
import { PropertyItem } from '../property-item';
import { SketchPicker } from 'react-color';

import styled, { css } from 'styled-components';

export interface PropertyItemColorProps {
	className?: string;
	description?: string;
	label: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler;
	onShow?: React.MouseEventHandler;
	onHide?: React.MouseEventHandler;
	placeholder?: string;
	color?: string;
	show?: boolean;

	onColorPickerChange?: any;
	onColorPickerChangeComplete?: any;
}

export interface PropertyItemColorSwatchProps {
	color?: string;
}

const StyledSwatch = styled.div`
	display: inline-block;
	padding: 4px;
	margin-right: 2px;
	background: #fff;
	border-radius: 3px;
	border: 1px solid rgb(229, 230, 231);

	&:hover {
		border-color: rgb(153, 158, 162);
	}
`;
const StyledSwatchColor = styled.div`
	width: 36px;
	height: 100%;
	border-radius: 2px;
	background-color: ${(props: PropertyItemColorSwatchProps) => props.color};
`;

const StyledPropertyOverlay = styled.div`
	position: absolute;
	top: 32px;
	right: 0;
`;

export const PropertyItemColor: React.StatelessComponent<PropertyItemColorProps> = props => (
	<>
		<PropertyItem description={props.description} label={props.label}>
			<StyledSwatch onClick={props.onShow}>
				<StyledSwatchColor color={props.color} />
			</StyledSwatch>
			<PropertyInput
				onFocus={props.onFocus}
				onChange={props.onChange}
				onBlur={props.onBlur}
				onClick={props.onShow}
				type={PropertyInputType.Text}
				value={props.color}
				placeholder={props.placeholder}
			/>
			{props.show && (
				<StyledPropertyOverlay>
					<div style={{ position: 'relative', zIndex: 50 }}>
						<SketchPicker
							color={props.color}
							onChange={props.onColorPickerChange}
							onChangeComplete={props.onColorPickerChangeComplete}
						/>
					</div>
				</StyledPropertyOverlay>
			)}
		</PropertyItem>
	</>
);
