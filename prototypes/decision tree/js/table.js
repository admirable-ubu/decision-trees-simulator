// Get example data
import { data1, attributes1, label1 } from '../exampledata/example1.js';

var data;
var attributes;
var label;

// To retrieve locally stored user data
const userA = 'userAttributes';
const userL = 'userLabel';
const userD = 'userData';

function createCountCell(){
    var countCell = document.createElement('td');
    countCell.style.borderRight = '1px solid black';
    return countCell;
}

function createLabelCell(){
    var labelCell = document.createElement('th');
    labelCell.style.borderLeft = '1px solid black';
    return labelCell;
}

function createBodyRows(count){
    var bodyRow = document.createElement('tr');
    var bodyCell = createCountCell();
    bodyCell.textContent = count;
    bodyRow.appendChild(bodyCell);
    var attributeValues = Object.values(data[count-1].attributes);
    for(var i = 0; i < attributeValues.length; i++){
        bodyCell = document.createElement('td');
        bodyCell.textContent = attributeValues[i];
        bodyRow.appendChild(bodyCell);
    }
    bodyCell = createLabelCell();
    bodyCell.textContent = data[count-1].label;
    bodyRow.appendChild(bodyCell);

    return bodyRow;
}

function createTable(userData = false){
    if(userData){
        let userCsvData = JSON.parse(localStorage.getItem('csvData'));
        data = userCsvData[userD];
        attributes = userCsvData[userA];
        label = userCsvData[userL];
    } else {
        data = data1;
        attributes = attributes1;
        label = label1;
    }

    var tableDiv = document.getElementById('dataTable');

    // Remove table of a previous step
    if (tableDiv.getElementsByTagName('table')[0] != null) {
        tableDiv.removeChild(tableDiv.getElementsByTagName('table')[0]);
    }

    // Table element
    var tableEl = document.createElement('table');
    tableEl.classList.add('table');
    tableEl.classList.add('caption-top');
    tableEl.setAttribute("id", "dataTableEl");
    
    // Caption
    var caption = document.createElement('caption');
    caption.textContent = "Example data 1";

    tableEl.appendChild(caption);

    // Header
    var header = document.createElement('thead');
    header.classList.add('sticky-top');
    var headerRow = document.createElement('tr');
    var headerCell = document.createElement('th');
    headerCell.style.borderRight = '1px solid black';
    headerCell.textContent = '#';
    headerRow.appendChild(headerCell);
    for (const attribute of attributes){
        headerCell = document.createElement('th');
        headerCell.textContent = attribute;
        headerRow.appendChild(headerCell);
    }
    headerCell = createLabelCell();
    headerCell.textContent = label;
    headerRow.appendChild(headerCell);
    header.appendChild(headerRow);

    tableEl.appendChild(header);

    // Body
    var body = document.createElement('tbody');
    body.classList.add('table-group-divider');
    
    var bodyRow = null;
    for(var i = 1; i <= data.length; i++){
        bodyRow = createBodyRows(i);
        body.appendChild(bodyRow);
    }

    tableEl.appendChild(body);
    tableDiv.appendChild(tableEl);
}

document.addEventListener('DOMContentLoaded', function () {
    createTable(false);
});

export { createTable };
export default createTable;