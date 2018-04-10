import { colors } from '../colors';
import { fonts } from '../fonts';
import { injectGlobal } from 'styled-components';

export default function globalStyles(): void {
	// tslint:disable-next-line
	return injectGlobal`
		body {
			margin: 0;
			background-color: ${colors.grey97.toString()};;
			font-family: ${fonts().NORMAL_FONT};
			font-size: 12px;
		}
	`;
}
