function CFRow(consoleIndex, rowData) {
	this._consoleIndex = consoleIndex;
	this._data = rowData;
	this._key = rowData.KEY;
	this._keyValuePairs = [];
	for (var name in this._data) {
		if (name == "KEY") {
			continue;
		}
		this._keyValuePairs.push(new KeyValuePair(this._key, name, this._data[name]));
	}
}

CFRow._DATAROWTEMPLATE = '<td><input id="addRowKey_rowIndex" type="text"></input></td>'
							+	'<td><input id="addRowValue_rowIndex" type="text"></input></td>';

CFRow.prototype.getKey = function() {
	return this._key;
}

CFRow.prototype.getHtml = function() {
	var html = "<tr>";
	html += "<td class='rowkey' id='rowKey_" + this._key + "'><span onclick='selectDataRow(" + this._consoleIndex + ",\"" + this._key + "\")'>" + this._key + "</span></td>";
	html += "<td class='rowvalue'>"
				+ "<div class='keyvalueContainer'>";
	for (idx = 0, len = this._keyValuePairs.length; idx < len; idx++) {
		html += this._keyValuePairs[idx].getHtml(); 
	}
	html += "<div class='clear'></div></div></td></tr>";
	return html;
				
}

CFRow.prototype.showOptions = function() {
	var rowKeyElement = document.getElementById('rowKey_' + this._key);
	var rowOptions = document.getElementById("rowOptions");
	rowOptions.parentNode.removeChild(rowOptions);
	//add listener
	for (var idx = 0, len = rowOptions.options; idx < len; idx++) {
		//rowOptions.options[idx].onclick = callback_optionClick(this); 
	}
	rowKeyElement.appendChild(rowOptions);
	$("#deleteRowOption").click(callback_deleteOptionClick(this));
	$("#addDataOption").click(callback_addDataOptionClick(this));
}

function callback_deleteOptionClick(instance) {
	return function() {
		instance.deleteRow();
	}
}

function callback_addDataOptionClick(instance) {
	return function() {
		instance.addData();
	}
}

CFRow.prototype.deleteRow = function() {
	window.consoles[this._consoleIndex].deleteRow(this._key);
}

CFRow.prototype.addData = function() {
	$("#deleteDataRow").click(callback_deleteDataRow);
	$("#addDataRow").click(callback_addDataRow);
	$("#addRowDataDialog").dialog({
		modal: true,
		width: 585,
		buttons: [
		          	{
		          		text: "Ok",
		          		click: CFRowCallback_addData(this)
		          	}
		        ],
		beforeClose: resetAddDataDialog
	});
}

function CFRowCallback_addData(instance) {
	return function() {
		var data = getValueFromAddDataDialog().rowData;
		removeRowOptions();
		instance._addData(data);
		$("#addRowDataDialog").dialog("close");
	}
}

CFRow.prototype._addData = function(data) {
	window.consoles[this._consoleIndex].addData(this._key, data);
}



function KeyValuePair(rowKey, key, value) {
	this._rowKey = rowKey;
	this._key = key;
	this._value = value;
}

KeyValuePair.prototype.getHtml = function() {
	var html = "<div class='keyvalue'><span class='key'>" + this._key + "</span>"
						+ "<span class='value'>" + this._value + "</span></div>";
	return html;
}