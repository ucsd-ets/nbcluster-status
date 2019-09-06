import json
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
from tornado import web, template
import os

from .parser import WebScraper, JsonScraper

def _jupyter_server_extension_paths():
    """
    Set up the server extension for collecting metrics
    """
    return [{
        'module': 'nbcluster_status',
    }]

def _jupyter_nbextension_paths():
    """
    Set up the notebook extension for displaying cluster status
    """
    return [
        {
            "section": "tree",
            "dest": "nbcluster_status",
            "src": 'static',
            "require": "nbcluster_status/main"
        }
    ]
class ClusterStatusHandler(IPythonHandler):
    @web.authenticated
    def get(self):
        """
        get the resource utilization using a scraper
        """
        try:
            webscraper = WebScraper()
            cluster_status = webscraper.get_cluster_status()

            self.write(json.dumps(cluster_status))

        except Exception as e:
            raise e

def extract_resource(data, resource, transform_opt):
    resource_only = list(map(lambda x: transform_opt(x[resource]), data))
    return resource_only

def json_handler(endpoint):
        try:
            req = JsonScraper(endpoint)
            jsonlist = req.get()
            round_out = lambda x: round(x * 100, 2)
            timeonly = lambda x: x.split(' ')[-1]
            gpu = extract_resource(jsonlist, 'gpu', round_out)
            cpu = extract_resource(jsonlist, 'cpu', round_out)
            mem = extract_resource(jsonlist, 'memory', round_out)
            timepoint = extract_resource(jsonlist, 'timepoint', timeonly)

            return {'gpu': gpu, 'cpu': cpu, 'memory': mem, 'timepoint': timepoint}

        except Exception as e:
            raise e
class DayHandler(IPythonHandler):
    @web.authenticated
    def get(self):
        data = json_handler('day.json')
        self.write(data)

class TimeseriesHandler(IPythonHandler):
    @web.authenticated
    def get(self):
        data = json_handler('timeseries.json')
        self.write(data)

class CustomChartCSS(IPythonHandler):
    def get(self):
        """hook for adding additional CSS if necessary
        """
        loader = template.Loader(os.path.join(os.getcwd(), 'nbcluster_status'))
        t = loader.load('clusterstatus.css')
        self.set_header('Content-Type', 'text/css')
        self.write(t.generate())

def load_jupyter_server_extension(nbapp):
    """
    Called during notebook start
    """
    root_path = os.path.dirname(__file__)
    base_url = nbapp.web_app.settings['base_url'] + 'clusterstatus'

    cluster_status_route = url_path_join(base_url, '/metrics')
    day_status_route = url_path_join(base_url, '/day')
    timeseries_route = url_path_join(base_url, '/timeseries')
    custom_css_route = url_path_join(base_url, '/clusterstatus.css')

    nbapp.web_app.add_handlers('.*', [
        (cluster_status_route, ClusterStatusHandler),
        (custom_css_route, CustomChartCSS),
        (day_status_route, DayHandler),
        (timeseries_route, TimeseriesHandler)
    ])