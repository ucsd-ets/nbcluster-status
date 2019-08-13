from bs4 import BeautifulSoup
import requests
from collections import namedtuple

class WebScraper:
    """Scrape iusapp for data. Highly coupled to website and current html format as of 8/5/2019 and
    bs4"""
    def __init__(self):
        self._raw_html = None

    @property
    def site(self) -> str:
        return 'https://ets-apps.ucsd.edu/datahub/dsmlp-status-summary.html'
    
    @property
    def raw_html(self) -> BeautifulSoup:
        if not self._raw_html:
            payload = requests.get(self.site)
            self._raw_html = BeautifulSoup(payload.text, features='lxml')
        
        return self._raw_html

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
    
    def sanitize_cluster_data(self, cluster_data: dict):
        """simple sanitization method to make sure the ius site
        did not change format
        
        Arguments:
            cluster_data {dict} -- keys: CPU cores, GPU RAM, GPU, total pods, title
        
        Returns:
            bool -- True if clean
        """
        keys = set(cluster_data.keys())

        test_set = {'CPU cores', 'GB RAM', 'GPU', 'total pods', 'title'}

        return True if test_set == keys else False

    def get_cluster_status(self) -> dict:
        raw_cluster_data = self.parse_html()

        is_sane = self.sanitize_cluster_data(raw_cluster_data)

        if is_sane:
            return raw_cluster_data

        raise Exception('Cluster data is improperly formatted: ', raw_cluster_data)


        
    




