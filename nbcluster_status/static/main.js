define([
    'jquery',
    'base/js/utils'
], function($, utils) {
    "use strict";
    
    function load_ipython_extension() {
        var html = '<div id="cluster_status" class="tab-pane"><iframe id="dsmlp-status" src="https://ets-apps.ucsd.edu/datahub/dsmlp-status-summary.html"></iframe></div>'
        // var html = '<div id="cluster_status" class="tab-pane"><h1>Hello world!</h1></div>'
        var tab = '<li><a href="#cluster_status" data-toggle="tab">DSMLP Cluster Status</a></li>'
        $('#tabs').append(tab);
        $('.tab-content').append(html)
    }

    return {
        load_ipython_extension: load_ipython_extension
    }
});