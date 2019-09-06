from bs4 import BeautifulSoup
import requests
from collections import namedtuple


class Site:
    def __init__(self):
        self._endpoint = None

    @property
    def baseurl(self) -> str:
        return 'https://ets-apps.ucsd.edu/datahub/'
    
    @property
    def endpoint(self) -> str:
        return self._endpoint

    @property
    def route(self):
        return self._route

    @route.setter
    def route(self, route):
        statuscode = self.test_route(route)
        if statuscode == 200:
            self.append_url(route)
            self._route = route
        else:
            raise Exception(f'Could not retrieve data from endpoint {self.baseurl + route}. Status code = {statuscode}')

    def append_url(self, route):
        self._endpoint = self.baseurl + route
    
    def test_route(self, route):
        req = requests.get(self.baseurl + route)
        statuscode = req.status_code
        req.close()
        return statuscode

class JsonScraper(Site):
    def __init__(self, route=None):
        self.route = route

    @property
    def route(self):
        return self._route

    @route.setter
    def route(self, route):
        self.append_url(route)
        self._route = route

    def get(self):
        try:
            req = requests.get(self.endpoint)
            jsondata = req.json()
            req.close()
            return jsondata
        except Exception as e:
            raise Exception(f'Could not retrieve data form endpoint {str(e)}')
        

class WebScraper(Site):
    """Scrape iusapp for data. Highly coupled to website and current html format as of 8/5/2019 and
    bs4"""
    def __init__(self):
        self._raw_html = None
        self.route = 'dsmlp-status-summary.html'

    @property
    def site(self) -> str:
        return self.endpoint
    
    @property
    def raw_html(self) -> BeautifulSoup:
        try:
            if not self._raw_html:
                payload = requests.get(self.site)
                self._raw_html = BeautifulSoup(payload.text, features='lxml')
                payload.close()
            return self._raw_html
    
        except Exception as e:
            raise Exception('Could not retrieve data from endpoint')

    def parse_html(self) -> dict:
        """parse the html table from ets-apps
        
        Returns:
            dict -- keys = fields; values = tuple(used, available)
        """
        try:
            # select all the 'tr' elements
            raw_table_data = self.raw_html.find_all('tr')

            # object to collect data in
            cluster_status = {}

            cluster_status['title'] = self._raw_html.h4.text

            # first element is just the table title
            for row in raw_table_data[1:]:
                tbl_data = row.find_all('td')

                field = tbl_data[-1].text
                used = tbl_data[0].text
                available = tbl_data[1].text

                cluster_status[field] = (used, available)

            return cluster_status

        except Exception as e:

            raise Exception('Could not parse html ', e)
    
    def sanity_check_cluster_data(self, cluster_data: dict):
        """simple sanitization method to make sure the ius site
        did not change format
        
        Arguments:
            cluster_data {dict} -- keys: CPU cores, GPU RAM, GPU, total pods, title
        
        Returns:
            bool -- True if clean
        """
        keys = set(cluster_data.keys())

        test_set = {'CPU cores', 'GB RAM', 'GPU', 'total pods', 'title'}

        if not (test_set == keys):
            raise Exception(f'Cluster data is not sanitary: {cluster_data}')

    def get_cluster_status(self) -> dict:
        try:
            raw_cluster_data = self.parse_html()

            self.sanity_check_cluster_data(raw_cluster_data)

            return raw_cluster_data
        
        except Exception as e:
            raise e


        
    




