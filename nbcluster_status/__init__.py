import json
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
from tornado import web, template
import os

from .parser import WebScraper

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
    custom_css_route = url_path_join(base_url, '/clusterstatus.css')

    nbapp.web_app.add_handlers('.*', [
        (cluster_status_route, ClusterStatusHandler),
        (custom_css_route, CustomChartCSS)
    ])