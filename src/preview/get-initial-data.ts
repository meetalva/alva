import * as Types from '../types';

export interface InitialData {
	data: Types.SerializedProject;
	mode: 'static' | 'live';
}

export function getInitialData(): InitialData | undefined {
	const vaultElement = document.querySelector('[data-data="alva"]');

	if (!vaultElement) {
		return;
	}

	try {
		return JSON.parse(decodeURIComponent(vaultElement.textContent || '{}'));
	} catch (err) {
		return;
	}
}
