import * as Types from '@meetalva/types';

export interface InitialData {
	data: Types.SerializedProject;
	transferType: 'inline' | 'message';
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
