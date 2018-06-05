import { Color } from '../../colors';
import { fonts } from '../../fonts';
import { PropertyDescription } from '../property-description';
import { PropertyLabel } from '../property-label';
import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

export interface AssetItemProps {
	className?: string;
	description?: string;
	imageSrc: string;
	inputType: AssetPropertyInputType;
	inputValue?: string;
	label: string;
	onChooseClick?: React.MouseEventHandler<HTMLButtonElement>;
	onClearClick?: React.MouseEventHandler<HTMLButtonElement>;
	onInputBlur?: React.ChangeEventHandler<HTMLInputElement>;
	onInputChange?: React.ChangeEventHandler<HTMLInputElement>;
	placeholder?: string;
}

export enum AssetPropertyInputType {
	File,
	Url
}

const StyledAssetItem = styled.div`
	display: block;
	margin-bottom: ${getSpace(SpaceSize.S)}px;
`;

const StyledContainer = styled.div`
	display: flex;
	width: 100%;
	box-sizing: border-box;
`;

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
	width: 100%;
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

export const AssetItem: React.StatelessComponent<AssetItemProps> = props => (
	<StyledAssetItem className={props.className}>
		<StyledContainer>
			<PropertyLabel label={props.label} />
			<StyledAsset>
				<StyledPreview>
					<StyledImageBox>
						{props.imageSrc && <StyledImage src={props.imageSrc} />}
					</StyledImageBox>

					<StyledButtonGroup>
						<StyledButton onClick={props.onChooseClick}>Choose</StyledButton>
						<StyledButton disabled={props.imageSrc.length === 0} onClick={props.onClearClick}>
							Clear
						</StyledButton>
					</StyledButtonGroup>
				</StyledPreview>
			</StyledAsset>
		</StyledContainer>
		{props.description && <PropertyDescription description={props.description || ''} />}
	</StyledAssetItem>
);
