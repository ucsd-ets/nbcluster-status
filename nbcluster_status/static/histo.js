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

var HistogramChart = (function() {
    this.histograms = [];
    this.type = 'horizontalBar';
    this.isMax = true;
    this.elemId = '';
    this.chart;

    function HistogramChart() {
        this.histograms = [];
        this.type = 'horizontalBar';
        this.isMax = true;
        this.elemId = '';
        this.chart;
    }

    HistogramChart.prototype.pushHistogram = function(histogram) {
        this.histograms.push(histogram);
    }

    HistogramChart.prototype.setElemId = function(elemId) {
        this.elemId = elemId;
    }

    HistogramChart.prototype.toggleScale = function() {
        this.isMax = this.isMax ? false : true;
    }

    HistogramChart.prototype.getData = function() {
        var labels = this.histograms.map(function(histo) {
            return histo['label'];
        });

        var backgroundColors = this.histograms.map(function(histo) {
            return decideRgbFormat(histo['value'], true);
        });

        var borderColors = this.histograms.map(function(histo) {
            return decideRgbFormat(histo['value'], false);
        });

        var values = this.histograms.map(function(histo) {
            return parseFloat(histo['value']);
        });

        var antiValues = this.histograms.map(function(histo) {
            return 100 - histo['value'];
        });

        var whiteColors = this.histograms.map(function(histo) {
            return 'rgba(255, 255, 255, 0.0)'
        });

        var datasets = [
            {
                label: '% in Use',
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }
        ]

        if (this.isMax) {
            datasets.push(
                {
                    label: '% Available',
                    data: antiValues,
                    backgroundColor: whiteColors,
                    borderColor: whiteColors,
                    borderWidth: 1
                }
            )
        }

        var data = {
            labels: labels,
            datasets: datasets
        }

        return data;
    }

    HistogramChart.prototype.create = function() {
        var ctx = document.getElementById(this.elemId);
        
        if (this.chart) {
            this.chart.destroy();
        }

        var data = this.getData();

        this.chart = new Chart(ctx, {
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

    return HistogramChart;
})();

var Histogram = (function() {
    function Histogram(value, label) {
        this.value = value;
        this.label = label;
    }

    return Histogram;
})();
