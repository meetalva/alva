import { Color } from './colors';
import { fonts } from './fonts';
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
	body {
		margin: 0;
		background-color: ${Color.Grey97};
		font-family: ${fonts().NORMAL_FONT};
		font-size: 12px;
	}
`;
