var data;
var attributes;
var label;

// To retrieve locally stored csv data
const csvA = 'csvAttributes';
const csvL = 'csvLabel';
const csvD = 'csvDataRows';

/**
 * Creates a table cell that contains the count of an instance of the current dataset 
 * @returns The table cell element
 */
function createCountCell(){
    var countCell = document.createElement('td');
    countCell.style.borderRight = '1px solid black';
    return countCell;
}

/**
 * Creates a table header cell that contains one of the labels
 * @returns The table header cell element
 */
function createLabelCell(){
    var labelCell = document.createElement('th');
    labelCell.style.borderLeft = '1px solid black';
    return labelCell;
}

/**
 * Creates the body rows for the data table
 * @param {*} count Number of the body row
 * @returns The body row for the specified number
 */
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

/**
 * Create the whole data table
 */
function createDataTable(){
    let dataCsv = JSON.parse(sessionStorage.getItem('csvData'));
    data = dataCsv[csvD];
    attributes = dataCsv[csvA];
    label = dataCsv[csvL];

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
    caption.setAttribute("id", "dataTableCaption");
    caption.textContent = 'Current rules: none';
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

export { createDataTable };
export default createDataTable;