/**
* Isidorey Node.js CloudSandra Helper Library Examples
*/

/**
 * Notes: 
 * 
 * Realtime available @ http://dev.isidorey.net/cloudsandra/?channel={token}/{cfName}/{rowKey}
 * I wouldn't run all of these at once :)
 */

// Includes
var sys = require('sys'),
		stack = require('long-stack-traces'),
			api = require('node-cloudsandra');
	
var CloudsandraApi = new api.CloudsandraApi();

CloudsandraApi.createColumnFamily('{cfName}', '{cfType}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.createStandardColumn('{cfName}', '{cName}', '{cType}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.createIndexedColumn('{cfName}', '{cName}', '{cType}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.removeIndexedColumn('{cfName}', '{cName}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.getColumnFamilyDescription('{cfName}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.getColumnFamilies(function(response) {
	CloudsandraApi.parseForDisplay(response);
});

var postParams = {
	'{columnName}' : '{value}',
	'{indexedColumnName}': '{value}'
};

var ttl = '60'; // Seconds

CloudsandraApi.postData('{cfName}', '{rowKey}', postParams, ttl, function(response) {
	CloudsandraApi.parseForDisplay(response);
});

var jsonStringObject = '{"rowkeys": [{"rowkey": "rk","columns": [{"columnname": "cn","columnvalue": "cv","ttl" : 60},{"columnname": "cn","columnvalue": "cv","ttl" : 60}]},{"rowkey": "rk","columns": [{"columnname": "cn","columnvalue": "cv"},{"columnname": "cn","columnvalue": "cv"}]}]}';

CloudsandraApi.postBulkData('{cfName}', jsonStringObject, function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.getRow('{cfName}', '{rowKey}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.paginateRow('{cfName}', '{rowKey}', '{fromKey}', '{limit}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.deleteDataFromRow('{cfName}', '{rowKey}', '{cName}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.deleteRow('{cfName}', '{rowKey}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.deleteColumnFamily('{cfName}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

var cql = 'SELECT *';

CloudsandraApi.queryCQL('{cfName}', cql, function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.deleteColumnFamilies(function(cfName) {
 	CloudsandraApi.deleteColumnFamily(cfName, function (response) {
		CloudsandraApi.parseForDisplay(response);
	});
});

var incrementValue = '1';

CloudsandraApi.incrementCount('{rowKey}', '{cName}', incrementValue, function(response) {
	CloudsandraApi.parseForDisplay(response);
});

var decrementValue = '1';

CloudsandraApi.decrementCount('{rowKey}', '{cName}', decrementValue, function(response) {
	CloudsandraApi.parseForDisplay(response);
});

CloudsandraApi.getCount('{rowKey}', '{cName}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});


CloudsandraApi.mapReduceSetup('', '{cName}', function(response) {
	CloudsandraApi.parseForDisplay(response);
});

var postParams = {
	type: 'external',
	rowMapping: '{rowkey}',
	rowType: '{string}',
	columnMapping: '{columnname}',
	columnType: '{string}',
	valueMapping: '{value}',
	valueType: '{string}',
	cassandraColumnsMapping: '{:key,:column,:value}'
};

var postParams = {
	type: 'standard',
	rowMapping: 'rowkey',
	rowType: 'string'
};

CloudsandraApi.mapReduceTable('{table}', postParams, function(response) {
	CloudsandraApi.parseForDisplay(response);
});

var postParams = {
	overwriteTable : '{table}',
	fromTable : '{table}',
	select : '{query}',
	where : '{query}'
};

CloudsandraApi.mapReduceJob(postParams, function(response) {
	CloudsandraApi.parseForDisplay(response);
});	