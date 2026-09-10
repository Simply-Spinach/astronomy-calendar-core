:: Load initial data for site
cd python
python -c "from LoadAstroData import loadAstroData; loadAstroData(lat=0,lon=0)"
cd ..

:: Start site
start http://localhost:8090/site/daily_view.html
python -m http.server 8090