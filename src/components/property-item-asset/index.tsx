import { Color } from '../colors';
import { fonts } from '../fonts';
import { PropertyItem } from '../property-item';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PropertyItemAssetProps {
	className?: string;
	description?: string;
	imageSrc: string;
	inputType: PropertyItemAssetInputType;
	inputValue?: string;
	label: string;
	onChooseClick?: React.MouseEventHandler<HTMLButtonElement>;
	onClearClick?: React.MouseEventHandler<HTMLButtonElement>;
	onInputBlur?: React.ChangeEventHandler<HTMLInputElement>;
	onInputChange?: React.ChangeEventHandler<HTMLInputElement>;
	placeholder?: string;
}

export enum PropertyItemAssetInputType {
	File,
	Url
}
const StyledPreview = styled.div`
	font-family: ${fonts().NORMAL_FONT};
`;

const StyledAsset = styled.div`
	display: block;
	box-sizing: border-box;
	width: 70%;
	border: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	border-radius: 3px;
	background: ${Color.White};
`;

const StyledImageBox = styled.div`
	display: flex;
	margin: ${getSpace(SpaceSize.XS)}px;
	box-sizing: border-box;
	align-items: center;
	justify-content: center;
	height: 60px;
`;

const StyledImage = styled.img`
	max-height: 100%;
	max-width: 100%;
	object-fit: cover;
	object-position: center;
	user-drag: none;
	user-select: none;
`;

const StyledInput = styled.input`
	display: inline-block;
	box-sizing: border-box;
	width: 100%;
	text-overflow: ellipsis;
	border: none;
	padding: 0 ${getSpace(SpaceSize.S)}px;
	background: transparent;
	font-family: ${fonts().NORMAL_FONT};
	font-size: 12px;
	color: ${Color.Grey36};
	transition: all 0.2s;
	text-align: center;

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
	}
`;

const StyledButtonGroup = styled.div`
	width: 100%;
	margin-top: ${getSpace(SpaceSize.XS)}px;

	border-top: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-top-width: 0.5px;
	}
`;

const StyledButton = styled.button`
	display: inline-block;
	width: 50%;
	border: none;
	outline: none;
	color: ${Color.Grey36};
	background: transparent;
	padding: ${getSpace(SpaceSize.XS)}px 0;
	box-sizing: border-box;

	border-right: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-right-width: 0.5px;
	}

	&:last-of-type {
		border-right-color: transparent;
	}
`;

export const PropertyItemAsset: React.StatelessComponent<PropertyItemAssetProps> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<StyledAsset>
			<StyledPreview>
				<StyledImageBox>
					{props.imageSrc && <StyledImage src={props.imageSrc} />}
				</StyledImageBox>

				<StyledInput
					onBlur={props.onInputBlur}
					onChange={props.onInputChange}
					type="text"
					value={props.inputValue}
					placeholder={props.placeholder}
				/>

				<StyledButtonGroup>
					<StyledButton onClick={props.onChooseClick}>Choose</StyledButton>
					<StyledButton disabled={props.imageSrc.length === 0} onClick={props.onClearClick}>
						Clear
					</StyledButton>
				</StyledButtonGroup>
			</StyledPreview>
		</StyledAsset>
	</PropertyItem>
);
