var api = require('./node-cloudsandra.js'),
	express = require('express'),
	index;

var cloudsandraAPI = new api.CloudsandraApi();
var server = express.createServer();
server.use(express.static(__dirname + '/public'));
server.listen("9999");
console.log("Server is running at port 9999...");
var everyone = require('now').initialize(server);
for (var method in cloudsandraAPI) {
	everyone.now[method] = cloudsandraAPI[method];
}