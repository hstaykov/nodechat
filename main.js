var http = require('http');
var fs = require('fs');
var path = require('path');

var app = http.createServer(function(req, res) {
	var filePath = '.' + req.url;
	if (filePath == './')
		filePath = './client.html';
	var extName = path.extname(filePath);
	var contentType = 'text/html';

	console.log(req.headers);

	switch (extName) {
		case '.css':
			contentType = 'text/css';
			break;
		case '.js':
			contentType = 'text/javascript'
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
var onlineUsers = [];

var Firebase = require('firebase');
var myRootRef = new Firebase('https://chatnode.firebaseio.com/users/');

io.sockets.on('connection', function(socket) {
	onlineSockets++;
	// console.log(socket.namespace.manager);
	socket.on('message_to_server', function(data) {
		console.log(onlineUsers.indexOf(data.user));
		if (onlineUsers.indexOf(data.user) <= -1) {
			onlineUsers.push(data.user);
			console.log("We are adding user");
		}

		io.sockets.emit('message_to_client', {
			message: data.message,
			user: data.user,
			onlineUsers: onlineSockets,
			color: data.color,
			usersOnline: onlineUsers
		});
	});

	socket.on('login_event', function(data) {
		var result = false;

		myRootRef.on("child_added", function(dbResult) {
			// console.log(dbResult.val());
			var obj = eval(dbResult.val());
			if (data.username == obj.username && data.password == obj.password) {
				console.log(obj.username + " logged in..");
				result = true;
			}
		});
		socket.emit('login_response', {
			result: result
		});
	});

	socket.on('custom_event', function(data) {
		socket.emit('custom_event_to_client', {
			signal: data.object
		});
	});

	socket.on('register_user', function(data) {
		var user = {}
		user.username = data.username;
		user.password = data.password;
		myRootRef.push(user);
	});

	socket.on('disconnect', function(data) {
		onlineSockets--;
		var index = onlineUsers.indexOf(data.user);
		onlineUsers.splice(index, 1);
		console.log("DISCONNNECTION!!!!!!!!!!!!!");
	});
});