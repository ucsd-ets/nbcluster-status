define([
    'jquery',
    'base/js/utils',
    'base/js/namespace',
    './Chart',
    './line',
    './histo'
], function($, utils, Jupyter) {
    "use strict";

    /**
     * Get the cluster status from the backend endpoint /clusterstatus/metrics
     * 
     * @returns {Promise} raw cluster status metrics or a failure message
     */
    function getClusterStatus(endpoint) {
        return new Promise(function(resolve, reject) {
            $.getJSON(utils.get_body_data('baseUrl') + 'clusterstatus/' + endpoint, function(data) {
                resolve(data);
            }).fail(function() {
                reject('could not retrieve cluster status');
            });
        });
    }

    function addStatusTitle(title, elemId) {
        $(elemId).text(title);
    }

    /**
     * add a 404 message if data could not be retrieved
     */
    function add404(elemId) {
        $(elemId).text('Sorry, we could not retrieve the cluster status.');
        $(elemId).append('<p>&#128542;</p>');
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
                                <h3 id="dayTitle" style="text-align: center;"></h3> \
                                <canvas id="clusterDay"></canvas> \
                            </div> \
                            <div class="row col-md-12"> \
                                <h3 id="timeseriesTitle" style="text-align: center;"></h3> \
                                <canvas id="clusterTimeseries"></canvas> \
                            </div> \
                            <div class="row col-md-3" style="float: none; margin: 0 auto;"> \
                                <div> \
                                <button id="rescale" class="btn btn-primary btn-block">Rescale</button> \
                                </div> \
                            </div> \
                            <div class="row col-md-12"> \
                                <h3 id="everythingDownTitle" style="text-align: center;"></h3> \
                            </div> \
                    </div>'

        $('#tabs').append(tab);
        $('.tab-content').append(html)
    }

    var DownedResource = (function() {

        function DownedResource() {
            this.total = 0;
            this.errorMessageIds = [];
            this.everythingDownId = '#everythingDownTitle';
        }

        DownedResource.prototype.increment = function() {
            this.total = this.total + 1;
    
            if (this.total === this.errorMessageIds.length) {
                $('#rescale').remove();

                this.errorMessageIds.forEach(function(errId) {
                    $(errId).remove();
                });
                
                add404(this.everythingDownId);
                
            }
            

        }

        DownedResource.prototype.pushErrorMessageId = function(errId) {
            this.errorMessageIds.push(errId);
        }

        return DownedResource;
    })();

    function load_ipython_extension() {
        setupDOM();
        var clusterTitle = '#cluster-title';
        var dayTitle = '#dayTitle';
        var timeseriesTitle = '#timeseriesTitle';
        var downedResource = new DownedResource();
        downedResource.pushErrorMessageId(clusterTitle);
        downedResource.pushErrorMessageId(dayTitle);
        downedResource.pushErrorMessageId(timeseriesTitle);
    
        getClusterStatus('metrics')
            .then(function(res) {
                var cpuCores = (res['CPU cores'][0] / res['CPU cores'][1] * 100).toPrecision(2);
                var gpuCores = (res['GPU'][0] / res['GPU'][1] * 100).toPrecision(2);
                var memoryAvailable =  (res['GB RAM'][0] / res['GB RAM'][1] * 100).toPrecision(2);

                var cpu = new Histogram(cpuCores, 'CPU Cores');
                var gpu = new Histogram(gpuCores, 'GPU Cores');
                var memory = new Histogram(memoryAvailable, 'Memory');

                var histogramChart = new HistogramChart();
                histogramChart.setElemId('clusterChart');
                histogramChart.pushHistogram(cpu);
                histogramChart.pushHistogram(gpu);
                histogramChart.pushHistogram(memory);

                histogramChart.create();
                addStatusTitle(res['title'], clusterTitle);

                $('#rescale').click(function() {
                    histogramChart.toggleScale();
                    histogramChart.create();
                });

            })
            .catch(function(err) {
                add404(clusterTitle);
                downedResource.increment();
            });
        
        getClusterStatus('day')
            .then(function(res) {
                var gpuLine = new Line();
                gpuLine.setAllData(res['gpu']);
                gpuLine.setRGBAColor('rgba(223, 240, 216, 1)');
                gpuLine.setLabel('% GPU Utilization');
                
                var cpuLine = new Line();
                cpuLine.setAllData(res['cpu']);
                cpuLine.setLabel('% CPU Utilization');
                cpuLine.setRGBAColor('rgba(217, 237, 247, 1)')
                
                var memoryLine = new Line();
                memoryLine.setAllData(res['memory']);
                memoryLine.setLabel('% Memory Utilization');
                memoryLine.setRGBAColor('rgba(252, 248, 227, 1)');

                var lineChart = new LineChart();
                lineChart.pushLine(gpuLine);
                lineChart.pushLine(cpuLine);
                lineChart.pushLine(memoryLine);
                lineChart.setTimepoints(res['timepoint']);
                lineChart.setElemID('clusterDay');

                addStatusTitle('Resource utilization per hour (PDT)', dayTitle);
                lineChart.create();

                $('#rescale').click(function() {
                    lineChart.toggleScale();
                    lineChart.create();
                });
            })
            .catch(function(err) {
                add404(dayTitle);
                downedResource.increment();
            });

        getClusterStatus('timeseries')
            .then(function(res) {
                var gpuLine = new Line();
                gpuLine.setAllData(res['gpu']);
                gpuLine.setRGBAColor('rgba(223, 240, 216, 1)');
                gpuLine.setLabel('% GPU Utilization');
                
                var cpuLine = new Line();
                cpuLine.setAllData(res['cpu']);
                cpuLine.setLabel('% CPU Utilization');
                cpuLine.setRGBAColor('rgba(217, 237, 247, 1)')
                
                var memoryLine = new Line();
                memoryLine.setAllData(res['memory']);
                memoryLine.setLabel('% Memory Utilization');
                memoryLine.setRGBAColor('rgba(252, 248, 227, 1)');

                var lineChart = new LineChart();
                lineChart.pushLine(gpuLine);
                lineChart.pushLine(cpuLine);
                lineChart.pushLine(memoryLine);
                lineChart.setTimepoints(res['timepoint']);
                lineChart.setElemID('clusterTimeseries');

                addStatusTitle('Peak utilization per resource per day', timeseriesTitle);
                lineChart.create();

                $('#rescale').click(function() {
                    lineChart.toggleScale();
                    lineChart.create();

                });
            })
            .catch(function(err) {
                add404(timeseriesTitle);
                downedResource.increment();
            });
    }

    return {
        load_ipython_extension: load_ipython_extension
    }
});