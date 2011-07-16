/**
* Isidorey Node.js CloudSandra Helper Library Examples
*/

// Includes
var sys = require('sys'),
		stack = require('long-stack-traces'),
			api = require('node-cloudsandra');
	
var CloudsandraApi = new api.CloudsandraApi();

/*
CloudsandraApi.queryCQL('TestTimeUUID', cql, function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/

//var id = uuid();
//uuid('binary', id, 16)

function mapReduceTest() {
	/*
	CloudsandraApi.createColumnFamily('MapReduceTest1', 'UTF8Type', function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
	*/
	
	/*
	for (i = 11; i < 20; i++) {
	    var postParams = {};
	    //postParams[i] = 'value';
	    postParams['first_appeared_on_platform'] = 'someday';
		
		CloudsandraApi.postData('MapReduceTest1', 'rowkey' + i, postParams, null, function(response) {
			CloudsandraApi.parseForDisplay(response);
		});
	}
	*/
	
	/*
	var postParams = {
		type: 'external',
		rowMapping: 'rowkey',
		rowType: 'string',
		columnMapping: 'columnname',
		columnType: 'string',
		valueMapping: 'value',
		valueType: 'string',
		cassandraColumnsMapping: ':key,:column,:value'
	};
	
	CloudsandraApi.mapReduceTable('MapReduceTest1', postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
	*/
	
	/*
	var postParams = {
		type: 'standard',
		rowMapping: 'rowkey',
		rowType: 'string'
	};

	CloudsandraApi.mapReduceTable('rowKeyWithNoPlatformData', postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
	*/
	
	/*
	var postParams = {
		overwriteTable : 'rowKeyWithNoPlatformData',
		fromTable : 'MapReduceTest1',
		select : 'rowkey',
		where : 'columnname != \'first_appeared_on_platform\''
	};

	CloudsandraApi.mapReduceJob(postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});	
	*/
	
	/*
	var postParams = {
		overwriteTable : 'MapReduceTest1',
		fromTable : 'rowKeyWithNoPlatformData',
		select : '\'new_to_platform:2011:06\', rowkey, \'2011:06:21\''
	};

	CloudsandraApi.mapReduceJob(postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});	
	*/
	
	/*
	var postParams = {
		overwriteTable : 'MapReduceTest1',
		fromTable : 'rowKeyWithNoPlatformData',
		select : 'rowkey, \'first_appeared_on_platform\', \'2011:06:21\''
	};

	CloudsandraApi.mapReduceJob(postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});	
	*/
}

function mapReduceTestTake2() {

	var postParams = {
		fromTable : 'MapReduceTest1',
		//select : 'COUNT(*)'
		select: 'rowkey, columnname, value',
		where : 'rowkey=\'rowkey1\' AND value like \'%2011:06:21%\''
	};

	CloudsandraApi.mapReduceJob(postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});	
	
};

function setupExternalTables() {
	var postParams = {
		type: 'external',
		rowMapping: 'rowkey',
		rowType: 'string',
		columnMapping: 'columnname',
		columnType: 'string',
		valueMapping: 'value',
		valueType: 'string',
		cassandraColumnsMapping: ':key,:column,:value'
	};
	
	CloudsandraApi.mapReduceTable('CFUTF8Type', postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
	
	var postParams = {
		type: 'external',
		rowMapping: 'rowkey',
		rowType: 'string',
		columnMapping: 'column_name',
		columnType: 'BIGINT',
		valueMapping: 'value',
		valueType: 'string',
		cassandraColumnsMapping: ':key,:column,:value'
	};
	
	CloudsandraApi.mapReduceTable('CFLongType', postParams, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
}

/**
* We create a separate hive table that maps to the rowkey so we can dump logs that match 
*/
function setupHiveTables(rowKeys) {
	
	/**
	* No connection pool, slow down
	*/
	(function(){
	    var t_count = 0;
	    (function(delay, count) {
    	    	
	        setTimeout(function() {
	            if (count && ++t_count > count) 
	            	return;
	            	
	           	var rowKey = rowKeys[t_count];
	            
	            rowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
	            
	            console.log('table: ' + rowKey);
			
				var postParams = {
					type: 'standard',
					rowMapping: 'rowkey',
					rowType: 'string'
				};
			
				CloudsandraApi.mapReduceTable(rowKey, postParams, function(response) {
					CloudsandraApi.parseForDisplay(response);
				});
	            	
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(3000, rowKeys.length - 1);
	})();
		
	/**
	* Not sure if this will F* shit up
	*/	
	/*
	rowKeys.forEach(
		function (rowKey) {	
		
			rowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
			
			var postParams = {
				type: 'standard',
				rowMapping: 'rowkey',
				rowType: 'string'
			};
		
			CloudsandraApi.mapReduceTable(rowKey, postParams, function(response) {
				CloudsandraApi.parseForDisplay(response);
			});
		}
	);
	*/
}

/**
* Until json post is allowed for multiple jobs, we create a separate job for each rowkey (day), and put data into Hive
*/
function startLogAggregateJob(cfName, rowKeys, text) {

	/**
	* No connection pool, slow down
	*/
	(function(){
	    var t_count = 0;
	    (function(delay, count) {
    	    	
	        setTimeout(function() {
	            if (count && ++t_count > count) 
	            	return;
	            	
	           	var rowKey = rowKeys[t_count];
	            
	            var hiveTableFromRowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
		
				var postParams = {
					overwriteTable : hiveTableFromRowKey,
					fromTable : cfName,
					select : 'value',
					where : 'rowkey=\'' + rowKey + '\' AND value like \'%' + text + '%\''
				};
			
				CloudsandraApi.mapReduceJob(postParams, function(response) {
					CloudsandraApi.parseForDisplay(response);
				});	
	            	
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(1000 * 30, rowKeys.length - 1);
	})();

	/**
	* Not sure if this will F* shit up
	*/
	/*
	rowKeys.forEach(
		function (rowKey) {	
			
			var hiveTableFromRowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
		
			var postParams = {
				overwriteTable : hiveTableFromRowKey,
				fromTable : cfName,
				select : 'value',
				where : 'rowkey=\'' + rowKey + '\' AND value like \'%' + text + '%\''
			};
		
			CloudsandraApi.mapReduceJob(postParams, function(response) {
				CloudsandraApi.parseForDisplay(response);
			});	
		}
	);
	*/
}

/**
* We should probably reduce to a job ID, but for now we can take all results and put them in unique row 'job1', with
* a value that corresponds to today's date
*/
function startReduceToCassandraJob(cfName, reduceKey, rowKeys) {

	/**
	* No connection pool, slow down
	*/
	(function(){
	    var t_count = 0;
	    (function(delay, count) {
    	    	
	        setTimeout(function() {
	            if (count && ++t_count > count) 
	            	return;
	            	
	           	var rowKey = rowKeys[t_count];
	            
	            var hiveTableFromRowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
		
				var postParams = {
					overwriteTable : cfName,
					fromTable : hiveTableFromRowKey,
					select : '\'' + reduceKey + '\', rowkey, \'2011:06:28\''
				};
			
				CloudsandraApi.mapReduceJob(postParams, function(response) {
					CloudsandraApi.parseForDisplay(response);
				});		
	            	
	            setTimeout(arguments.callee, delay);
	        }, delay);
	    })(5000, rowKeys.length - 1);
	})();

	/**
	* Not sure if this will F* shit up
	*/
	/*
	rowKeys.forEach(
		function (rowKey) {	
			
			var hiveTableFromRowKey = rowKey.replace(/[^a-zA-Z 0-9]+/g,'');
		
			var postParams = {
				overwriteTable : cfName,
				fromTable : hiveTableFromRowKey,
				select : '\'job2\', rowkey, \'2011:06:28\''
			};
		
			CloudsandraApi.mapReduceJob(postParams, function(response) {
				CloudsandraApi.parseForDisplay(response);
			});	
		}
	);
	*/
}

function runJobsForTimePeriod(period, key, text) {
	
	var rowKeys = [];

	switch (period) {
		case 'year':
			for (i = 0; i < 365; i++) {
				var time = new Date();
				time.setDate(time.getDate() - i);
				var rowKey = key + ':' + time.getUTCFullYear() + ':' + time.getUTCMonth() + ':' + time.getUTCDate();
				rowKeys.push(rowKey);
			}
			break;
		case 'month':
			for (i = 0; i < 31; i++) {
				var time = new Date();
				time.setDate(time.getDate() - i);
				var rowKey = key + ':' + time.getUTCFullYear() + ':' + time.getUTCMonth() + ':' + time.getUTCDate();
				rowKeys.push(rowKey);
			}
			break;
		case 'week':
			for (i = 0; i < 7; i++) {
				var time = new Date();
				time.setDate(time.getDate() - i);
				var rowKey = key + ':' + time.getUTCFullYear() + ':' + time.getUTCMonth() + ':' + time.getUTCDate();
				rowKeys.push(rowKey);
			}
			break;
		case 'day':
			break;
		default:
			// today
			break;
	}
		
	//setupHiveTables(rowKeys);
	//startLogAggregateJob('CFLongType', rowKeys, text);
	startReduceToCassandraJob('MapReduceTest1', 'job5', rowKeys);
}

//setupExternalTables();
//runJobsForTimePeriod('week', '10.202.215.212:logs:_var_log_tomcat6_catalina.out', 'Authenticating');

/*
var postParams = {
	type: 'standard',
	rowMapping: 'rowkey',
	rowType: 'string'
};
*/

/*
CloudsandraApi.mapReduceTable('rowKeyWithNoPlatformData', postParams, function(response) {
	CloudsandraApi.parseForDisplay(response);
});


var postParams = {
	overwriteTable : 'rowKeyWithNoPlatformData',
	fromTable : 'CFUTF8Type',
	select : 'rowkey',
	where : 'columnname != first_appeared_on_platform'
};

CloudsandraApi.mapReduceJob(postParams, function(response) {
	CloudsandraApi.parseForDisplay(response);
});

}

mapReduceTest();

// Doesn't work
/*
CloudsandraApi.createColumn('123456_TEST', 'standardColumn', 'asciiType', function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/
/*
CloudsandraApi.createIndexedColumn('123456_TEST', 'birthdate', 'longType', function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/

// Doesn't work yet
/*
CloudsandraApi.removeIndexedColumn(TEST, 'birthdate', function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/

// Insert Column Families
/*
(function(){
    var t_count = 0;
    (function(delay, count) {
        setTimeout(function() {
            if (count && ++t_count > count) 
            	return;
            
            CloudsandraApi.createColumnFamily('ColumnFamily' + t_count, 'UTF8Type', function(response) {
				CloudsandraApi.parseForDisplay(response);
			});
            	
            setTimeout(arguments.callee, delay);
        }, delay);
    })(DELAY_CREATE, CFS);
})(); 
*/

// Insert 1000 rowkeys

/*
for (i = 0; i < 10; i++) {
    var postParams = {};
    postParams[i] = 'value';
	
	CloudsandraApi.postData('1234_TEST', 'rowkey' + i, postParams, null, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
}
*/

//first_appeared_on_platform exists for 1-277, not for 278-500

// Insert first appeared into 500 rows
/*
for (i = 251; i < 500; i++) {
	var postParams = {};
	
	var date = new Date();
	
  	postParams['generic_data'] = 'wanker';
  	//postParams['first_appeared_on_platform'] = '2011:06:21';
  	
  	CloudsandraApi.postData('1234_TEST', 'rowkey' + i, postParams, null, function(response) {
		CloudsandraApi.parseForDisplay(response);
	});
}
*/

//var id = uuid();
//var postParams = {};
//postParams[uuid('binary', id, 16)] = 'somevalue';

/*
var ttl = '10000000'; // Seconds

var date = new Date();
var epoc = date.getTime();

var postParams = {};
postParams[epoc] = 'test alert';
*/
		

/*
CloudsandraApi.postData('MyTimeUUIDCF', 'rowKey', postParams, ttl, function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/

/*
CloudsandraApi.postData('CFLongType', 'alerts', postParams, ttl, function(response) {
			CloudsandraApi.parseForDisplay(response);
		});*/

// Get row test

CloudsandraApi.getRow('MapReduceTest1', 'job5', function(response) {
	CloudsandraApi.parseForDisplay(response);
});


/*

CloudsandraApi.deleteRow('CFUTF8Type', 'users', function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/

/*
CloudsandraApi.deleteDataFromRow('1234_TEST', 'rowkey1', 'value', function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/

// Get CF description test

/*
CloudsandraApi.getColumnFamilyDescription('1234_TEST', function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/

/*
CloudsandraApi.deleteColumnFamily('CFLongType', function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/

/*
CloudsandraApi.getColumnFamilies(function(response) {
	CloudsandraApi.parseForDisplay(response);
});

*/
/*
CloudsandraApi.deleteColumnFamilies(function(cfName) {
 	CloudsandraApi.deleteColumnFamily(cfName, function (response) {
		CloudsandraApi.parseForDisplay(response);
	});
});
*/

/*
CloudsandraApi.getCount('new_to_platform:2011:06', 'count', function(response) {
	CloudsandraApi.parseForDisplay(response);
});
/*


var cql = 'SELECT * WHERE KEY = clients';

CloudsandraApi.queryCQL('CFUTF8Type', cql, function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/



/*
var json = '{"rowkeys":[{"rowkey":"127.0.0.1:plugins:filesize:2011:5:21","columns":[{"columnname":"1308617460061","columnvalue":"{\"date\":1308617460061,\"value\":7917}","ttl":"0"},{"columnname":"1308617590296","columnvalue":"{\"date\":1308617590295,\"value\":8139}","ttl":"0"},{"columnname":"1308617610295","columnvalue":"{\"date\":1308617610294,\"value\":8139}","ttl":"0"},{"columnname":"1308617630297","columnvalue":"{\"date\":1308617630296,\"value\":8139}","ttl":"0"},{"columnname":"1308617670295","columnvalue":"{\"date\":1308617670294,\"value\":8139}","ttl":"0"}]},{"rowkey":"127.0.0.1:plugins:uptime:2011:5:21","columns":[{"columnname":"1308617460089","columnvalue":"{\"date\":1308617460084,\"days_up\":\"18:51\",\"time_went_up\":\"9:40\",\"current_user_sessions\":\"5\",\"load_average_1\":\"1.00\",\"load_average_5\":\"0.87\",\"load_average_15\":\"0.78\"}","ttl":"0"},{"columnname":"1308617590302","columnvalue":"{\"date\":1308617590301,\"days_up\":\"18:53\",\"time_went_up\":\"9:42\",\"current_user_sessions\":\"5\",\"load_average_1\":\"0.85\",\"load_average_5\":\"0.86\",\"load_average_15\":\"0.78\"}","ttl":"0"},{"columnname":"1308617610305","columnvalue":"{\"date\":1308617610304,\"days_up\":\"18:53\",\"time_went_up\":\"9:42\",\"current_user_sessions\":\"5\",\"load_average_1\":\"0.95\",\"load_average_5\":\"0.88\",\"load_average_15\":\"0.79\"}","ttl":"0"},{"columnname":"1308617630312","columnvalue":"{\"date\":1308617630312,\"days_up\":\"18:53\",\"time_went_up\":\"9:42\",\"current_user_sessions\":\"5\",\"load_average_1\":\"0.96\",\"load_average_5\":\"0.89\",\"load_average_15\":\"0.80\"}","ttl":"0"},{"columnname":"1308617650308","columnvalue":"{\"date\":1308617650307,\"days_up\":\"18:54\",\"time_went_up\":\"9:43\",\"current_user_sessions\":\"5\",\"load_average_1\":\"0.87\",\"load_average_5\":\"0.88\",\"load_average_15\":\"0.80\"}","ttl":"0"},{"columnname":"1308617670309","columnvalue":"{\"date\":1308617670308,\"days_up\":\"18:54\",\"time_went_up\":\"9:43\",\"current_user_sessions\":\"5\",\"load_average_1\":\"0.69\",\"load_average_5\":\"0.83\",\"load_average_15\":\"0.78\"}","ttl":"0"}]},{"rowkey":"127.0.0.1:logs:_var_log_system.log:2011:5:21","columns":[{"columnname":"1308617570308","columnvalue":"{\"date\":1308617570306,\"returned\":\"Jun 20 17:47:19 Frank-LoVecchios-MacBook-Pro App Store[6254]: CGBitmapContextGetBitsPerComponent: invalid context 0x100644120\\nJun 20 17:47:19 Frank-LoVecchios-MacBook-Pro [0x0-0xda0da].com.apple.appstore[6254]: Mon Jun 20 17:47:19 Frank-LoVecchios-MacBook-Pro.local App Store[6254] <Error>: CGBitmapContextGetBitsPerComponent: invalid context 0x100644120\\nJun 20 17:47:19 Frank-LoVecchios-MacBook-Pro [0x0-0xda0da].com.apple.appstore[6254]: This isnt a bitmap context. Forcing destination format to ARGB_8 for CGContext.\\nJun 20 17:47:43 Frank-LoVecchios-MacBook-Pro Finder[296]: CFPropertyListCreateFromXMLData(): Old-style plist parser: missing semicolon in dictionary.\\nJun 20 17:48:57: --- last message repeated 2 times ---\\nJun 20 18:06:13 Frank-LoVecchios-MacBook-Pro Google Chrome Helper[3146]: unknown error code: invalid numerical value\\nJun 20 18:06:13 Frank-LoVecchios-MacBook-Pro [0x0-0x14014].com.google.Chrome[3127]: Mon Jun 20 18:06:13 Frank-LoVecchios-MacBook-Pro.local Google Chrome Helper[3146] <Error>: unknown error code: invalid numerical value\\nJun 20 18:06:23 Frank-LoVecchios-MacBook-Pro Google Chrome Helper[3146]: unknown error code: invalid numerical value\\nJun 20 18:06:23 Frank-LoVecchios-MacBook-Pro [0x0-0x14014].com.google.Chrome[3127]: Mon Jun 20 18:06:23 Frank-LoVecchios-MacBook-Pro.local Google Chrome Helper[3146] <Error>: unknown error code: invalid numerical value\\nJun 20 18:06:40 Frank-LoVecchios-MacBook-Pro [0x0-0x14014].com.google.Chrome[3127]: 2011-06-20 18:06:40.136 Google Chrome Helper[6495:107] __CFServiceControllerBeginPBSLoadForLocalizations received error 1100 from bootstrap_look_up2\\n\"}","ttl":"0"}]},{"rowkey":"127.0.0.1:plugins:daemons:2011:5:21","columns":[{"columnname":"1308617590304","columnvalue":"{\"date\":1308617590303,\"returned\":\"completed\"}","ttl":"0"},{"columnname":"1308617610299","columnvalue":"{\"date\":1308617610298,\"returned\":\"completed\"}","ttl":"0"},{"columnname":"1308617650300","columnvalue":"{\"date\":1308617650299,\"returned\":\"completed\"}","ttl":"0"},{"columnname":"1308617670302","columnvalue":"{\"date\":1308617670300,\"returned\":\"completed\"}","ttl":"0"}]},{"rowkey":"127.0.0.1:plugins:iostat:2011:5:21","columns":[{"columnname":"1308617590311","columnvalue":"{\"date\":\"2011-06-21T00:53:10.309Z\",\"disk0\":{\"kbt\":31.55,\"tps\":6,\"mbs\":0.17},\"cpu\":{\"us\":5,\"sy\":4,\"id\":90},\"load_average\":{\"m1\":0.85,\"m5\":0.86,\"m15\":0.78}}","ttl":"0"},{"columnname":"1308617610308","columnvalue":"{\"date\":\"2011-06-21T00:53:30.307Z\",\"disk0\":{\"kbt\":31.33,\"tps\":6,\"mbs\":0.17},\"cpu\":{\"us\":5,\"sy\":4,\"id\":90},\"load_average\":{\"m1\":0.95,\"m5\":0.88,\"m15\":0.79}}","ttl":"0"},{"columnname":"1308617630311","columnvalue":"{\"date\":\"2011-06-21T00:53:50.310Z\",\"disk0\":{\"kbt\":31.31,\"tps\":6,\"mbs\":0.17},\"cpu\":{\"us\":5,\"sy\":4,\"id\":90},\"load_average\":{\"m1\":0.96,\"m5\":0.89,\"m15\":0.8}}","ttl":"0"},{"columnname":"1308617650306","columnvalue":"{\"date\":\"2011-06-21T00:54:10.306Z\",\"disk0\":{\"kbt\":31.29,\"tps\":6,\"mbs\":0.17},\"cpu\":{\"us\":5,\"sy\":4,\"id\":90},\"load_average\":{\"m1\":0.87,\"m5\":0.88,\"m15\":0.8}}","ttl":"0"},{"columnname":"1308617670310","columnvalue":"{\"date\":\"2011-06-21T00:54:30.309Z\",\"disk0\":{\"kbt\":31.29,\"tps\":6,\"mbs\":0.17},\"cpu\":{\"us\":5,\"sy\":4,\"id\":90},\"load_average\":{\"m1\":0.69,\"m5\":0.83,\"m15\":0.78}}","ttl":"0"}]},{"rowkey":"127.0.0.1:plugins:lsof:2011:5:21","columns":[{"columnname":"1308617595541","columnvalue":"{\"date\":1308617595540,\"value\":\"3553\"}","ttl":"0"},{"columnname":"1308617614821","columnvalue":"{\"date\":1308617614820,\"value\":\"3539\"}","ttl":"0"},{"columnname":"1308617635001","columnvalue":"{\"date\":1308617635000,\"value\":\"3638\"}","ttl":"0"},{"columnname":"1308617655088","columnvalue":"{\"date\":1308617655087,\"value\":\"3626\"}","ttl":"0"},{"columnname":"1308617675146","columnvalue":"{\"date\":1308617675145,\"value\":\"3612\"}","ttl":"0"}]}]}';
*/


var jsonTest = '{"rowkeys":[{"rowkey":"rk","columns":[{"columnname":1308617655087,"columnvalue":"%7B%22date%22%3A1308781972949%2C%22days_up%22%3A%22day%22%2C%22time_went_up%22%3A%227%3A02%22%2C%22current_user_sessions%22%3A%225%22%2C%22load_average_1%22%3A%220.66%22%2C%22load_average_5%22%3A%220.73%22%2C%22load_average_15%22%3A%220.73%22%7D","ttl":60},{"columnname":1308617655087,"columnvalue":"cv","ttl":60}]},{"rowkey":"rk","columns":[{"columnname":1308617655087,"columnvalue":"cv"},{"columnname":1308617655087,"columnvalue":"cv"}]}]}';

var json = '{"rowkeys":[{"rowkey":"127.0.0.1:logs:_var_log_system.log:2011:5:22","columns":[{"columnname":1308781952949,"columnvalue":"%7B%22date%22%3A1308781952949%2C%22returned%22%3A%22Jun%2022%2015%3A07%3A02%20Frank-LoVecchios-MacBook-Pro%20login%5B12138%5D%3A%20DEAD_PROCESS%3A%2012138%20ttys001%5CnJun%2022%2015%3A19%3A20%20Frank-LoVecchios-MacBook-Pro%20login%5B12331%5D%3A%20USER_PROCESS%3A%2012331%20ttys001%5CnJun%2022%2015%3A20%3A34%20Frank-LoVecchios-MacBook-Pro%20login%5B12351%5D%3A%20USER_PROCESS%3A%2012351%20ttys003%5CnJun%2022%2015%3A20%3A41%20Frank-LoVecchios-MacBook-Pro%20DirectoryService%5B11%5D%3A%20Failed%20Authentication%20return%20is%20being%20delayed%20due%20to%20over%20five%5Ct%5Ct%5Ct%5Ct%5Ct%5Ct%5Ct%20recent%20auth%20failures%20for%20username%3A%20franklovecchio.%5CnJun%2022%2015%3A20%3A42%20Frank-LoVecchios-MacBook-Pro%20sudo%5B12356%5D%3A%20franklovecchio%20%3A%20TTY%3Dttys003%20%3B%20PWD%3D/Users/franklovecchio/Desktop/development/ssh%20%3B%20USER%3Droot%20%3B%20COMMAND%3D/usr/bin/ssh%20-v%20-o%20StrictHostKeyChecking%3Dno%20-i%20gateway-key%20frank@ec2-50-16-144-4.compute-1.amazonaws.com%5CnJun%2022%2015%3A51%3A27%20Frank-LoVecchios-MacBook-Pro%20login%5B12685%5D%3A%20USER_PROCESS%3A%2012685%20ttys004%5CnJun%2022%2015%3A51%3A32%20Frank-LoVecchios-MacBook-Pro%20sudo%5B12690%5D%3A%20franklovecchio%20%3A%20TTY%3Dttys004%20%3B%20PWD%3D/Users/franklovecchio/Desktop/development/ssh%20%3B%20USER%3Droot%20%3B%20COMMAND%3D/usr/bin/ssh%20-v%20-o%20StrictHostKeyChecking%3Dno%20-i%20gateway-key%20frank@ec2-50-16-144-4.compute-1.amazonaws.com%5CnJun%2022%2015%3A53%3A58%20Frank-LoVecchios-MacBook-Pro%20login%5B12685%5D%3A%20DEAD_PROCESS%3A%2012685%20ttys004%5CnJun%2022%2016%3A02%3A35%20Frank-LoVecchios-MacBook-Pro%20%5B0x0-0x215215%5D.com.google.Chrome.canary%5B12778%5D%3A%20%5B0622/160235%3AINFO%3Abreakpad_mac.mm%2889%29%5D%20Breakpad%20disabled%5CnJun%2022%2016%3A02%3A35%20Frank-LoVecchios-MacBook-Pro%20%5B0x0-0x215215%5D.com.google.Chrome.canary%5B12778%5D%3A%20%5B12778%3A519%3A70900383938271%3AERROR%3Aextension_prefs.cc%28949%29%5D%20Bad%20or%20missing%20pref%20%27state%27%20for%20extension%20%27ahfgeienlihckogmohjhadlkjgocpleb%27%5Cn%22%7D","ttl":0}]},{"rowkey":"127.0.0.1:plugins:filesize:2011:5:22","columns":[{"columnname":1308781972940,"columnvalue":"%7B%22date%22%3A1308781972939%2C%22value%22%3A19134%7D","ttl":0},{"columnname":1308781992941,"columnvalue":"%7B%22date%22%3A1308781992941%2C%22value%22%3A19134%7D","ttl":0},{"columnname":1308782012939,"columnvalue":"%7B%22date%22%3A1308782012939%2C%22value%22%3A19134%7D","ttl":0},{"columnname":1308782032940,"columnvalue":"%7B%22date%22%3A1308782032940%2C%22value%22%3A19134%7D","ttl":0},{"columnname":1308782052939,"columnvalue":"%7B%22date%22%3A1308782052939%2C%22value%22%3A19134%7D","ttl":0}]},{"rowkey":"127.0.0.1:plugins:daemons:2011:5:22","columns":[{"columnname":1308781972941,"columnvalue":"%7B%22date%22%3A1308781972941%2C%22returned%22%3A%22completed%22%7D","ttl":0},{"columnname":1308781992943,"columnvalue":"%7B%22date%22%3A1308781992942%2C%22returned%22%3A%22completed%22%7D","ttl":0},{"columnname":1308782012941,"columnvalue":"%7B%22date%22%3A1308782012940%2C%22returned%22%3A%22completed%22%7D","ttl":0},{"columnname":1308782032941,"columnvalue":"%7B%22date%22%3A1308782032941%2C%22returned%22%3A%22completed%22%7D","ttl":0},{"columnname":1308782052941,"columnvalue":"%7B%22date%22%3A1308782052941%2C%22returned%22%3A%22completed%22%7D","ttl":0}]},{"rowkey":"127.0.0.1:plugins:uptime:2011:5:22","columns":[{"columnname":1308781972950,"columnvalue":"%7B%22date%22%3A1308781972949%2C%22days_up%22%3A%22day%22%2C%22time_went_up%22%3A%227%3A02%22%2C%22current_user_sessions%22%3A%225%22%2C%22load_average_1%22%3A%220.66%22%2C%22load_average_5%22%3A%220.73%22%2C%22load_average_15%22%3A%220.73%22%7D","ttl":0},{"columnname":1308781992949,"columnvalue":"%7B%22date%22%3A1308781992949%2C%22days_up%22%3A%22day%22%2C%22time_went_up%22%3A%227%3A02%22%2C%22current_user_sessions%22%3A%225%22%2C%22load_average_1%22%3A%220.61%22%2C%22load_average_5%22%3A%220.72%22%2C%22load_average_15%22%3A%220.72%22%7D","ttl":0},{"columnname":1308782012946,"columnvalue":"%7B%22date%22%3A1308782012945%2C%22days_up%22%3A%22day%22%2C%22time_went_up%22%3A%227%3A03%22%2C%22current_user_sessions%22%3A%225%22%2C%22load_average_1%22%3A%220.56%22%2C%22load_average_5%22%3A%220.70%22%2C%22load_average_15%22%3A%220.71%22%7D","ttl":0},{"columnname":1308782032949,"columnvalue":"%7B%22date%22%3A1308782032949%2C%22days_up%22%3A%22day%22%2C%22time_went_up%22%3A%227%3A03%22%2C%22current_user_sessions%22%3A%225%22%2C%22load_average_1%22%3A%220.89%22%2C%22load_average_5%22%3A%220.77%22%2C%22load_average_15%22%3A%220.74%22%7D","ttl":0},{"columnname":1308782052949,"columnvalue":"%7B%22date%22%3A1308782052948%2C%22days_up%22%3A%22day%22%2C%22time_went_up%22%3A%227%3A03%22%2C%22current_user_sessions%22%3A%225%22%2C%22load_average_1%22%3A%221.05%22%2C%22load_average_5%22%3A%220.81%22%2C%22load_average_15%22%3A%220.75%22%7D","ttl":0}]},{"rowkey":"127.0.0.1:plugins:lsof:2011:5:22","columns":[{"columnname":1308781982298,"columnvalue":"%7B%22date%22%3A1308781982297%2C%22value%22%3A%223577%22%7D","ttl":0},{"columnname":1308782002409,"columnvalue":"%7B%22date%22%3A1308782002408%2C%22value%22%3A%223587%22%7D","ttl":0},{"columnname":1308782022398,"columnvalue":"%7B%22date%22%3A1308782022397%2C%22value%22%3A%223587%22%7D","ttl":0},{"columnname":1308782041941,"columnvalue":"%7B%22date%22%3A1308782041941%2C%22value%22%3A%223587%22%7D","ttl":0},{"columnname":1308782060382,"columnvalue":"%7B%22date%22%3A1308782060381%2C%22value%22%3A%223589%22%7D","ttl":0}]}]}';


var json3 = '{"rowkeys":[{"rowkey":"127.0.0.1:logs:_var_log_system.log:2011:5:22","columns":[{"columnname":1308781952949,"columnvalue":"%7B%22date%22%3A1308781952949%2C%22returned%22%3A%22Jun%2022%2015%3A07%3A02%20Frank-LoVecchios-MacBook-Pro%20login%5B12138%5D%3A%20DEAD_PROCESS%3A%2012138%20ttys001%5CnJun%2022%2015%3A19%3A20%20Frank-LoVecchios-MacBook-Pro%20login%5B12331%5D%3A%20USER_PROCESS%3A%2012331%20ttys001%5CnJun%2022%2015%3A20%3A34%20Frank-LoVecchios-MacBook-Pro%20login%5B12351%5D%3A%20USER_PROCESS%3A%2012351%20ttys003%5CnJun%2022%2015%3A20%3A41%20Frank-LoVecchios-MacBook-Pro%20DirectoryService%5B11%5D%3A%20Failed%20Authentication%20return%20is%20being%20delayed%20due%20to%20over%20five%5Ct%5Ct%5Ct%5Ct%5Ct%5Ct%5Ct%20recent%20auth%20failures%20for%20username%3A%20franklovecchio.%5CnJun%2022%2015%3A20%3A42%20Frank-LoVecchios-MacBook-Pro%20sudo%5B12356%5D%3A%20franklovecchio%20%3A%20TTY%3Dttys003%20%3B%20PWD%3D/Users/franklovecchio/Desktop/development/ssh%20%3B%20USER%3Droot%20%3B%20COMMAND%3D/usr/bin/ssh%20-v%20-o%20StrictHostKeyChecking%3Dno%20-i%20gateway-key%20frank@ec2-50-16-144-4.compute-1.amazonaws.com%5CnJun%2022%2015%3A51%3A27%20Frank-LoVecchios-MacBook-Pro%20login%5B12685%5D%3A%20USER_PROCESS%3A%2012685%20ttys004%5CnJun%2022%2015%3A51%3A32%20Frank-LoVecchios-MacBook-Pro%20sudo%5B12690%5D%3A%20franklovecchio%20%3A%20TTY%3Dttys004%20%3B%20PWD%3D/Users/franklovecchio/Desktop/development/ssh%20%3B%20USER%3Droot%20%3B%20COMMAND%3D/usr/bin/ssh%20-v%20-o%20StrictHostKeyChecking%3Dno%20-i%20gateway-key%20frank@ec2-50-16-144-4.compute-1.amazonaws.com%5CnJun%2022%2015%3A53%3A58%20Frank-LoVecchios-MacBook-Pro%20login%5B12685%5D%3A%20DEAD_PROCESS%3A%2012685%20ttys004%5CnJun%2022%2016%3A02%3A35%20Frank-LoVecchios-MacBook-Pro%20%5B0x0-0x215215%5D.com.google.Chrome.canary%5B12778%5D%3A%20%5B0622/160235%3AINFO%3Abreakpad_mac.mm%2889%29%5D%20Breakpad%20disabled%5CnJun%2022%2016%3A02%3A35%20Frank-LoVecchios-MacBook-Pro%20%5B0x0-0x215215%5D.com.google.Chrome.canary%5B12778%5D%3A%20%5B12778%3A519%3A70900383938271%3AERROR%3Aextension_prefs.cc%28949%29%5D%20Bad%20or%20missing%20pref%20%27state%27%20for%20extension%20%27ahfgeienlihckogmohjhadlkjgocpleb%27%5Cn%22%7D","ttl":0}]},{"rowkey":"127.0.0.1:plugins:filesize:2011:5:22","columns":[{"columnname":1308781972940,"columnvalue":"%7B%22date%22%3A1308781972939%2C%22value%22%3A19134%7D","ttl":0},{"columnname":1308781992941,"columnvalue":"%7B%22date%22%3A1308781992941%2C%22value%22%3A19134%7D","ttl":0},{"columnname":1308782012939,"columnvalue":"%7B%22date%22%3A1308782012939%2C%22value%22%3A19134%7D","ttl":0},{"columnname":1308782032940,"columnvalue":"%7B%22date%22%3A1308782032940%2C%22value%22%3A19134%7D","ttl":0},{"columnname":1308782052939,"columnvalue":"%7B%22date%22%3A1308782052939%2C%22value%22%3A19134%7D","ttl":0}]}]}';

var json4 = '{"rowkeys":[{"rowkey":"127.0.0.1:plugins:daemons:2011:5:22","columns":[{"columnname":1308781972941,"columnvalue":"%7B%22date%22%3A1308781972941%2C%22returned%22%3A%22completed%22%7D","ttl":0},{"columnname":1308781992943,"columnvalue":"%7B%22date%22%3A1308781992942%2C%22returned%22%3A%22completed%22%7D","ttl":0},{"columnname":1308782012941,"columnvalue":"%7B%22date%22%3A1308782012940%2C%22returned%22%3A%22completed%22%7D","ttl":0},{"columnname":1308782032941,"columnvalue":"%7B%22date%22%3A1308782032941%2C%22returned%22%3A%22completed%22%7D","ttl":0},{"columnname":1308782052941,"columnvalue":"%7B%22date%22%3A1308782052941%2C%22returned%22%3A%22completed%22%7D","ttl":0}]}]}';

var json5 = '{"rowkeys":[{"rowkey":"127.0.0.1:plugins:iostat:2011:5:22","columns":[{"columnname":1308781972949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A32%3A52.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.66%2C%22m5%22%3A0.73%2C%22m15%22%3A0.73%7D%7D","ttl":0},{"columnname":1308781992953,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A12.952Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.61%2C%22m5%22%3A0.72%2C%22m15%22%3A0.72%7D%7D","ttl":0},{"columnname":1308782012949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A32.949Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.56%2C%22m5%22%3A0.7%2C%22m15%22%3A0.71%7D%7D","ttl":0},{"columnname":1308782032949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A52.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.89%2C%22m5%22%3A0.77%2C%22m15%22%3A0.74%7D%7D","ttl":0},{"columnname":1308782052948,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A34%3A12.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A1.05%2C%22m5%22%3A0.81%2C%22m15%22%3A0.75%7D%7D","ttl":0}]},{"rowkey":"127.0.0.1:plugins:iostat:2011:5:22","columns":[{"columnname":1308781972949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A32%3A52.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.66%2C%22m5%22%3A0.73%2C%22m15%22%3A0.73%7D%7D","ttl":0},{"columnname":1308781992953,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A12.952Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.61%2C%22m5%22%3A0.72%2C%22m15%22%3A0.72%7D%7D","ttl":0},{"columnname":1308782012949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A32.949Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.56%2C%22m5%22%3A0.7%2C%22m15%22%3A0.71%7D%7D","ttl":0},{"columnname":1308782032949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A52.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.89%2C%22m5%22%3A0.77%2C%22m15%22%3A0.74%7D%7D","ttl":0},{"columnname":1308782052948,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A34%3A12.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A1.05%2C%22m5%22%3A0.81%2C%22m15%22%3A0.75%7D%7D","ttl":0}]},{"rowkey":"127.0.0.1:plugins:iostat:2011:5:22","columns":[{"columnname":1308781972949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A32%3A52.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.66%2C%22m5%22%3A0.73%2C%22m15%22%3A0.73%7D%7D","ttl":0},{"columnname":1308781992953,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A12.952Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.61%2C%22m5%22%3A0.72%2C%22m15%22%3A0.72%7D%7D","ttl":0},{"columnname":1308782012949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A32.949Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.56%2C%22m5%22%3A0.7%2C%22m15%22%3A0.71%7D%7D","ttl":0},{"columnname":1308782032949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A52.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.89%2C%22m5%22%3A0.77%2C%22m15%22%3A0.74%7D%7D","ttl":0},{"columnname":1308782052948,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A34%3A12.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A1.05%2C%22m5%22%3A0.81%2C%22m15%22%3A0.75%7D%7D","ttl":0}]},{"rowkey":"127.0.0.1:plugins:iostat:2011:5:22","columns":[{"columnname":1308781972949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A32%3A52.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.66%2C%22m5%22%3A0.73%2C%22m15%22%3A0.73%7D%7D","ttl":0},{"columnname":1308781992953,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A12.952Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.61%2C%22m5%22%3A0.72%2C%22m15%22%3A0.72%7D%7D","ttl":0},{"columnname":1308782012949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A32.949Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.56%2C%22m5%22%3A0.7%2C%22m15%22%3A0.71%7D%7D","ttl":0},{"columnname":1308782032949,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A33%3A52.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A0.89%2C%22m5%22%3A0.77%2C%22m15%22%3A0.74%7D%7D","ttl":0},{"columnname":1308782052948,"columnvalue":"%7B%22date%22%3A%222011-06-22T22%3A34%3A12.948Z%22%2C%22disk0%22%3A%7B%22kbt%22%3A24.38%2C%22tps%22%3A4%2C%22mbs%22%3A0.09%7D%2C%22cpu%22%3A%7B%22us%22%3A8%2C%22sy%22%3A5%2C%22id%22%3A87%7D%2C%22load_average%22%3A%7B%22m1%22%3A1.05%2C%22m5%22%3A0.81%2C%22m15%22%3A0.75%7D%7D","ttl":0}]}]}';

/*
CloudsandraApi.postBulkData('CFLongType', json5, function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/
/*
var postParams = {
	type: 'external',
	rowMapping: 'rowkey',
	rowType: 'string',
	columnMapping: 'columnname',
	columnType: 'string',
	valueMapping: 'value',
	valueType: 'string',
	cassandraColumnsMapping: ':key,:column,:value'
};
*/

/*
var postParams = {
	type: 'standard',
	rowMapping: 'rowkey',
	rowType: 'string'
};
*/

/*
CloudsandraApi.mapReduceTable('rowKeyWithNoPlatformData', postParams, function(response) {
	CloudsandraApi.parseForDisplay(response);
});


var postParams = {
	overwriteTable : 'rowKeyWithNoPlatformData',
	fromTable : 'CFUTF8Type',
	select : 'rowkey',
	where : 'columnname != first_appeared_on_platform'
};

CloudsandraApi.mapReduceJob(postParams, function(response) {
	CloudsandraApi.parseForDisplay(response);
});



CloudsandraApi.paginateRow('CFUTF8Type', 'clients', '127.0.0.1', '5', function(response) {
	CloudsandraApi.parseForDisplay(response);
});
*/