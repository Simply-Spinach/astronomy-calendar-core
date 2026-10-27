class LocationViewWindow:
    def __init__(self, view, location):
        self.view = view
        self.location = location

    def save(self, cursor):
        #search for existing location based on currently saved items
        id = self._getExistingId(cursor)

        if id is None:
            self._insertIntoDb(cursor)
        else:
            self._updateDb(cursor, id)

    #gets id from existing db.  If none exists, returns None
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