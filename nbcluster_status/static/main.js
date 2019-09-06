define([
    'jquery',
    'base/js/utils',
    'base/js/namespace',
    './Chart'
], function($, utils, Jupyter) {
    "use strict";

    /**
     * Get the cluster status from the backend endpoint /clusterstatus/metrics
     * 
     * @returns {Promise} raw cluster status metrics or a failure message
     */
    function getClusterStatus(route) {
        return new Promise(function(resolve, reject) {
            $.getJSON(utils.get_body_data('baseUrl') + 'clusterstatus/' + route, function(data) {
                resolve(data);
            }).fail(function() {
                reject('could not retrieve cluster status');
            });
        });
    }
    /**
     * Decide on the color that a particular chart js bar will have.
     * 
     * Colors are based off bootstrap 3 theme for bars.
     * https://www.w3schools.com/bootstrap/bootstrap_progressbars.asp
     * 
     * @param {float} inUse percent from 1 - 100 that's in use
     * @param {boolean} isBackground controls opacity, if true will be lightly opaque
     * @return {string} string formatted rgba value, ex. rgba(92, 184, 92, 1)
     */
    function decideRgbFormat(inUse, isBackground) {
        if (inUse <= 33.3) {
            var rgb = 'rgba(92, 184, 92, '
        } else if (inUse <= 66.6) {
            var rgb = 'rgba(242, 185, 104, '
        } else {
            var rgb = 'rgba(217, 83, 79, '
        }

        var finalRgb = isBackground ? rgb + '0.2)' : rgb + '1)'
        
        return finalRgb
    }

    /**
     * 
     * Will create the data object used by chart.js given the clusterStatus object. Highly
     * coupled to bar chart and many hardcoded values.
     * 
     * @param {object} clusterStatus Retrieved cluster status
     * @returns {object} the formatted data object for chart.js
     */
    function formatClusterStatus(clusterStatus) {

        var cpuCores = (clusterStatus['CPU cores'][0] / clusterStatus['CPU cores'][1] * 100).toPrecision(2);
        var gpuCores = (clusterStatus['GPU'][0] / clusterStatus['GPU'][1] * 100).toPrecision(2);
        var memoryAvailable =  (clusterStatus['GB RAM'][0] / clusterStatus['GB RAM'][1] * 100).toPrecision(2);

        var data = {
            labels: ['CPU Cores', 'GPU Cores', 'Memory'],
            datasets: [
                {
                    label: '% in Use',
                    data: [cpuCores, gpuCores, memoryAvailable],
                    backgroundColor: [
                        decideRgbFormat(cpuCores, true),
                        decideRgbFormat(gpuCores, true),
                        decideRgbFormat(memoryAvailable, true),
                    ],
                    borderColor: [
                        decideRgbFormat(cpuCores, false),
                        decideRgbFormat(gpuCores, false),
                        decideRgbFormat(memoryAvailable, false),
                    ],
                    borderWidth: 1
                },
                {
                    label: '% Available',
                    data: [100 - cpuCores, 100 - gpuCores, 100 - memoryAvailable],
                    backgroundColor: [
                        'rgba(255, 255, 255, 0.0)',
                        'rgba(255, 255, 255, 0.0)',
                        'rgba(255, 255, 255, 0.0)',
                    ],
                    borderColor: [
                        'rgba(255, 255, 255, 0.0)',
                        'rgba(255, 255, 255, 0.0)',
                        'rgba(255, 255, 255, 0.0)',
                    ],
                    borderWidth: 1
                },            
            ]            
        }

        return data;
    }
    
    function addStatusTitle(title, elemId) {
        $(elemId).text(title);
    }

    /**
     * 
     * Will create the cluster chart.
     * 
     * @param {object} data chart.js data object for a bar chart
     */
    function createGraph(data) {
        var ctx = document.getElementById('clusterChart');
        new Chart(ctx, {
            type: 'horizontalBar',
            data: data,
            options: {
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [
                        {
                            stacked: true,
                            scaleLabel: {
                                display: true,
                                labelString: '% Resource Utilization'
                            }
                        }
                    ],
                    yAxes: [
                        {
                            stacked: true
                        }
                    ]
                }
            }
        });
    }

    function createLineChart(data, elemId, type) {
        var ctx = document.getElementById(elemId);
        new Chart(ctx, {
            type: type,
            data: data
        });
    }
    /**
     * add a 404 message if data could not be retrieved
     */
    function add404(elemId) {
        $(elemId).text('Sorry, we could not retrieve the cluster status. :(')
    }

    function setupDOM() {
        var tab = '<li><a href="#cluster_status" data-toggle="tab">DSMLP Cluster Status</a></li>'
        var html = '<div id="cluster_status" class="tab-pane"> \
                        <div id="chart_container" class="container"> \
                            <div class="row col-md-4"> \
                                <h3 id="cluster-title"></h3>\
                                <canvas id="clusterChart"></canvas> \
                            </div> \
                            <div class="row col-md-8"> \
                                <h3 id="dayTitle"></h3> \
                                <canvas id="clusterDay"></canvas> \
                            </div> \
                        </div> \
                    </div>'

        $('#tabs').append(tab);
        $('.tab-content').append(html)
    }

    function load_ipython_extension() {
        setupDOM();
        var clusterTitle = '#cluster-title';
        var dayTitle = '#dayTitle'
    
        getClusterStatus('metrics')
            .then(function(res) {
                var formattedStatus = formatClusterStatus(res);
                createGraph(formattedStatus);
                addStatusTitle(res['title'], clusterTitle);
            })
            .catch(function(err) {
                add404(clusterTitle);
            });
        
        getClusterStatus('day')
            .then(function(res) {
                var timepoints = res['timepoint']
                console.log(res['gpu']);
                var gpu = {
                    label: '% GPU Utilization',
                    data: res['gpu'],
                    fill: false,
                    borderColor: "rgba(255,0,0,0.2)",
                    backgroundColor: "rgba(255,0,0,0.2)",
                    pointBackgroundColor: "rgba(255,0,0,0.2)",
                    pointFillColor: "rgba(255,0,0,0.2)"
                    // borderColor:'rgba(255, 255, 255, 0.0)',
                    // lineColor: 'rgba(255, 255, 255, 0.0)'
                }
                var cpu = {
                    label: '% CPU Utilization',
                    data: res['cpu'],
                    fill: false
                }
                var memory = {
                    label: '% Memory Utilization',
                    data: res['memory'],
                    fill: false
                }
                var allData = {
                    labels: timepoints,
                    datasets: [gpu, cpu, memory]
                }

                addStatusTitle('Every hour at mark 30', dayTitle);
                createLineChart(allData, 'clusterDay', 'line');

            })
            .catch(function(err) {
                console.log(err);
                add404(dayTitle);
            });
    }

    return {
        load_ipython_extension: load_ipython_extension
    }
});