# Location class for astro_weather.db that instantiates a location for an object or links it properly
class Location:
    def __init__(self, lat, lon, short_name, long_name = None):
        self.lat = lat
        self.lon = lon
        self.short_name = short_name
        self.long_name = long_name

    def save(self, cursor):
        #search for existing location based on lat and lon
        id = self._getExistingLocID(cursor)

        if id is None:
            self._insertIntoDb(cursor)
        else:
            self._updateDb(cursor, id)
            

    #gets loc_id from existing db.  If none exists, returns None
    def _getExistingId(self, cursor):
        cursor.execute('''SELECT loc_id 
        FROM (SELECT loc_id lat lon 
        FROM Location
        WHERE lat = ? AND lon = ?''', (self.lat, self.lon))
        
        id = cursor.fetchone()[0]
        return id

    #inserts location directly into database (assumes no conflicts)
    def _insertIntoDb(self, cursor):
        cursor.execute('''INSERT INTO Location (lat, lon) VALUES
        (?,?)''',
        (self.lat, self.lon))


    def _updateDb(self, cursor, id):
        cursor.execute('''UPDATE Location 
        SET lat = ?, lon = ?
        WHERE loc_id = ?)''', (self.lat, self.lon, id))