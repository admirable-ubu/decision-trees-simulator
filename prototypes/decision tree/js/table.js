// Get example data
import { data } from '../exampledata/example1.js';
import { label } from '../exampledata/example1.js';
const attributes = Object.keys(data[0].attributes);

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

function createTable(){
    var tableDiv = document.getElementById('dataTable');

    // Table element
    var tableEl = document.createElement('table');
    tableEl.classList.add('table');
    tableEl.classList.add('caption-top');
    
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

document.addEventListener('DOMContentLoaded', createTable);