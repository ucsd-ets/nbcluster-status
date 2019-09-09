

var LineChart = (function() {
    this.elemId;
    this.type;
    this.timepoints = [];
    this.lines = [];

    function LineChart() {
        this.elemId = '';
        this.type = 'line';
        this.lines = [];
        this.timepoints = [];
        this.setMax = true;
        this.chart
    }

    LineChart.prototype.setElemID = function(elemId) {
        this.elemId = elemId;
    }

    LineChart.prototype.pushTimepoint = function(timepoint) {
        this.timepoints.push(timepoint);
    }

    LineChart.prototype.setTimepoints = function(timepoints) {
        this.timepoints = timepoints;
    }

    LineChart.prototype.pushLine = function(line) {
        var lineData = line.create();
        this.lines.push(lineData);
    }

    LineChart.prototype.toggleScale = function() {
        this.setMax = this.setMax ? false : true;
    }

    LineChart.prototype.createChartData = function() {
        var data = {
            labels: this.timepoints,
            datasets: this.lines
        }
        
        var defaultChartData = {
            type: this.type,
            data: data,
            options:{
                scales: {
                    yAxes : [{
                        ticks : {
                            max : 100,    
                            min : 0
                        }
                    }]
                }
            } 
        }
        
        var chartData = this.setMax ? defaultChartData : { type: this.type, data: data }

        return chartData   
    }

    LineChart.prototype.create = function() {
        var chartData = this.createChartData();

        var ctx = document.getElementById(this.elemId);
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new Chart(ctx, chartData);
    }

    return LineChart;
})();


function Line() {
    this.label;
    this.data = [];
    this.rgbaColor;

    Line.prototype.setLabel = function(label) {
        this.label = label;
    }

    Line.prototype.pushData = function(elem) {
        this.data.push(elem);
    }

    Line.prototype.setAllData= function(data) {
        this.data = data;
    }

    Line.prototype.setRGBAColor = function(rgbaColor) {
        this.rgbaColor = rgbaColor;
    }

    Line.prototype.create = function() {
        return {
            label: this.label,
            data: this.data,
            fill: false,
            borderColor: this.rgbaColor,
            backgroundColor: this.rgbaColor,
            pointBackgroundColor: this.rgbaColor,
            pointFillColor: this.rgbaColor
        }
    }
}
