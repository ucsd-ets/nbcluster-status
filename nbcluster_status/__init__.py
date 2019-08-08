def _jupyter_server_extension_paths():
    """
    Set up the server extension for collecting metrics
    """
    return [{
        'module': 'nbcluster_status',
    }]

def _jupyter_nbextension_paths():
    """
    Set up the notebook extension for displaying metrics
    """
    return [
        {
            "section": "tree",
            "dest": "nbcluster_status",
            "src": "static",
            "require": "nbcluster_status/main"
        }
    ]