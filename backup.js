var http = require('http'),
	api = require('./node-cloudsandra.js'),
	fs = require('fs'),
	express = require('express'),
	index;

fs.readFile('./index.html', function(err, data) {
	if (err) {
		throw err;
	}
	index = data;
})

var server = http.createServer(function(req, res) {
	console.log('Reached sever');
	res.writeHead(200, {"Content-Type" : "text/html"});
	res.end(index);
});

server.listen("9999");
console.log("Server is running at port 9999...");

function callback_display(response) {
	var cloudsandraAPI = new api.CloudsandraApi();
	cloudsandraAPI.setUsername("q4t9YF3kht");
	cloudsandraAPI.setPassword("dc96bf6e-465e-4723-8b7d-2eda8a6c769f");
	cloudsandraAPI.getColumnFamilies(callback_display(res));
	return function(dbresponse) {
		console.log(dbresponse);
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(dbresponse);
	}	
}


////////////////////////////////////////////////////////------------------

