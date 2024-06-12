import { buildTree, destroyTree } from './tree.js';
import { createDataTable } from './dataTable.js';
import { createValueTable, loadData } from './valueTable.js';
import { initialStep } from './stepbystep.js';
import { getDataInfo, getDataLink } from "../exampledata/dataInfo.js";

const svgId = 'svgDT';

// Example dataset names
const dataset1 = "Play Golf 1";
const dataset2 = "Play Golf 2";
const dataset3 = "Iris";
const dataset4 = "Mushrooms";
const dataset5 = "Lenses";

/**
 * Gets all each attribute's distinct categories/values
 * @param {*} data The dataset
 * @param {*} attributes Array of the attribute names
 * @returns Array of arrays that contain each attribute's distinct categories/values
 */
function getAttributes(data, attributes) {
    const attributeValues = attributes.map((key, index) => {
        const values = new Set();
        for (let i = 1; i < data.length; i++) {
            values.add(data[i][index]);
        }
        return Array.from(values);
    });

    return attributeValues;
}

/**
 * Gets all the distinct label values and data rows
 * @param {*} data The dataset
 * @param {*} attributes Array of the attribute names
 * @returns An array of all distinct label values and all data rows as an array of objects
 */
function getLabelValsDataRows(data, attributes) {
    const labelValues = new Set();
    const dataRows = data.slice(1).map(row => {
        const attributeObj = {};
        attributes.forEach((key, index) => {
            attributeObj[key] = row[index];
        });
        const label = row[row.length - 1];
        labelValues.add(label);
        return { attributes: attributeObj, label: label };
    });

    return [Array.from(labelValues), dataRows];
}

/**
 * Transform the parsed data into a form that can be used by the program
 * @param {*} data The dataset
 */
function transformData(data) {
    const headers = data[0];
    const attributes = headers.slice(0, -1);
    const label = headers[headers.length - 1];

    const attributeValues = getAttributes(data, attributes);

    const labelValsDataRows = getLabelValsDataRows(data, attributes);
    const labelValuesArray = labelValsDataRows[0];
    const dataRows = labelValsDataRows[1];

    let dataCsv = {};
    dataCsv['csvAttributes'] = attributes;
    dataCsv['csvAttributeValues'] = attributeValues;
    dataCsv['csvLabel'] = label;
    dataCsv['csvLabelValues'] = labelValuesArray;
    dataCsv['csvDataRows'] = dataRows;

    // Save to local storage
    sessionStorage.setItem('csvData', JSON.stringify(dataCsv));

    // Reset everything and build the tree and tables based on the new data 
    var svgEl = document.getElementById(svgId);
    destroyTree(svgEl);
    buildTree();

    createDataTable();
    loadData();
    createValueTable(1);
    initialStep();
}

/**
 * Parses the example data and displays the right information about the dataset
 * @param {*} selectedExample The name of the selected example dataset
 */
function loadExampleData(selectedExample) {
    var filePath = null;
    switch (selectedExample) {
        case dataset1:
            filePath = "exampledata/playgolf_1.csv";
            break;
        case dataset2:
            filePath = "exampledata/playgolf_2.csv";
            break;
        case dataset3:
            filePath = "exampledata/iris.csv";
            break;
        case dataset4:
            filePath = "exampledata/mushrooms.csv";
            break;
        case dataset5:
            filePath = "exampledata/lenses.csv";
            break;
    }
    if (filePath != null) {
        $.ajax({
            type: "GET",
            url: filePath,
            dataType: "text",
            success: function (data) {
                var parsedData = Papa.parse(data, { skipEmptyLines: true });
                transformData(parsedData.data);
            }
        });


        let dataInfoContainer = document.getElementById("dataInfoContainer");
        if (dataInfoContainer.style.display == "none") {
            dataInfoContainer.style.display = "block";
        }
        let stepByStepContainer = document.getElementById("stepByStepContainer");
        if (stepByStepContainer.style.display == "none") {
            stepByStepContainer.style.display = "block";
        }

        var currentDatasetSpan = document.getElementById('currentDatasetSpan');
        currentDatasetSpan.textContent = selectedExample;

        var datasetCardBody = document.getElementById('datasetCardBody');
        if (datasetCardBody.style.display == "none") {
            datasetCardBody.style.display = "block";
        }

        var datasetCardText = document.getElementById('datasetCardText');
        datasetCardText.textContent = getDataInfo(selectedExample);

        var datasetCardLink = document.getElementById('datasetCardLink');
        datasetCardLink.href = getDataLink(selectedExample);
    }
}

export { loadExampleData, transformData, getAttributes, getLabelValsDataRows }
export default loadExampleData;