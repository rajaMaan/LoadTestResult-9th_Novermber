/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 92.63157894736842, "KoPercent": 7.368421052631579};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.49, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9131578947368421, 500, 1500, "getAllUserGrants"], "isController": false}, {"data": [0.75, 500, 1500, "getProjectNav"], "isController": false}, {"data": [0.4236842105263158, 500, 1500, "getNavigations"], "isController": false}, {"data": [0.0, 500, 1500, "getAllModules"], "isController": false}, {"data": [0.3631578947368421, 500, 1500, "Login"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 950, 70, 7.368421052631579, 15818.529473684217, 88, 332850, 767.0, 56525.09999999995, 99037.59999999999, 176516.94, 2.148908015426897, 1245.7176049465884, 4.48364311656695], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["getAllUserGrants", 190, 3, 1.5789473684210527, 321.49473684210517, 88, 6247, 180.0, 655.7000000000002, 937.6999999999997, 2344.0100000000148, 0.4373929538297206, 0.4568908418260465, 1.1412008407728504], "isController": false}, {"data": ["getProjectNav", 190, 4, 2.1052631578947367, 2862.931578947369, 122, 99303, 394.5, 2214.9000000000005, 12135.099999999913, 73248.7900000001, 0.4374151069364827, 3.0458061927331537, 1.151937720146419], "isController": false}, {"data": ["getNavigations", 190, 32, 16.842105263157894, 31683.405263157885, 206, 196901, 1089.0, 99091.2, 105520.94999999998, 183843.41000000006, 0.8030431107354185, 41.12747566435968, 1.9468305882819104], "isController": false}, {"data": ["getAllModules", 190, 28, 14.736842105263158, 39094.81052631578, 130, 332850, 18015.0, 130054.90000000007, 175345.8, 319816.07000000007, 0.4343333668608213, 1231.707484121115, 0.988057064689383], "isController": false}, {"data": ["Login", 190, 3, 1.5789473684210527, 5130.005263157895, 247, 99329, 1236.5, 9769.600000000002, 29323.599999999708, 70277.2500000001, 1.6972468868918942, 5.787859632099405, 0.8326157952271631], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["423/Locked", 3, 4.285714285714286, 0.3157894736842105], "isController": false}, {"data": ["417/Expectation Failed", 3, 4.285714285714286, 0.3157894736842105], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ms.oodleslab.com:443 failed to respond", 1, 1.4285714285714286, 0.10526315789473684], "isController": false}, {"data": ["500/Internal Server Error", 3, 4.285714285714286, 0.3157894736842105], "isController": false}, {"data": ["524", 23, 32.857142857142854, 2.4210526315789473], "isController": false}, {"data": ["525", 1, 1.4285714285714286, 0.10526315789473684], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of chunk coded message body: closing chunk expected", 36, 51.42857142857143, 3.789473684210526], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 950, 70, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of chunk coded message body: closing chunk expected", 36, "524", 23, "423/Locked", 3, "417/Expectation Failed", 3, "500/Internal Server Error", 3], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["getAllUserGrants", 190, 3, "417/Expectation Failed", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getProjectNav", 190, 4, "500/Internal Server Error", 3, "524", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["getNavigations", 190, 32, "524", 19, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of chunk coded message body: closing chunk expected", 13, "", "", "", "", "", ""], "isController": false}, {"data": ["getAllModules", 190, 28, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of chunk coded message body: closing chunk expected", 23, "423/Locked", 3, "524", 2, "", "", "", ""], "isController": false}, {"data": ["Login", 190, 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ms.oodleslab.com:443 failed to respond", 1, "524", 1, "525", 1, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
