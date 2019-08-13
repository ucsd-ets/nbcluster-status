# nbcluster-status

Get the state of a k8s cluster within a notebook

## Description

This version scrapes data from endpoint (https://ets-apps.ucsd.edu/datahub/dsmlp-status-summary.html) and reformats it as a bar chart.

## Installation

Within an environment that has ```jupyter notebook``` installed. Use the following commands:

```bash

pip install git+https://github.com/ucsd-ets/nbcluster-status.git

jupyter serverextension install --py nbcluster_status --sys-prefix
jupyter serverextension enable --py nbcluster_status --sys-prefix

jupyter nbextension install --py nbcluster_status --sys-prefix
jupyter nbextension enable --py nbcluster_status --sys-prefix
```

## Create a development environment

To create a development environment, follow the steps below:

1. Clone the latest version ```git clone https://github.com/ucsd-ets/nbcluster-status.git```

2. Create a virtual environment

    *This virtual environment should be py >= 3.6*

    ```bash
    cd nbcluster-status

    # make sure you're using python 3.6
    python3 -m venv .
    ```

3. Activate the virtual environment

    ```bash
    # within the nbcluster-status directory
    source bin/activate
    ```

4. Make your changes to the repo

5. See local changes by using ```bash deploy.sh```. This will create a local jupyter notebook with nbcluster-status installed.

## Adding dependencies

Add dependencies necessary to the function of nbcluster-status to ```setup.py```

## Testing

### Unit tests

Python unit tests can be added to the ```tests``` directory. In order to run the test, use ```python3 setup.py test```
