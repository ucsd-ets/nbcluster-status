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
    function getClusterStatus() {
        return new Promise(function(resolve, reject) {
            $.getJSON(utils.get_body_data('baseUrl') + 'clusterstatus/metrics', function(data) {
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
    
    function addStatusTitle(title) {
        $('#status-title').text(title);
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

    /**
     * add a 404 message if data could not be retrieved
     */
    function add404() {
        $('#status-title').text('Sorry, we could not retrieve the cluster status. :(')
    }

    function setupDOM() {
        var tab = '<li><a href="#cluster_status" data-toggle="tab">DSMLP Cluster Status</a></li>'
        var html = '<div id="cluster_status" class="tab-pane"> \
                        <div id="chart_container" class="container"> \
                            <div class="row col-md-6"> \
                                <h3 id="status-title"></h3>\
                                <canvas id="clusterChart"></canvas> \
                            </div> \
                        </div> \
                    </div>'

        $('#tabs').append(tab);
        $('.tab-content').append(html)
    }

    function load_ipython_extension() {
        setupDOM();

        getClusterStatus()
            .then(function(res) {
                var formattedStatus = formatClusterStatus(res);
                createGraph(formattedStatus);
                addStatusTitle(res['title']);
            })
            .catch(function(err) {
                add404();
            });
    }

    return {
        load_ipython_extension: load_ipython_extension
    }
});