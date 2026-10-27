import datetime

class ViewWindow:
    def __init__(self, startTime, endTime):
        self.begins = startTime
        self.ends = endTime

    def save(self, cursor):
        #search for existing location based on lat and lon
        id = self._getExistingId(cursor)

        if id is None:
            self._insertIntoDb(cursor)
        else:
            self._updateDb(cursor, id)

    #gets loc_id from existing db.  If none exists, returns None
    def _getExistingId(self, cursor):
        cursor.execute('''SELECT view_id 
        FROM (SELECT view_id begins ends 
        FROM ViewWindow
        WHERE begins = ? AND ends = ?''', (self.display_name,))
        
        id = cursor.fetchone()[0]
        return id

    #inserts location directly into database (assumes no conflicts)
    def _insertIntoDb(self, cursor):
        cursor.execute('''INSERT INTO ViewWindow (begins, ends) VALUES
        (?,?)''',
        (self.begins, self.ends))


    def _updateDb(self, cursor, id):
        cursor.execute('''UPDATE ViewWindow 
        SET begins = ?, ends = ?
        WHERE view_id = ?)''', (self.display_name, self.display_info, id))