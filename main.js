var http = require('http');
var fs = require('fs');
var path = require('path');

var app = http.createServer(function(req, res) {
	var filePath = '.' + req.url;
	if (filePath == './')
		filePath = './client.html';
	var extName = path.extname(filePath);
	var contentType = 'text/html';

	switch (extName) {
		case '.css':
			contentType = 'text/css';
			break;
	}

	path.exists(filePath, function(exists) {
		if (exists) {
			fs.readFile(filePath, "utf-8", function(error, data) {
				res.writeHead(200, {
					'Content-type': contentType
				});
				res.write(data);
				res.end();
			});
		}
	});
});
app.listen(3000);

var io = require('socket.io').listen(app);
var onlineSockets = 0;
io.sockets.on('connection', function(socket) {
	onlineSockets++;
	socket.on('message_to_server', function(data) {
		io.sockets.emit('message_to_client', {
			message: data.message,
			user: data.user,
			onlineUsers: onlineSockets,
			color: data.color
		});
	});

	socket.on('disconnect', function() {
		onlineSockets--;
		console.log("DISCONNNECTION!!!!!!!!!!!!!");
	});
});