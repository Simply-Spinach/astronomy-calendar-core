:: Load initial data for site
cd python
python -c "from LoadAstroData import loadAstroData; loadAstroData()"
cd ..

:: Start site
start http://localhost:8090/site/index.html
python -m http.server 8090