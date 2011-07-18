function CFRow(consoleIndex, rowData) {
	this._consoleIndex = consoleIndex;
	this._data = rowData;
	this._key = rowData.KEY;
	this._keyValuePairs = {};
	for (var name in this._data) {
		if (name == "KEY") {
			continue;
		}
		this._keyValuePairs[name] = new KeyValuePair(this._consoleIndex, this._key, name, this._data[name]);
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
	for (var name in this._keyValuePairs) {
		html += this._keyValuePairs[name].getHtml(); 
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

CFRow.prototype.selectData = function(key) {
	this._keyValuePairs[key].select();
}

function KeyValuePair(consoleIndex, rowKey, key, value) {
	this._consoleIndex = consoleIndex;
	this._rowKey = rowKey;
	this._key = key;
	this._value = value;
	this._id = "keyValuePair_" + this._consoleIndex + "_" + rowKey + key;
}

KeyValuePair.prototype.getHtml = function() {
	var html = "<div class='keyvalue' id='" + this._id + "'" 
						+ " onclick='selectData("+ this._consoleIndex + ", \"" + this._rowKey + "\", \"" + this._key + "\")'>" 
						+	"<span class='key'>" + this._key + "</span>"
						+ "<span class='value'>" + this._value + "</span></div>";
	return html;
}

KeyValuePair.prototype.select = function() {
	var keyValueElement = document.getElementById(this._id);
	var deleteBtn = document.getElementById("deleteDataBtn");
	deleteBtn.parentNode.removeChild(deleteBtn);
	keyValueElement.appendChild(deleteBtn);
	$("#deleteDataBtn").click(KeyValuePairCallback_deleteButtonClick(this));
}

function KeyValuePairCallback_deleteButtonClick(instance) {
	return function() {
		instance.deleteData();
	}
}

KeyValuePair.prototype.deleteData = function() {
	window.consoles[this._consoleIndex].deleteData(this._rowKey, this._key);
}