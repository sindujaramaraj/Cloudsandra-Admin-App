function Console(api, index) {
	this._api = api;
	this._index = index;
}

Console._CONSOLE_TEMPLATE = '<div id="columnFamiliesDisplay">'
							+	'<p><label>Column Families: </label><select id="cfSelect_consoleIndex" onmousedown="handleSelectCF(consoleIndex, this.value)">selectoptions</select></p>'
							+'</div>'
							+'<div id="toolbar" class="ui-widget-header ui-corner-all">'
							+	'<button onclick="takeAction(\'addData\', consoleIndex)">Add Data</button>'
							+	'<button onclick="takeAction(\'addColumnFamily\', consoleIndex)">Add Column Family</button>'
							+	'<button onclick="takeAction(\'addColumn\', consoleIndex)">Add Column</button>'
							+'</div>'
							+'<div id="workarea">'
							+	'<div id="actionbuttons"></div>'
							+'</div>';


Console.prototype.getIndex = function() {
	return this._index;
}

Console.prototype.init = function() {
	this._selectedColumnFamily = null;
	this._console = null;
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
	var columnFamilies = responseObj.columnfamilies || [];
	var optionStr = "";
	for (var idx = 0, len = columnFamilies.length; idx < len; idx++) {
		var columnFamily = columnFamilies[idx].columnfamily;
		optionStr += "<option value='" + columnFamily.name + "'>" + columnFamily.name + "</option>";
	}
	var html = Console._CONSOLE_TEMPLATE.replace("selectoptions", optionStr);
	html = html.replace(/consoleIndex/g, this._index);
	$("#" + newConsole.id).append(html);
	$("#" + newConsole.id).ready(
			$(function() {
				$("button").button();
			})
		);
	this._console = newConsole;
	$("#progressbar").progressbar("destroy");
}

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

Console.prototype.addColumnFamily = function(responseObj) {
	$("#addCFDialog").dialog({
		height: 250,
		width: 350,
		modal: true,
		buttons: [{
			text: "Ok",
		    click: callback_addColumnFamily(this)
		   }]
	});
}

function callback_addColumnFamily(instance) {
	return function() {
		var cfNameElement = document.getElementById("cfName");
		var cfTypeElement = document.getElementById("cfSortingType");
		instance._createColumnFamily(cfNameElement.value, cfTypeElement.value);
		//reset
		cfNameElement.value = "";
		cfTypeElement.selectedIndex = 0;
		//TODO handle when column family name is empty
		$(this).dialog("close");
	}
}

Console.prototype._createColumnFamily = function(cfName, cfType) {
	this._api.createColumnFamily(cfName, cfType, callback_create(this, cfName));
}

function callback_create(instance, cfName) {
	return function(response) {
		//if successful
		instance.getColumnFamily(cfName);
	}
}

Console.prototype.addColumn = function() {
	$("#addColumnDialog").dialog({
		height: 300,
		width: 350,
		modal: true,
		buttons: [{
			text: "Ok",
		    click: callback_addColumn(this)    	
		   }]
	});
}

function callback_addColumn(instance) {
	return function() {
		var colNameElement = document.getElementById("colName");
		var colTypeElement = document.getElementById("colSortingType");
		var indexElement = document.getElementById("indexSelect");
		instance._createColumn(colNameElement.value, colTypeElement.value, indexElement.value);
		//reset
		colNameElement.value = "";
		colTypeElement.selectedIndex = 0;
		indexElement.selectedIndex = 0;
		//TODO handle when column name is empty
		$(this).dialog("close");
	}
}

Console.prototype._createColumn = function(colName, colType, isIndex) {
	if (isIndex) {
		this._api.createIndexedColumn(this._selectedColumnFamily, colName, colType, callback_create(this, this._selectedColumnFamily));
	} else {
		this._api.createColumn(this._selectedColumnFamily, colName, colType, callback_create(this, this._selectedColumnFamily));
	}
}

Console.prototype.addData = function() {
	var authorsData = '{"Arin Sarkissian":[{numPosts:11,twitter:"phatduckk",email:"arin@example.com",bio:"bla bla bla"}]}';
	this._api.postData("Authors", "sinduja", postParams, null, function(response) {
		alert(response)});
}

var postParams = "{'columnName' : '{value}','indexedColumnName': '{value}'}";


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


function keyValuePair(key, value, indexed, type) {
	
}

function column(columnFamily, name, keyValuePairs, indexed, type) {
	
}

function columnFamily(name, type, columns) {
	
}