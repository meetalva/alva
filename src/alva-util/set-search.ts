import * as Url from 'url';

/**
 * Adds an arbitrary key-value string map to a url's search string
 * @param src The url to modify
 * @param data The key value map to add to the url's search string
 */
export function setSearch(src: string, data: { [key: string]: string }): string {
	const parsed = Url.parse(src);

	const params = Object.entries(data).reduce((p, [key, value]) => {
		p.set(key, value);
		return p;
	}, new URLSearchParams(parsed.search || ''));

	parsed.search = params.toString();

	return Url.format(parsed);
}
