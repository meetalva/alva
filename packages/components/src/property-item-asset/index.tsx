import { ButtonGroup, ButtonGroupButton } from '../button-group';
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
	renderChoose?(): JSX.Element;
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

				<ButtonGroup>
					<ButtonGroup.ButtonLeft>
						{props.renderChoose ? (
							props.renderChoose()
						) : (
							<ButtonGroupButton onClick={props.onChooseClick}>Choose</ButtonGroupButton>
						)}
					</ButtonGroup.ButtonLeft>
					<ButtonGroup.ButtonRight>
						<ButtonGroupButton
							disabled={props.imageSrc.length === 0}
							onClick={props.onClearClick}
						>
							Clear
						</ButtonGroupButton>
					</ButtonGroup.ButtonRight>
				</ButtonGroup>
			</StyledPreview>
		</StyledAsset>
	</PropertyItem>
);
