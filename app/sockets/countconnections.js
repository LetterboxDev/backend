var io = require('../../config/socketio');

exports.countUserConnections = function(hashedId) {
  var count = 0;
  var namespace = io.of('/');
  for (var id in namespace.connected) {
    var index = namespace.connected[id].rooms.indexOf(hashedId);
    if (index !== -1) count++;
  }
  return count;
};
