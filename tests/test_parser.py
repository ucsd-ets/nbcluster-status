import unittest
import bs4
from nbcluster_status import parser

class TestWebScraper(unittest.TestCase):
    def setUp(self):
        self.scraper = parser.WebScraper()
    
    def test_site_prop_works(self):
        site = self.scraper.site
        assert isinstance('https://ets-apps.ucsd.edu/datahub/dsmlp-status-summary.html', str)
    
    def test_raw_html_pulls_html(self):
        raw_html = self.scraper.raw_html
        assert isinstance(raw_html, bs4.BeautifulSoup)
    
    def test_parse_html_parses(self):
        raw_cluster_data = self.scraper.parse_html()

        assert isinstance(raw_cluster_data, dict)
    
    def test_sanitize_cluster_data_checks_validity(self):
        raw_cluster_data = self.scraper.parse_html()

        # this will raise if false
        self.scraper.sanity_check_cluster_data(raw_cluster_data)

        assert True

    def test_get_cluster_status_returns(self):
        cluster_status = self.scraper.get_cluster_status()
        assert isinstance(cluster_status, dict)

class TestJsonScraper(unittest.TestCase):
    def setUp(self):
        self.dayscraper = parser.JsonScraper('day.json')
    
    def test_receives_endpoint(self):
        data = self.dayscraper.get()
        assert isinstance(data, list)
    
     