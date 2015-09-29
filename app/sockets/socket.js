var socketJwt = require('socketio-jwt');
var socketIo = require('socket.io');

exports.init = function(server) {
	var io = socketIo(server);

	io.use(socketJwt.authorize({
		secret: 'testkey',
		handshake: true
	}));


}