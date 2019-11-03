IP_ADDRESS = 192.168.1.86

js: nereus.js
		gzip < nereus.js > nereus.js.gz
		curl -F "datafile=@nereus.js.gz" http://$(IP_ADDRESS)/upload
		
web: js index.html I18N_cs.json	
		@echo "==== Gzip html files ===="
		gzip < index.html > index.html.gz
		gzip < I18N_cs.json > I18N_cs.json.gz
		@echo "==== Upload html ====" 			
		curl -F "datafile=@index.html.gz" http://$(IP_ADDRESS)/upload
		curl -F "datafile=@I18N_cs.json.gz" http://$(IP_ADDRESS)/upload
		@echo "==== upload done ==== "
		
web-all: js web favicon.ico default2.pjs icons_wifi.png	
		curl -F "datafile=@favicon.ico" http://$(IP_ADDRESS)/upload
		curl -F "datafile=@icons_wifi.png" http://$(IP_ADDRESS)/upload
		curl -F "datafile=@default2.pjs" http://$(IP_ADDRESS)/upload			
		@echo "==== upload done ==== "
		