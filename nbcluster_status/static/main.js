define([
    'jquery',
    'base/js/utils',
    'base/js/namespace',
    './Chart'
], function($, utils, Jupyter) {
    "use strict";
    
    function getClusterStatus() {
        return new Promise(function(resolve, reject) {
            $.getJSON(utils.get_body_data('baseUrl') + 'clusterstatus', function(data) {
                resolve(data);
            }).fail(function() {
                reject('could not retrieve cluster status');
            });
        });
    }

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

    function createGraph(data) {
        var ctx = document.getElementById('myChart');
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
                                labelString: '% Resources'
                            },
                            maxBarThickness: 2
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

    function setupDOM() {
        var tab = '<li><a href="#cluster_status" data-toggle="tab">DSMLP Cluster Status</a></li>'
        var html = '<div id="cluster_status" class="tab-pane"> \
                        <div id="chart_container" class="container"> \
                            <div class="row col-sm-6 col-md-offset-5"> \
                                <h3 id="status-title">DSMLP Status</h3>\
                                <canvas id="myChart"></canvas> \
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
                //  append a sadface 404 thing here
            });


    }

    return {
        load_ipython_extension: load_ipython_extension
    }
});