source bin/activate
sudo rm -r dist
python3 setup.py bdist_wheel

pip uninstall nbcluster_status -y
pip install dist/nbcluster_status-0.0.0-py3-none-any.whl

jupyter nbextension uninstall --py nbcluster_status --sys-prefix
jupyter nbextension install --py nbcluster_status --sys-prefix
jupyter nbextension enable --py nbcluster_status --sys-prefix

# deactivate
jupyter notebook