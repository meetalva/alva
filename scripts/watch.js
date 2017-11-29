const childProcess = require('child_process');
const path = require('path');
const chokidar = require('chokidar');

const pattern = path.join(__dirname, '../src/**');
let running = false;
let started = false;

function build() {
	childProcess.exec('npm run build', (error, info) => {
		running = false;
		if (info) {
			console.info(info);
		}
		if (error) {
			console.error(error);
		} else if (!started) {
			childProcess.exec('npm run start');
			started = true;
		}
	})
}

chokidar.watch(pattern).on('all', (event) => {
	if (running) {
		return;
	}

	running = true;
	build();
});
