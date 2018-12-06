import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';
import { ChevronDown, ChevronUp } from 'react-feather';

const StyledWrapper = styled.div`
	margin: ${getSpace(SpaceSize.M)}px 0;
`;

const StyledSeparator = styled.div`
	height: 1px;
	margin: 0 -${getSpace(SpaceSize.M)}px 0;
	border-top: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-top-width: 0.5px;
	}
`;

const StyledDetails = styled.details`
	padding: ${getSpace(SpaceSize.XS)}px 0;
`;

const StyledSummary = styled.summary`
	display: flex;
	justify-content: space-between;
	list-style: none;
	user-select: none;
	margin-top: ${getSpace(SpaceSize.S)}px;
	margin-bottom: ${getSpace(SpaceSize.S)}px;
	color: ${Color.Grey50};

	::-webkit-details-marker {
		display: none;
	}

	:focus {
		outline: none;
	}
`;

const StyledIcon = styled.div`
	flex-shrink: 0;
`;

export interface DetailsProps {
	open: boolean;
	summary: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

export const PropertyDetails: React.StatelessComponent<DetailsProps> = props => {
	return (
		<StyledWrapper>
			<StyledSeparator />
			<StyledDetails open={props.open}>
				<StyledSummary onClick={props.onClick}>
					{props.summary}
					<StyledIcon>
						{props.open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
					</StyledIcon>
				</StyledSummary>
				{props.open && props.children}
			</StyledDetails>
			<StyledSeparator />
		</StyledWrapper>
	);
};
