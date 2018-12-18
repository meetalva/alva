import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';
const { ChevronDown, ChevronUp } = require('react-feather');

export interface DetailsProps {
	open: boolean;
	toggleable?: boolean;
	summary: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

const StyledWrapper = styled.div`
	margin: 0 -${getSpace(SpaceSize.M)}px;
	border-top: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-top-width: 0.5px;
		border-bottom-width: 0.5px;
	}
	&:last-of-type {
		border-bottom: 1px solid ${Color.Grey90};
	}
`;

const StyledDetails = styled.details`
	padding: ${getSpace(SpaceSize.XXS)}px ${getSpace(SpaceSize.M)}px;
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

export const PropertyDetails: React.StatelessComponent<DetailsProps> = props => {
	return (
		<StyledWrapper>
			<StyledDetails open={props.open}>
				<StyledSummary onClick={props.onClick}>
					{props.summary}
					<StyledIcon>
						{props.toggleable &&
							(props.open ? <ChevronUp size={15} /> : <ChevronDown size={15} />)}
					</StyledIcon>
				</StyledSummary>
				{props.open && props.children}
			</StyledDetails>
		</StyledWrapper>
	);
};
