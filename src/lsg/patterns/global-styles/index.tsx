import { fonts } from '../fonts';
import {injectGlobal} from 'styled-components';

export default function globalStyles(): void {
	// tslint:disable-next-line
	return injectGlobal`
		body {
			margin: 0;
			background-color: #f7f7f7;
			font-family: ${fonts().NORMAL_FONT};
			font-size: 12px;
		}
	`;
}
