CREATE TABLE Location (
    loc_id INTEGER PRIMARY KEY NOT NULL,
    lat INTEGER NOT NULL, 
    lon INTEGER NOT NULL,
    short_name VARCHAR DEFAULT NULL,
    long_name VARCHAR DEFAULT NULL,

    UNIQUE(lat, lon)
);

CREATE TABLE ObjectOfInterest (
    obj_id INTEGER PRIMARY KEY NOT NULL,
    display_name varchar NOT NULL,
    display_info varchar,

    UNIQUE (display_name)
);

CREATE TABLE ViewWindow (
    view_id INTEGER PRIMARY KEY NOT NULL,
    begins DATETIME NOT NULL,
    ends DATETIME NOT NULL,

    UNIQUE(begins, ends)
);

CREATE TABLE LocationViewWindow (
    loc_view_id INTEGER PRIMARY KEY NOT NULL,
    view_id INTEGER,
    loc_id INTEGER,

    FOREIGN KEY (view_id) REFERENCES ViewWindow(view_id),
    FOREIGN KEY (loc_id) REFERENCES Location(loc_id),
    UNIQUE(view_id, loc_id)

);

CREATE TABLE LocationSkyEvent (
    loc_event_id INTEGER PRIMARY KEY NOT NULL,
    loc_view_id INTEGER NOT NULL,
    obj_id INTEGER DEFAULT NULL,

    FOREIGN KEY (loc_view_id) REFERENCES LocationViewWindow(loc_view_id),
    FOREIGN KEY (obj_id) REFERENCES ObjOfInterest(obj_id),
    UNIQUE (loc_view_id, obj_id)
);

CREATE TABLE GlobalSkyEvent (
    event_id INTEGER PRIMARY KEY NOT NULL,
    view_id INTEGER NOT NULL,
    obj_id INTEGER DEFAULT NULL,

    FOREIGN KEY (view_id) REFERENCES ViewWindow(view_id),
    FOREIGN KEY (obj_id) REFERENCES ObjectOfInterest(obj_id)
);

CREATE TABLE Weather (
    weather_id INTEGER PRIMARY KEY NOT NULL,
    loc_view_id INTEGER,
    
    temp float,
    cloud_cover float,
    visibility float,
    chance_precipitation float,

    FOREIGN KEY (loc_view_id) REFERENCES LocationEvent(loc_view_id) ON DELETE CASCADE,
    UNIQUE(loc_view_id)
);

CREATE TABLE Night (
    night_id INTEGER PRIMARY KEY NOT NULL,
    loc_view_id INTEGER NOT NULL,

    FOREIGN KEY (loc_view_id) REFERENCES LocationViewWindow(loc_view_id) ON DELETE CASCADE,
    UNIQUE (loc_view_id)
);