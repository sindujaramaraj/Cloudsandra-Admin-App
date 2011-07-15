var http = require('http');
var api = require('./node-cloudsandra.js');

var server = http.createServer(function(req, res) {
	console.log('Reached sever');
	var cloudsandraAPI = new api.CloudsandraApi();
	cloudsandraAPI.setUsername("q4t9YF3kht");
	cloudsandraAPI.setPassword("dc96bf6e-465e-4723-8b7d-2eda8a6c769f");
	cloudsandraAPI.getColumnFamilies(callback_display(res));
});

server.listen("9999");
console.log("Server is running at port 9999...");

function callback_display(response) {
	return function(dbresponse) {
		console.log(dbresponse);
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(dbresponse);
	}	
}