import setuptools

setuptools.setup(
    name = "nbcluster-status",
    version = '0.0.0',
    # url = "https://github.com/agt-ucsd/nbresuse",
    author = "Wesley Uykimpang",
    description = "Simple Jupyter extension to show how much resources (RAM, GPU) your cluster is using",
    install_requires=[
        'notebook',
        'jupyterhub',
    ],
    package_data = {'nbcluster_status': ['static/*']},
    python_requires = ">=3.5",
    setup_requires = ['pytest-runner'],
    tests_require = ['pytest'],
    packages = setuptools.find_packages(),
)
