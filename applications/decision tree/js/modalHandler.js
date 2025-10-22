import { transformData, getAttributes, getLabelValsDataRows } from './csvHandler.js';

const svgId = 'svgDT';

const valid = 0;
const tooManyRows = 1;
const tooManyLabelVals = 2;
const numericalVals = 3;
const notComplete = 4;
const tooManyCols = 5;

const MAX_ROWS = 151;
const MAX_COLS = 25;

/**
 * Checks whether the user-selected CSV file is valid according to the specified requirements
 * @param {*} data the CSV data
 * @returns whether or not the user-selected CSV file is valid: returns numerical code for each case
 */
function checkUserCsv(data) {
    if (data.length > MAX_ROWS) {
        return tooManyRows;
    }

    const headers = data[0];
    if (headers.length > MAX_COLS) {
        return tooManyCols;
    }

    const attributes = headers.slice(0, -1);
    const labelValsDataRows = getLabelValsDataRows(data, attributes);
    const labelVals = labelValsDataRows[0];

    if (labelVals.length > 2) {
        return tooManyLabelVals;
    }

    const colNum = attributes.length + 1;
    for (let i = 0; i < data.length; i++) {
        let rowCols = 0;
        for (let j = 0; j < data[i].length; j++) {
            if (!isNaN(data[i][j])) {
                return numericalVals;
            }
            rowCols++;
        }
        if (rowCols != colNum) {
            return notComplete;
        }
    }


    return valid;
}

/**
 * Handles the request of a user wanting to upload their own CSV dataset
 */
function handleUserCsv() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    const CSV_MIMES = new Set([
        'text/csv',
        'application/vnd.ms-excel',
        'text/plain'
    ]);

    function isCsvFile(f) {
        const nameOk = /\.csv$/i.test(f?.name || '');
        const typeOk = CSV_MIMES.has((f?.type || '').toLowerCase());
        return nameOk || typeOk;
    }

    if (file && isCsvFile(file)) {
        Papa.parse(file, {
            skipEmptyLines: true,
            complete: function (results) {
                const data = results.data;

                // Check if the introduced CSV file is valid
                const checkReturn = checkUserCsv(data);
                // CSV file is valid
                if (checkReturn == valid) {
                    // Make content container visible if it was still hidden
                    let dataInfoContainer = document.getElementById("dataInfoContainer");
                    if (dataInfoContainer.style.display == "none") {
                        dataInfoContainer.style.display = "block";
                    }
                    let stepByStepContainer = document.getElementById("stepByStepContainer");
                    if (stepByStepContainer.style.display == "none") {
                        stepByStepContainer.style.display = "block";
                    }

                    // Transform, store the data and build the tables and tree upon it
                    transformData(data);

                    // Close the modal
                    const uploadModal = document.getElementById('uploadModal');
                    const modal = bootstrap.Modal.getInstance(uploadModal);
                    modal.hide();

                    // Change the select placeholder back to "Choose example dataset"
                    var selectPlaceholder = document.getElementById('selectPlaceholder');
                    selectPlaceholder.selected = true;

                    var currentDatasetSpan = document.getElementById('currentDatasetSpan');
                    currentDatasetSpan.textContent = file.name;

                    var datasetCardBody = document.getElementById('datasetCardBody');
                    datasetCardBody.style.display = "none";
                    
                    // CSV file is invalid
                } else if (checkReturn == tooManyRows) {
                    alert('The selected file has more than 150 instance rows. Please check the file requirements.');
                } else if (checkReturn == tooManyCols) {
                    alert('The selected file has more than 25 columns. Please check the file requirements.');
                } else if (checkReturn == tooManyLabelVals) {
                    alert('The selected file has a class attribute with more than 2 distinct categories. Please check the file requirements.');
                } else if (checkReturn == numericalVals) {
                    alert('The selected file includes numerical values. Please check the file requirements.');
                } else if (checkReturn == notComplete) {
                    alert('The number of columns of at least one row in the selected file does not match the number of attributes. Please check the file requirements.');
                }
            }
        });
    } else if (!file) {
        alert('No file has been selected. Please select a CSV file and try again.');
    } else if (isCsvFile(file) == false) {
        alert('The selected file is not in CSV format. Please select a CSV file and try again.');
    } else {
        alert('An invalid file has been selected. Please check the file requirements.');
    }
}

export { handleUserCsv }
export default handleUserCsv;