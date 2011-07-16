function Console(api, index) {
	this._api = api;
	this._index = index;
}

Console.prototype.getIndex = function() {
	return this._index;
}

Console.prototype.init = function() {
	this._api.getColumnFamilies(callback_displayColumnFamilies(this));
	//this.api.getColumnFamilyDescription('Authors', callback_displayColumnFamilies(this));
}

function callback_displayColumnFamilies(instance) {
	return function(response) {
		instance._displayColumnFamiles(toObject(response));
	}
}

Console.prototype._displayColumnFamiles = function(responseObj) {
	var newConsole = document.createElement("div");
	newConsole.id = "console_" + this._index;
	document.getElementById("consoles").appendChild(newConsole);
	var columnFamilies = responseObj.columnfamilies;
	var optionStr = "";
	for (var idx = 0, len = columnFamilies.length; idx < len; idx++) {
		var columnFamily = columnFamilies[idx].columnfamily;
		optionStr += "<option value='" + columnFamily.name + "'>" + columnFamily.name + "</option>";
	}
	var html = _CONSOLE_TEMPLATE.replace("selectoptions", optionStr);
	html = html.replace(/consoleIndex/g, this._index);
	newConsole.innerHTML = html;
	this._console = newConsole;
}

var _CONSOLE_TEMPLATE = '<div id="columnFamiliesDisplay">'
						+	'<p><label>Column Families: </label><select id="cfSelect_consoleIndex" onmousedown="handleSelectCF(consoleIndex, this.value)">selectoptions</select></p>'
						+'</div>'
						+'<p><button onclick="addData(consoleIndex)">Add Data</button></p>'
						+'<div id="workarea">'
						+	'<table id="cfTable_consoleIndex"></table>'
						+'</div>';

Console.prototype.getColumnFamily = function(columnFamily) {
	this._selectedColumnFamily = columnFamily;
	this._api.getColumnFamilyDescription(columnFamily, callback_displayColumnFamily(this));
}

function callback_displayColumnFamily(instance) {
	return function(response) {
		instance._displayColumnFamily(toObject(response));
	}
}

Console.prototype._displayColumnFamily = function(responseObj) {
	var cfTable = document.getElementById("cfTable_" + this._index);
}

Console.prototype.addData = function() {
	var authorsData = '{"Arin Sarkissian":{numPosts:11,twitter:"phatduckk",email:"arin@example.com",bio:"bla bla bla"}}';
	this._api.postBulkData("Authors", authorsData, function(response) {
		alert(response)});
}

var postParams = {
		'columnName' : '{value}',
		'indexedColumnName': '{value}'
	};


var jsonStringObject = {"rowkeys": [
                                    {
                                    	"rowkey": "rk",
                                    	"columns": [
                                    	            {
                                    	            	"columnname": "cn",
                                    	            	"columnvalue": "cv",
                                    	            	"ttl" : 60
                                    	            },
                                    	            {
                                    	            	"columnname": "cn",
                                    	            	"columnvalue": "cv",
                                    	            	"ttl" : 60
                                    	            }
                                    	           ]
                                    },
                                    {
                                    	"rowkey": "rk",
                                    	"columns": [
                                    	            {
                                    	            	"columnname": "cn",
                                    	            	"columnvalue": "cv"
                                    	            },
                                    	            {
                                    	            	"columnname": "cn",
                                    	            	"columnvalue": "cv"
                                    	            }
                                    	           ]
                                    }
                                   ]
};