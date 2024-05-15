import { goToStep } from './stepbystep.js';
import { entropy } from '../../../lib/entropy-calculator.js';

const STD_LEAFHEIGHT = 133;
const STD_NODEHEIGHT = 92;
const STD_LEAFWIDTH = 82;
const STD_NODEWIDTH = 82;

const STD_BRANCH_FONTSIZE = 12;

var svgWidth = 0;
var svgHeight = 0;

var nodeCount = 0;
var leafCount = 0;


// Get example data
import { data } from '../exampledata/example1.js';
const attributes = Object.keys(data[0].attributes);

// import data from '../exampledata/example1.mjs';
// const attributes = Object.keys(data[0].attributes);

// function loadExampleData(){
//     fetch('./exampledata/example1.json')
//     .then(response => response.json())
//     .then(jsonData => {
//         data = jsonData;
//         attributes = Object.keys(data[0].attributes);
//     })
//     .catch(error => console.error('Error fetching example data:', error));
// }


class NodeValues {
    constructor(class1, class2, n, entropy) {
        this.class1 = class1;
        this.class2 = class2;
        this.n = n;
        this.entropy = entropy;
    }
}

class TreeNode {
    constructor(id, attribute, nodeValues, isLeaf = false, label, prevBranchVal) {
        this.id = id;
        this.attribute = attribute;

        this.nodeValues = nodeValues;
        this.isLeaf = isLeaf;
        this.label = label;

        this.prevBranchVal = prevBranchVal;
        this.children = [];
    }
}



function mostCommonLabel(data) {
    var labels = [];
    data.forEach(function (row) {
        labels.push(row.label);
    });

    var counts = {};
    for (var i = 0; i < labels.length; i++) {
        counts[labels[i]] = counts[labels[i]] ? counts[labels[i]] + 1 : 1;
    }

    var max = 0;
    var maxLabel = null;
    for (var i = 0; i < labels.length; i++) {
        if (counts[labels[i]] > max) {
            max = counts[labels[i]];
            maxLabel = labels[i];
        }
    }

    return maxLabel;
}

function entropyLabels(labels) {
    // Count the occurrence of each label value
    var counts = {};
    for (const label of labels) {
        counts[label] = counts[label] ? counts[label] + 1 : 1;
    }

    // Calculate probabilities
    var sum = labels.length;
    var pValues = [];
    for (const labelCount of Object.values(counts)) {
        pValues.push(labelCount / sum);
    }

    // Calculate the entropy
    var e = entropy(pValues);
    return e;
}

function infoGain(data, attribute) {
    // Save the labels for each of the attribute's instances in an array
    var attributeIndex = attributes.indexOf(attribute);
    var attributeLabels = [];
    data.forEach(function (row) {
        attributeLabels.push([Object.values(row.attributes)[attributeIndex], row.label]);
    });

    // Save only the labels to calculate this attribute's entropy
    var labels = [];
    attributeLabels.forEach(function (row) {
        labels.push(row[1]);
    });

    // Caclulate entropy for the whole attribute
    var e = entropyLabels(labels);

    // Save the attribute values in a set
    var attributeValues = new Set(data.map(instance => Object.values(instance.attributes)[attributeIndex]));
    

    // Count the number of instances for each value
    var attributeValuesCounts = (data.map(instance => Object.values(instance.attributes)[attributeIndex]));

    var counts = {};
    attributeValuesCounts.forEach(function (row) {
        counts[row] = counts[row] ? counts[row] + 1 : 1;
    });

    // Calculate the entropy for each value
    var entropies = [];
    for (const value of attributeValues) {
        var subset = attributeLabels.filter(instance => instance[0] === value);
        // Save only the labels to calculate this attribute's entropy
        var subsetLabels = [];
        subset.forEach(function (row) {
            subsetLabels.push(row[1]);
        });
        entropies.push([entropyLabels(subsetLabels), counts[value], value]);
    }

    // Calculate the information gain
    var infoGain = e;
    for (const entropy of entropies) {
        infoGain -= entropy[0] * (entropy[1] / data.length);
    }
    return infoGain;
}


function findBestAttribute(data, attributes) {
    var bestAttribute = null;
    var maxGain = 0;
    attributes.forEach(function (attribute) {
        var gain = infoGain(data, attribute);
        if (gain > maxGain) {
            maxGain = gain;
            bestAttribute = attribute;
        }
    });
    return bestAttribute;
}

function id3(data, attributes, prevBranchVal, nodeId, leafId) {
    if (data.length === 0) return null;
    var allPositive = true;
    var allNegative = true;
    var class1 = 0;
    var class2 = 0;
    var n = data.length;

    // Save the labels in an array
    var datasetLabels = [];
    data.forEach(function (row) {
        datasetLabels.push(row.label);
    });

    // Caclulate entropy for the dataset
    var e = entropyLabels(datasetLabels).toFixed(2);

    for (const row of data) {
        if (row.label == 'No') {
            class2++;
            allPositive = false;
        }
        if (row.label == 'Yes') {
            class1++;
            allNegative = false;
        }
    }

    // Check if we have reached a leaf node
    if (allPositive) {
        var nextLeafId = leafId[0] + (+leafId[1] + 1);
        return [new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, 'Yes', prevBranchVal), nodeId, nextLeafId];
    }
    if (allNegative) {
        var nextLeafId = leafId[0] + (+leafId[1] + 1);
        return [new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, 'No', prevBranchVal), nodeId, nextLeafId];
    }
    if (attributes.length === 0) {
        var nextLeafId = leafId[0] + (+leafId[1] + 1);
        return [new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, mostCommonLabel(data), prevBranchVal), nodeId, nextLeafId];
    }

    // Find the current best attribute to split the data on
    var bestAttribute = findBestAttribute(data, attributes);
    var tree = new TreeNode(nodeId, bestAttribute, new NodeValues(class1, class2, n, e), false, null, null);

    // Split the data on the best attribute
    var attributeValues = new Set(data.map(instance => instance.attributes[bestAttribute]));

    nodeId = nodeId[0] + (+nodeId[1] + 1);

    // Do a recursive call for each value of the selected attribute or add a leaf node if the value's subset is empty
    for (const value of attributeValues) {
        var subset = data.filter(instance => instance.attributes[bestAttribute] === value);
        var remainingAttributes = attributes.filter(attribute => attribute !== bestAttribute);

        if (subset.length === 0) {
            tree.children.push(new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, mostCommonLabel(subset), prevBranchVal));
        } else {
            tree.prevBranchVal = prevBranchVal;
            var returnVals = id3(subset, remainingAttributes, value, nodeId, leafId);
            tree.children.push(returnVals[0]);
            nodeId = returnVals[1];
            leafId = returnVals[2];
        }
    }
    return [tree, nodeId, leafId];
}

function createNewUse(id, href, x, y, width, height){
    // Create a new 'use' element and set the node's position attributes
    var newUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    newUse.setAttribute('id', id);
    newUse.setAttribute('href', href);
    newUse.setAttribute('x', x);
    newUse.setAttribute('y', y);
    newUse.setAttribute('width', width);
    newUse.setAttribute('height', height);

    return newUse
}

function createNode(nodeId, n, e, attribute, x, y, width, height) {
    var svgEl = document.getElementById('svgDT');
    var nodeTemplate = document.getElementById('node');
    var nodeNumber = nodeId.substring(1);

    // Clone the template
    var clonedTemplate = nodeTemplate.cloneNode(true);
    clonedTemplate.setAttribute('id', 'node' + nodeNumber);

    // Update text contents
    clonedTemplate.querySelector('#nodeNr').textContent += nodeNumber;
    clonedTemplate.querySelector('#nodeN').textContent += n;
    clonedTemplate.querySelector('#nodeE').textContent += e;
    clonedTemplate.querySelector('#nodeAttribute').textContent = attribute;

    // Append cloned template to the svg and return the use element
    svgEl.appendChild(clonedTemplate);
    return createNewUse('useNode' + nodeNumber, '#node' + nodeNumber, x, y, width, height);
}


function createLeaf(leafId, n, yes, no, e, label, x, y, width, height) {
    var svgEl = document.getElementById('svgDT');
    var leafTemplate = document.getElementById('leaf');
    var leafNumber = leafId.substring(1);

    // Clone the template
    var clonedTemplate = leafTemplate.cloneNode(true);
    clonedTemplate.setAttribute('id', 'leaf' + leafNumber);

    // Update text contents
    clonedTemplate.querySelector('#leafNr').textContent += leafNumber;
    clonedTemplate.querySelector('#leafN').textContent += n;
    clonedTemplate.querySelector('#leafYes').textContent += yes;
    clonedTemplate.querySelector('#leafNo').textContent += no;
    clonedTemplate.querySelector('#leafE').textContent += e;
    clonedTemplate.querySelector('#leafLabel').textContent += label;

    // Append cloned template to the svg and return the use element
    svgEl.appendChild(clonedTemplate);
    return createNewUse('useLeaf' + leafNumber, '#leaf' + leafNumber, x, y, width, height);
}


function createBranch(nodeId, x1, y1, x2, y2, value) {
    var svgEl = document.getElementById('svgDT');
    var branchTemplate = document.getElementById('branch');

    // Clone the template
    var clonedTemplate = branchTemplate.cloneNode(true);
    clonedTemplate.setAttribute('id', 'branch' + nodeId);

    // Update position attributes and ids
    if (x2 < x1) {
        var positionAttribute = 'M' + x2 + ' ' + y2 + ' ' + x1 + ' ' + y1;
        clonedTemplate.querySelector('#branchPath').setAttribute('marker-end', '');
        clonedTemplate.querySelector('#branchPath').setAttribute('marker-start', 'url(#arrowMarkerReverse)');
    } else {
        var positionAttribute = 'M' + x1 + ' ' + y1 + ' ' + x2 + ' ' + y2;
        clonedTemplate.querySelector('#branchPath').setAttribute('marker-end', 'url(#arrowMarker)');
    }
    clonedTemplate.querySelector('#branchPath').setAttribute('d', positionAttribute);
    clonedTemplate.querySelector('#branchValue').textContent = value;

    var textSizeRatio = (y2 - y1) / 100;
    clonedTemplate.querySelector('#branchValue').setAttribute('font-size', textSizeRatio * STD_BRANCH_FONTSIZE);
    if (x1 === x2) {
        clonedTemplate.querySelector('#branchTP').setAttribute('startOffset', (y2 - y1) * 0.1);
    } else {
        clonedTemplate.querySelector('#branchTP').setAttribute('startOffset', (y2 - y1) * 0.2);
    }
    clonedTemplate.querySelector('#branchPath').setAttribute('id', 'branchPath' + nodeId);
    clonedTemplate.querySelector('#branchTP').setAttribute('href', '#branchPath' + nodeId);
    clonedTemplate.querySelector('#branchTP').setAttribute('id', 'branchTP' + nodeId);

    // Create a new 'use' element
    var newUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    newUse.setAttribute('id', 'useBranch' + nodeId);
    newUse.setAttribute('href', '#branch' + nodeId);

    // Append cloned template and use element to the svg
    svgEl.appendChild(clonedTemplate);
    return newUse;
}


// Calculate the tree's depth (including the root node)
function calcTreeDepth(rootNode) {
    if (!rootNode) return 0;
    if (rootNode.children.length === 0) return 1;

    var maxDepth = 0;

    rootNode.children.forEach(child => {
        maxDepth = Math.max(maxDepth, calcTreeDepth(child));
    });

    return maxDepth + 1;
}

// Calculate the tree's width by getting the maximum amount of nodes a level has
function calcTreeWidth(rootNode) {
    if (!rootNode) return 0;
    if (rootNode.children.length === 0) return 0;

    var maxWidth = 0;
    var maxWidth2 = 0;

    rootNode.children.forEach(child => {
        maxWidth++;
        child.children.forEach(() => {
            maxWidth2++;
        });
    });
    maxWidth = Math.max(maxWidth, maxWidth2);

    rootNode.children.forEach(child => {
        maxWidth = Math.max(maxWidth, calcTreeWidth(child));
    });

    return maxWidth;
}

function calcSubtreesRightBorder(treeLeftBorder, childrenNr, treeSplitByChildren) {
    var subtreesRightBorders = [];
    for (var i = 0; i < childrenNr; i++) {
        subtreesRightBorders.push(treeLeftBorder + (i + 1) * treeSplitByChildren);
    }
    return subtreesRightBorders;
}

function calcNodePositions(node, treeBorders, nodeWidth, nodeHeight, leafWidth, leafHeight, group, groupId, svgEl) {
    // console.log(treeBorders);
    var nodeXvalue = ((treeBorders[0] + treeBorders[1]) / 2) - (nodeWidth / 2);

    var useNode = null;
    if (node.isLeaf) {
        useNode = createLeaf(node.id, node.nodeValues.n, node.nodeValues.class1, node.nodeValues.class2, node.nodeValues.entropy, node.label,
            nodeXvalue, treeBorders[2], leafWidth, leafHeight);
    } else {
        useNode = createNode(node.id, node.nodeValues.n, node.nodeValues.entropy, node.attribute, nodeXvalue, treeBorders[2], nodeWidth, nodeHeight);
    }
    svgEl.appendChild(group);
    group.appendChild(useNode);

    // Return if it's a leaf node
    var childrenNr = node.children.length;
    if (childrenNr === 0) return groupId;

    var treeSplitByChildren = (treeBorders[1] - treeBorders[0]) / childrenNr;

    var subtreesRightBorders = [];

    // If there is not enough space for a single node, make the subtree bigger than usual
    if (treeSplitByChildren < nodeWidth) {
        treeSplitByChildren = nodeWidth + 5;
        var subtreeLeftBorder = treeBorders[0] - (treeSplitByChildren / childrenNr);

        // Shift the following subtrees to the right if it would go too far left
        if (subtreeLeftBorder < 0) {
            subtreeLeftBorder = 0;
            subtreesRightBorders = calcSubtreesRightBorder(subtreeLeftBorder, childrenNr, treeSplitByChildren);
        }
        subtreesRightBorders = calcSubtreesRightBorder(subtreeLeftBorder, childrenNr, treeSplitByChildren);

        // Shift the following subtrees to the left if it would go too far right
        if (subtreesRightBorders[childrenNr - 1] > svgWidth) {
            var spaceNeeded = subtreesRightBorders[childrenNr - 1] - svgWidth;
            // console.log(spaceNeeded);
            subtreeLeftBorder -= spaceNeeded;
            subtreesRightBorders = calcSubtreesRightBorder(subtreeLeftBorder, childrenNr, treeSplitByChildren);
        }
    } else {
        // Calculate right borders for each subtree
        subtreesRightBorders = calcSubtreesRightBorder(treeBorders[0], childrenNr, treeSplitByChildren);
    }
    // console.log(subtreesRightBorders);



    let subtreesBorders = [];
    for (var i = 0; i < childrenNr; i++) {

        let leftBorder = subtreesRightBorders[i] - treeSplitByChildren;
        let rightBorder = subtreesRightBorders[i];
        let topBorder = treeBorders[2] + (2 * leafHeight);
        let bottomBorder = svgHeight;
        subtreesBorders.push([leftBorder, rightBorder, topBorder, bottomBorder]);
    }
    // console.log(subtreesBorders);

    var nodeSplitByChildren = nodeWidth / childrenNr;
    var branchX1values = [];
    for (var i = 0; i < childrenNr; i++) {
        branchX1values.push(nodeXvalue + (nodeSplitByChildren - (nodeSplitByChildren / 2) + (i * nodeSplitByChildren)));
    }

    var branchX2values = [];
    for (var i = 0; i < childrenNr; i++) {
        branchX2values.push(subtreesBorders[i][1] - (treeSplitByChildren / 2));
    }

    var branchY1value = treeBorders[2] + nodeHeight - 1;
    var branchY2value = subtreesBorders[0][2] - 3;
    for (var i = 0; i < childrenNr; i++) {
        var nextGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nextGroup.setAttribute('id', 'g' + (+groupId.substring(1) + 1));
        nextGroup.style.display = 'none';

        nextGroup.appendChild(createBranch(node.children[i].id, branchX1values[i], branchY1value, branchX2values[i], branchY2value, node.children[i].prevBranchVal));

        //Recursive call
        groupId = calcNodePositions(node.children[i], subtreesBorders[i], nodeWidth, nodeHeight, leafWidth, leafHeight, nextGroup, nextGroup.id, svgEl);
    }
    return groupId;
}

function buildTree() {
    var treeValues = id3(data, attributes, null, "n1", "l1");
    var decisionTree = treeValues[0];
    nodeCount = +((treeValues[1])[1]) - 1;
    leafCount = +((treeValues[2])[1]) - 1;
    console.log(decisionTree);

    // var newNode = new TreeNode("n4", "testAttr", new NodeValues(3, 3, 6, 0.5), isLeaf = false, null, 'test1');
    // var newNode2 = new TreeNode("n5", "testAttr", new NodeValues(3, 3, 6, 0.5), isLeaf = false, null, 'test2');
    // var newNode3 = new TreeNode("n6", "testAttr", new NodeValues(3, 3, 6, 0.5), isLeaf = false, null, 'test3');
    // var newLeaf = new TreeNode("l6", null, new NodeValues(3, 0, 3, 0), isLeaf = true, 'yes', 'testl1');
    // var newLeaf2 = new TreeNode("l7", null, new NodeValues(0, 3, 3, 0), isLeaf = true, 'no', 'testl2');
    // var newLeaf3 = new TreeNode("l8", null, new NodeValues(0, 3, 3, 0), isLeaf = true, 'no', 'testl3');
    // var newLeaf4 = new TreeNode("l9", null, new NodeValues(0, 3, 3, 0), isLeaf = true, 'no', 'testl4');
    // decisionTree.children.push(newNode);
    // decisionTree.children.push(newNode2);
    // decisionTree.children[3].children.push(newLeaf);
    // decisionTree.children[3].children.push(newLeaf2);
    // decisionTree.children[2].children[2].children.push(newLeaf);
    // decisionTree.children[2].children[2].children.push(newLeaf2);
    // decisionTree.children.push(newLeaf3);
    // decisionTree.children.push(newLeaf4);
    // decisionTree.children.splice(2, 1);
    // decisionTree.children.splice(1, 1);
    // decisionTree.children.push(newNode);
    // console.log(decisionTree);
    // decisionTree.children[1].children.push(newNode2);
    // console.log(decisionTree);
    // decisionTree.children[1].children[0].children.push(newNode3);
    // decisionTree.children[1].children[0].children[0].children.push(newLeaf);
    // decisionTree.children[1].children[0].children[0].children.push(newLeaf2);

    var svgSizes = calcSvgSize(decisionTree);
    svgWidth = svgSizes[0];
    svgHeight = svgSizes[1];
    resizeViewBox();

    var treeDepth = calcTreeDepth(decisionTree);

    var treeWidth = calcTreeWidth(decisionTree);

    // A level is a level of (leaf) nodes or branches 
    var levels = treeDepth + (treeDepth - 1);
    var levelHeight = svgHeight / levels;

    // The height of one level is based on a leaf's height because it's the element with the highest height
    var sizeRatio = levelHeight / STD_LEAFHEIGHT

    var leafHeight = STD_LEAFHEIGHT * sizeRatio;
    var nodeHeight = STD_NODEHEIGHT * sizeRatio;

    // Size of the nodes/leaves has to be increased/decreased by the same ratio
    var leafWidth = STD_LEAFWIDTH * sizeRatio;
    var nodeWidth = STD_NODEWIDTH * sizeRatio;

    var treeBorders = [0, svgWidth, 0, svgHeight];

    var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute("id", "g1");
    var svgEl = document.getElementById('svgDT');

    calcNodePositions(decisionTree, treeBorders, nodeWidth, nodeHeight, leafWidth, leafHeight, group, "g1", svgEl);

    // var branchToHide = document.getElementById("useBranchn2");
    // branchToHide.style.display = "none";
    // branchToHide.style.display = "block";
}

function destroyTree(svgEl) {
    // Remove all the groups in which the use elements are located
    for (var i = 0; i < nodeCount + leafCount; i++) {
        var groupId = 'g' + (i + 1);
        var groupToRemove = document.getElementById(groupId);
        svgEl.removeChild(groupToRemove);
    }

    // Remove all the specifically created symbols/templates related to nodes
    for (var i = 0; i < nodeCount; i++) {
        var nodeId = 'node' + (i + 1);
        var nodeToRemove = document.getElementById(nodeId);
        svgEl.removeChild(nodeToRemove);

        // There is no branch belonging to the root node
        if (i === 0) continue;
        var branchId = 'branchn' + (i + 1);
        var branchToRemove = document.getElementById(branchId);
        svgEl.removeChild(branchToRemove);
    }

    //Remove all the specifically created symbols/templates related to leaves
    for (var i = 0; i < leafCount; i++) {
        var leafId = 'leaf' + (i + 1);
        var leafToRemove = document.getElementById(leafId);
        svgEl.removeChild(leafToRemove);

        var branchId = 'branchl' + (i + 1);
        var branchToRemove = document.getElementById(branchId);
        svgEl.removeChild(branchToRemove);
    }
}

function calcSvgSize() {
    var svgEl = document.getElementById('svgDT');
    const rect = svgEl.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    console.log('SVG Width:', width);
    console.log('SVG Height:', height);

    return [width, height];
}

function resizeViewBox() {
    var svgEl = document.getElementById('svgDT');
    svgEl.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight);
}

function handleResize() {
    var newSizes = calcSvgSize();
    if (newSizes[0] != svgWidth || newSizes[1] != svgHeight) {
        svgWidth = newSizes[0];
        svgHeight = newSizes[1];

        // Rebuild the tree with the new sizes
        var svgEl = document.getElementById('svgDT');
        destroyTree(svgEl);
        buildTree();
        goToStep();
    }
}

// document.addEventListener("DOMContentLoaded", function() {
//     buildTree();
// });
document.addEventListener('DOMContentLoaded', buildTree);
window.onresize = handleResize;

export { mostCommonLabel, entropyLabels, infoGain, findBestAttribute, id3, calcTreeDepth, calcTreeWidth, createNode, createLeaf, createBranch, buildTree, nodeCount, leafCount }