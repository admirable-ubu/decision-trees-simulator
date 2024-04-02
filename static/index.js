const margin = { top: 10, right: 50, bottom: 50, left: 50 },
  width = 450 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

const svg = d3.select("#root").attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //move the svg area

// Define chart area
svg
  .append("clipPath") // clipPath restricts region to which paint can be applied
  .attr("id", "chart-area")
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", height)

// Add Axes
const xMax = 1;
const yMax = 1;

var xScale = d3.scaleLinear([0, xMax], [0, width])
var yScale = d3.scaleLinear([0, yMax], [height, 0])

var xAxis = d3.axisBottom(xScale)
var yAxis = d3.axisLeft(yScale)
svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(xAxis)
svg.append("g")
  .attr("transform", `translate(0,0)`)
  .call(yAxis)

// Axes label
svg.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", width / 2 + 5)
  .attr("y", height + 35)
  .text("p");

svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", -35)
  .attr("x", -height / 2)
  .attr("transform", "rotate(-90)")
  .html("Entropy")

function f(x) {
  if(x == 0 || x == 1 || 0.99999 <= x){
    return 0;
  }
  return (-x)*Math.log2(x)-(1-x)*Math.log2(1-x);
}

// Returns array of points that represents f(x)
function graphFunction() {
  pointNum = 1;

  const data = [];
  for (var x = 0; x <= pointNum + 0.001; x = x + 0.001) {
    y = f(x);
    data.push([x, y])
  }
  return data;
}

// Add function graph
var line = d3.line()
  .x(d => xScale(d[0]))
  .y(d => yScale(d[1]))
svg.append("path")
  .datum(graphFunction())
  .attr("clip-path", "url(#chart-area)")
  .attr("fill", "none")
  .attr("stroke", "teal")
  .attr("stroke-width", 2)
  .attr("d", line);

function calcSum()
{
  var table = document.getElementById('table-classes');
  var items = table.getElementsByTagName('input');
  var sum = 0;
  for(var i= 0; i<items.length; i++)
    sum += parseInt(items[i].value);
  var output = document.getElementById('sum-classes');
  output.innerHTML = sum;
}

function calcProbs(){
  var table = document.getElementById('table-classes');
  var items = table.getElementsByTagName('input');
  var sum = 0;
  for(var i= 0; i<items.length; i++){
    sum += parseInt(items[i].value);
  }
  document.getElementById('sum-classes').innerHTML = sum;
  for(var i = 0; i < items.length; i++){
    var pValue = parseInt(items[i].value) / sum
    document.getElementById('p' + (i+1).toString()).innerHTML = pValue;
  }
}

function calcEntropy()
{
  calcProbs();
  var table = document.getElementById('table-entropy');
  var rowCount = table.tBodies[0].rows.length;
  var columnIndex = 1;
  var sum = 0;
  for(var i= 0; i < rowCount; i++) {
    var pCurrent = table.rows[i].cells[columnIndex].innerHTML;
    sum = sum - pCurrent * Math.log2(pCurrent);
  }
  if(isNaN(sum)){
    var output = document.getElementById('sum-entropy');
    output.innerHTML = 0;
  } else{
    var output = document.getElementById('sum-entropy');
    output.innerHTML = sum;
  }
}

function addRow()
{
  var table = document.getElementById('table-classes');

  var button = document.getElementsByTagName('input')[0];

  button.onclick = function() {
    var clone = table.rows[table.rows.length - 2].cloneNode(true);
    clone.cells[0].firstChild.data =
        clone.cells[0].firstChild.data.replace(/(\d+):/,function(str,g1) {
                                                           return (+g1 + 1) + ':';
                                                        });
    table.tBodies[0].appendChild(clone);
  };
}
