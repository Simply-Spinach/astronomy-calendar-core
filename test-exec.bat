:: Load initial data for site
cd python
python -c "import LoadAstroData as lad; lad.loadAstroData()"
cd ..

:: Start site
start http://localhost:8090/site/index.html
python -m http.server 8090