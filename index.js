const express = require('express');
const fs = require('fs');
const path = require('path');
const process = require('process');
const port = process.env.PORT || 3000;
const app = express();
const router = express.Router();

process.on('SIGINT', () => {
	console.log(`About to exit`);
	process.exit();
});

// serve static assets normally
app.use(express.static(__dirname));

app.get('*', function (request, response){
	response.sendFile(path.resolve(__dirname, 'index.html'));
});

router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});

app.listen(port)
console.log("server started on port " + port);
