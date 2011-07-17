function Console(api, index) {
	this._api = api;
	this._index = index;
}

Console._CONSOLE_TEMPLATE = '<div id="columnFamiliesDisplay">'
							+	'<p></p>'
							+'</div>'
							+'<div>'
							+	'<div id="toolbar" class="ui-widget-header ui-corner-all left">'
							+		'<label>Column Families: </label>'
							+		'<select id="cfSelect_consoleIndex" onmousedown="handleSelectCF(consoleIndex, this.value)">selectoptions</select>'
							+	'</div>'
							+	'<div id="toolbar" class="ui-widget-header ui-corner-all right">'
							+		'<button onclick="takeAction(\'addColumnFamily\', consoleIndex)">Add Column Family</button>'
							+		'<button onclick="takeAction(\'deleteColumnFamily\', consoleIndex)">Delete Column Family</button>'
							+		'<button onclick="takeAction(\'refresh\', consoleIndex)">Refresh</button>'
							+	'</div>'
							+'<div>'
							+'<div class="spacer"></div>'
							+'<div id="workarea">'
							+	'<div class="tabs" id="cfTabs_consoleIndex">'
							+		'<ul>'
							+			'<li><a href="#columns_consoleIndex">Column</a></li>'
							+			'<li><a href="#cfData_consoleIndex" onclick="takeAction(\'showData\', consoleIndex)">Data</a></li>'
							+		'</ul>'
							+		'<div class="columnsDisplay" id="columns_consoleIndex"></div>'
							+		'<div class="cfDataDisplay" id="cfData_consoleIndex"></div>'
							+	'</div>'
							+	'<div id="actionbuttons"></div>'
							+'</div>';


Console.prototype.getIndex = function() {
	return this._index;
}

Console.prototype.init = function() {
	this._selectedColumnFamily = null;
	this._console = null;
	this._consoleId = "console_" + this._index;
	this._consoleModel = new ConsoleModel();
	this._api.getColumnFamilies(callback_displayColumnFamilies(this));
}

function callback_displayColumnFamilies(instance, selectedCF) {
	return function(response) {
		instance._displayColumnFamiles(toObject(response), selectedCF);
		instance.getColumnFamily(selectedCF || instance._selectedColumnFamily);
	}
}

Console.prototype._displayColumnFamiles = function(responseObj, selectedCF) {
	this._selectedColumnFamily = selectedCF;
	var newConsole = document.createElement("div");
	newConsole.id = this._consoleId;
	document.getElementById("consoles").appendChild(newConsole);
	this._console = newConsole;
	this._updateView(responseObj);
	hideProgressbar();
}

Console.prototype._updateView = function(responseObj) {
	var columnFamilies = responseObj.columnfamilies || [];
	var optionStr = "";
	for (var idx = 0, len = columnFamilies.length; idx < len; idx++) {
		var columnFamily = columnFamilies[idx].columnfamily;
		if (idx == 0 && !this._selectedColumnFamily) {
			this._selectedColumnFamily = columnFamily.name;
		}
		
		optionStr += "<option value='" + columnFamily.name + "' "
					+ (columnFamily.name == this._selectedColumnFamily ?"selected " : "")
					+ ">" + columnFamily.name + "</option>";
	}
	var html = Console._CONSOLE_TEMPLATE.replace("selectoptions", optionStr);
	html = html.replace(/consoleIndex/g, this._index);
	$("#" + this._consoleId).append(html);
	$("#" + this._consoleId).
		ready(
			$(function() {
				$("button").button();
			})
		);
}

Console.prototype._clearCurrentView = function() {
	$("#" + this._consoleId).empty();
}

Console.prototype.getColumnFamily = function(columnFamily) {
	this._selectedColumnFamily = columnFamily;
	this._api.getColumnFamilyDescription(columnFamily, callback_displayColumnFamily(this));
}

function callback_displayColumnFamily(instance) {
	return function(response) {
		var responseObj = toObject(response);
		instance._consoleModel.setColumnsData(responseObj);
		instance._displayColumnFamily(responseObj);
	}
}

//displays columns in a CF
Console.prototype._displayColumnFamily = function(responseObj) {
	var colTabId = "columns_" + this._index;
	var html = "<span class='note'>*Click on a row to edit</span>";
	html += "<p><button onclick='takeAction(\"addColumn\", consoleIndex)'>Add Column</button></p>";
	html += "<div class='spacer'></div>";
	if (responseObj.columns.length) {
		var columns = responseObj.columns;
		html += "<table class='columnsTable' id='columnsTable_consoleIndex' cellpadding=10>";
		html += "<tr><th>Name</th><th>Type</th><th>Is Indexed</th></tr>";
		for (var idx = 0, len = columns.length; idx < len; idx++) {
			var column = columns[idx];
			html += "<tr onclick='rowSelected(" + this._index + "," + (idx + 1) +")'" + ">"
					+ "<td>" + column.name+ "</td>"
					+ "<td>" + column.validator + "</td>"
					+ "<td>" + column.index + "</td></tr>"
		}
		html += "</table>";
	} else {
		html += "<p>No columns available!</p>";
	}
	html = html.replace(/consoleIndex/g, this._index);
	$("#" + colTabId).append(html);
	$("#" + colTabId).ready(
				$(function() {
					$(".tabs").tabs({
						selected: 0
					});
					$("button").button();
				})
			);
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
		showProgressbar();
	}
}

Console.prototype._createColumnFamily = function(cfName, cfType) {
	this._api.createColumnFamily(cfName, cfType, callback_create(this, cfName));
}

function callback_create(instance, cfName) {
	return function(response) {
		//if successful
		//delete current view
		//get current colfamily list and display the created family list
		instance._clearCurrentView();
		instance._api.getColumnFamilies(callback_displayColumnFamilies(instance, cfName));
		hideProgressbar();
	}
}

Console.prototype.deleteColumnFamily = function() {
	if (!this._selectedColumnFamily) {
		return;
	}
	//TODO Ask for confirmation
	this._api.deleteColumnFamily(this._selectedColumnFamily, callback_create(this));
}

Console.prototype.refresh = function() {
	this._clearCurrentView();
	this._api.getColumnFamilies(callback_displayColumnFamilies(this));
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
		instance._createColumn(colNameElement.value, colTypeElement.value, indexElement.value == "y");
		//reset
		resetAddColumnDialog();
		//TODO handle when column name is empty
		$(this).dialog("close");
	}
}

Console.prototype._createColumn = function(colName, colType, isIndex) {
	if (isIndex) {
		this._api.createIndexedColumn(this._selectedColumnFamily, colName, colType, callback_createColumn(this, this._selectedColumnFamily));
	} else {
		this._api.createColumn(this._selectedColumnFamily, colName, colType, callback_createColumn(this, this._selectedColumnFamily));
	}
}

function callback_createColumn(instance, cfName) {
	return function(response) {
		//if successful
		//clear existing view
		$("#" + "columns_" + instance._index).empty();
		//refresh view
		instance.getColumnFamily(cfName);
	}
}

Console.prototype.selectRow = function(rowIndex) {
	var colTable = document.getElementById("columnsTable_" + this._index);
	//unselect previous row
	if (typeof this._selectedRowIndex != "undefined") {
		colTable.rows[this._selectedRowIndex].className = "normalRow";
	}	
	colTable.rows[rowIndex].className = "selectedRow";
	var columnData = this._consoleModel.getColumnDataByIndex(rowIndex - 1);
	setValueForAddColumnDialog("Update Column", columnData.name, columnData.validator, columnData.index ? "y" : "n");
	this._selectedRowIndex = rowIndex;
	this.addColumn();
}


Console.prototype.showData = function() {
	if (this._dataLoaded) {
		return;
	}
	var colDataTabId = "cfData_" + this._index;
	var html = '<p><button onclick="takeAction(\'addData\', consoleIndex)">Add Data</button>'
			+ '<button onclick="takeAction(\'getData\', consoleIndex)">Get Row Data</button>'
			+ '<button onclick="takeAction(\'getAllData\', consoleIndex)">Get All Data</button>'
			+ '<button class="optionButtons" id="optionButtons_consoleIndex"></button></p>'
			+ "<div id='cfDataDisplayArea_consoleIndex'></div>";
	html = html.replace(/consoleIndex/g, this._index);
	$("#" + colDataTabId).append(html);
	$("#" + colDataTabId).ready(
			$(function() {
				$("button").button();
			})
		);
	this._dataLoaded = true;
}

Console.prototype.deleteColumn = function() {
	if (typeof this._selectedRow === "undefined") {
		alert("Select a column to delete!");
	} else {
		alert("Not yet implemented!");
	}
}

Console.prototype.addData = function() {
	var authorsData = '{"Arin Sarkissian":[{numPosts:11,twitter:"phatduckk",email:"arin@example.com",bio:"bla bla bla"}]}';
	this._api.postData("Authors", "sinduja", postParams, null, function(response) {
		alert(response)});
}

Console.prototype.getData = function() {
	$("#getDataDialog").dialog({
		buttons: [{
			text: "Ok",
			click: callback_getData(this)
		}]
	});
}

function callback_getData(instance) {
	return function() {
		var rowkeyElement = document.getElementById("rowkeyInput");
		instance._getRowData(rowkeyElement.value);
		rowkeyElement.value = "";
	}
}

Console.prototype._getRowData = function(rowKey) {
	this._api.getRow(this._selectedColumnFamily, rowKey, function(response) {
		alert(response);
	});
}

Console.prototype.getAllData = function() {
	this._api.queryCQL(this._selectedColumnFamily, "SELECT *", callback_getAllData(this));
}

function callback_getAllData(instance) {
	return function(response) {
		var responseObj = toObject(response);
		instance._consoleModel.setCFData(responseObj);
		instance._displayCFData(toObject(response));
	}
}

Console.prototype._displayCFData = function(responseObj) {
	if (this._cfRows) {
		$("#cfDataDisplayArea_" + this._index).empty();
		delete this._cfRows;
	}
	var html = "<table class='cfDisplayTable'>";
	this._cfRows = {};
	for (var rowKey in responseObj) {
		var row = new CFRow(this._index, responseObj[rowKey]);
		this._cfRows[rowKey] = row;
		html += row.getHtml();
	}
	html += "</table>";
	$("#cfDataDisplayArea_" + this._index).append(html);
}

Console.prototype.selectDataRow = function(rowKey) {
	if (!this._optionButton) {
		$("#optionButtons_" + this._index).button({
			icons: {
				primary: "ui-icon-trash"
			}
		});
		this._optionButton = document.getElementById("optionButtons_" + this._index);
	}
	this._cfRows[rowKey].showOptions(this._optionButton);
}

Console.prototype.deleteRow = function(rowKey) {
	this._api.deleteRow(this._selectedColumnFamily, rowKey, callback_deleteRow(this));
}

function callback_deleteRow(instance) {
	return function() {
		instance.getAllData();
	}
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


function ConsoleModel(model) {
	this._model = model;
}

ConsoleModel.prototype.setColumnsData = function(columnsData) {
	this._columnsData = columnsData;
}

ConsoleModel.prototype.getColumnData = function(colName) {
	var columns = this._columnsData.columns || [];
	for (var idx = 0, len = columns.length; idx < len; idx++) {
		if (columns[idx].name === colName) {
			return columns[idx];
		}
	}
	return null;
}

ConsoleModel.prototype.getColumnDataByIndex = function(index) {
	return (this._columnsData.columns || [])[index];
}

ConsoleModel.prototype.setCFData = function(cfData) {
	this._cfData = cfData;
}