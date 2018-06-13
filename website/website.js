function getOS() {
	var OS = 'undefinedOS';
	if (navigator.appVersion.indexOf('Win') != -1) OS = { name: 'Windows', file: '.exe' };
	if (navigator.appVersion.indexOf('Mac') != -1) OS = { name: 'macOS', file: '.dmg' };

	return OS;
}

function latestOSRelease(os) {
	fetch('https://api.github.com/repos/meetalva/alva/releases/latest')
		.then(response => response.json())
		.then(data => {
			for (let i of data.assets) {
				if (i.name.indexOf(os.file) !== -1) {
					generateDownloadLink(i.browser_download_url, os);
					return;
				}
			}
		});
}

function generateDownloadLink(url, os) {
	var button = document.querySelector('.js-download-button');
	var buttonText = button.innerHTML;
	button.href = url;
	button.innerHTML = buttonText + ' for ' + os.name;
}

document.addEventListener('DOMContentLoaded', function() {
	const os = getOS();
	latestOSRelease(os);
});
