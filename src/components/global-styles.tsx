import { Color } from './colors';
import { fonts } from './fonts';
import { injectGlobal } from 'styled-components';

export default globalStyles;

export function globalStyles(): void {
	// tslint:disable-next-line
	return injectGlobal`
		body {
			margin: 0;
			background-color: ${Color.Grey97};
			font-family: ${fonts().NORMAL_FONT};
			font-size: 12px;
		}
	`;
}
