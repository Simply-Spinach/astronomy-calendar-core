#PLANETS = [
#    ObjectOfInterest('mercury', 'mercury',AO_type.PLANET), 
#    ObjectOfInterest('venus', 'venus', AO_type.PLANET),
#    ObjectOfInterest('moon', 'moon', AO_type.MOON), 
#    ObjectOfInterest('mars', 'mars barycenter', AO_type.PLANET),
#    ObjectOfInterest('jupiter', 'jupiter barycenter', AO_type.PLANET),
#    ObjectOfInterest('saturn', 'saturn barycenter', AO_type.PLANET),
#    ObjectOfInterest('uranus', 'uranus barycenter', AO_type.PLANET),
#    ObjectOfInterest('neptune', 'neptune barycenter', AO_type.PLANET),
#    ObjectOfInterest('pluto', 'pluto barycenter', AO_type.DWARF_PLANET)
#]

class ObjectOfInterest:
    def __init__(self, name, info):
        self.display_name = name
        self.display_info = info

    def save(self, cursor):
        #search for existing location based on lat and lon
        id = self._getExistingId(cursor)

        if id is None:
            self._insertIntoDb(cursor)
        else:
            self._updateDb(cursor, id)
            

    #gets loc_id from existing db.  If none exists, returns None
    def _getExistingId(self, cursor):
        cursor.execute('''SELECT obj_id 
        FROM (SELECT obj_id display_name 
        FROM ObjectOfInterest
        WHERE display_name = ?''', (self.display_name,))
        
        id = cursor.fetchone()[0]
        return id

    #inserts location directly into database (assumes no conflicts)
    def _insertIntoDb(self, cursor):
        cursor.execute('''INSERT INTO ObjectOfInterest (display_name, display_info) VALUES
        (?,?)''',
        (self.display_name, self.display_info))


    def _updateDb(self, cursor, id):
        cursor.execute('''UPDATE ObjectOfInterest 
        SET display_name = ?, display_info = ?
        WHERE obj_id = ?)''', (self.display_name, self.display_info, id))