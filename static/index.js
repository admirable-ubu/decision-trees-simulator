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
