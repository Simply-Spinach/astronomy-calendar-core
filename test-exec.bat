:: Load initial data for site
python ./AstroDataLoader.py

:: Start site
start http://localhost:8090/site/index.html
python -m http.server 8090