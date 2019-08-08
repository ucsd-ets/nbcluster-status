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