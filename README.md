# SC DNR River Access Portal

Development of this river access application for [SCDNR's River Stewardship Program](http://www.dnr.sc.gov/water/river/overview.html). 

Many sources of data are being used in this application. Much of the foundation of this project was made possible because of the impressive project undertaken by Tom, the owner of [Random Connections](http://randomconnections.com/paddling-south-carolinas-rivers/) blog, in which he made a state-wide inventory of river access from a huge number of sources and made it available as a KML to Google Earth users. This provided a huge boost to our project, because it provided an extensive list of points and it was already in a spatial format that we easily imported into GIS. We're grateful for this resource.

This project verifies, builds on and expands Tom's work. It will make the river access data available via the web without the need for google earth, provide tools for searching and finding river access, and help river users plan paddling trips. 

Another goal of the project is to help paddlers by linking to more detailed information about access points, public lands, paddling trails, and providing USGS flow information. There will also be a form for submitting changes or making comments, which will help the SCDNR Rivers program keep the data up-to-date. 

### Technical information:

Using [bootleaf](https://github.com/bmcbride/bootleaf), a map-based application template with bootstrap and leaflet, developed by bmcbride.
Also using [ESRI Leaflet](https://esri.github.io/esri-leaflet/) to access data hosted by with ESRI Arc Server. 

Laeflet version is 1.0.

The backbone of the application is the streamMiles field in the river access database. Each point is assigned a stream mile (starting from 0 at the mouth working upstream). Users can easily calculate the distance between access points and points of interest. This also allows for proper sorting of points and networking between streams when using the float plan tool. 

### Data sources:

First and foremost, Tom's Paddling South Carolina Rivers KML file [LINK](http://randomconnections.com/paddling-south-carolinas-rivers/)
SCDNR River Stewardship program Scenic Rivers and SCDNR GIS data 
SC Trails Website [LINK](http://sctrails.net/trails/) 
American Whitewater [LINK](https://www.americanwhitewater.org/content/River/state-summary/state/SC/)
Plus all kinds of other sources that could include:
- utility company websites (for information on dams)
- Local paddling clubs and association websites
- local government and recreation department websites
- paddling guidebooks
- padding and outdoors internet forums
- good ole-fashioned field verification