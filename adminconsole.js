var api = require('./node-cloudsandra.js'),
	express = require('express'),
	index;

var cloudsandraAPI = new api.CloudsandraApi();
var server = express.createServer();
server.use(express.static(__dirname + '/public'));
server.listen(process.env.PORT);
console.log("Server is running...");
var everyone = require('now').initialize(server);
for (var method in cloudsandraAPI) {
	everyone.now[method] = cloudsandraAPI[method];
}