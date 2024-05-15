import { nodeCount, leafCount } from './tree.js';

var currentStep = 1;

function initialStep() {
    currentStep = 1;
    document.getElementById('stepCount').textContent = "Step: 1";
    for (var i = 2; i <= nodeCount + leafCount; i++) {
        var groupId = 'g' + i;
        var groupToHide = document.getElementById(groupId);
        groupToHide.style.display = "none";
    }
}

function stepForward() {
    if (currentStep === nodeCount + leafCount) return;
    currentStep++;
    document.getElementById('stepCount').textContent = "Step: " + currentStep;
    var groupId = 'g' + currentStep;
    var groupToShow = document.getElementById(groupId);
    groupToShow.style.display = "block";
}

function stepBack() {
    if (currentStep === 1) return;
    currentStep--;
    document.getElementById('stepCount').textContent = "Step: " + currentStep;
    var groupId = 'g' + (currentStep + 1);
    var groupToHide = document.getElementById(groupId);
    groupToHide.style.display = "none";
}

function lastStep() {
    currentStep = nodeCount + leafCount;
    document.getElementById('stepCount').textContent = "Step: " + (nodeCount + leafCount);
    for (var i = 2; i <= nodeCount + leafCount; i++) {
        var groupId = 'g' + i;
        var groupToShow = document.getElementById(groupId);
        groupToShow.style.display = "block";
    }
}

function goToStep() {
    for (var i = 2; i <= currentStep; i++) {
        var groupId = 'g' + i;
        var groupToShow = document.getElementById(groupId);
        groupToShow.style.display = "block";
    }
}

export { initialStep, stepForward, stepBack, lastStep, goToStep };
export default initialStep;