import { buildTree, destroyTree } from './tree.js';
import { createTable } from './table.js';
import { createValueTable, loadData } from './valueTable.js';
import { initialStep } from './stepbystep.js';

const svgId = 'svgDT';

function csvHandler() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (file && file.type === 'text/csv') {
        Papa.parse(file, {
            skipEmptyLines: true,
            complete: function (results) {
                const data = results.data;

                const headers = data[0];
                const attributes = headers.slice(0, -1);
                const label = headers[headers.length - 1];

                console.log(attributes);
                const attributeValues = attributes.map((key, index) => {
                    const values = new Set();
                    for (let i = 1; i < data.length; i++) {
                        values.add(data[i][index]);
                    }
                    return Array.from(values);
                });

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

                const labelValuesArray = Array.from(labelValues);

                let csvUserData = {};
                csvUserData['userAttributes'] = attributes;
                csvUserData['userAttributeValues'] = attributeValues;
                csvUserData['userLabel'] = label;
                csvUserData['userLabelValues'] = labelValuesArray;
                csvUserData['userData'] = dataRows;

                console.log(csvUserData);

                // Optionally save to local storage or other client-side storage
                localStorage.setItem('csvData', JSON.stringify(csvUserData));

                const storedData = localStorage.getItem('csvData');

                if(storedData){

                }

                // Close the modal
                const uploadModal = document.getElementById('uploadModal');
                const modal = bootstrap.Modal.getInstance(uploadModal);
                modal.hide();

                // Reset everything and build the tree and tables based on the new data 
                initialStep();
                var svgEl = document.getElementById(svgId);
                destroyTree(svgEl);
                buildTree(true);
                createTable(true);
                loadData(true);
                createValueTable(true);
            }
        });
    } else {
        alert('Please upload a valid CSV file.');
    }
}

export { csvHandler }
export default csvHandler;