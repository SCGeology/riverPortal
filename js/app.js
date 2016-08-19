var map;

//Might use this when other map layers are added and we might use a layer control
$(window).resize(function() {
    sizeLayerControl();
});    

var loadTarget = document.getElementById("loading");
//spinner
var spinner = new Spinner().spin(loadTarget);

//SIMPLE BUTTONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//ZOOMS TO THE POINT WHEN CLICKED FROM THE SIDEBAR    
$(document).on("click", ".feature-row", function(e) {
    map.flyTo([$(this).attr("lat"), $(this).attr("lng")], 17);
    /* Hide sidebar and go to the map on small screens */
    if ($(this).hasClass("gage")) {
        var usgsurl = "http://waterdata.usgs.gov/nwis/uv?site_no="+$(this).attr("id");
        window.open(usgsurl);
    }
    if (document.body.clientWidth <= 767) {
        $("#sidebar").hide();
        map.invalidateSize();
        map.invalidateSize();
    }
});

$("#near-btn").click(function() {
    $("#nearModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#trail-btn").click(function() {
    $("#trailModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#list-btn").click(function() {
    animateSidebar();
    return false;
});

$("#float-btn").click(function() {
    if (floatPlanActive == false) {
        $("#floatModal").modal("show");
        $(".navbar-collapse.in").collapse("hide");
        return false;
    } else {
        $("#floatResultModal").modal("show");
        $(".navbar-collapse.in").collapse("hide");
        return false;
    }
});

$("#error-close").click(function() {
    $("#float-error-mult").css("display", "none");
    $("#float-header").show();
    $("#planOptions").show();
    $("#error-close").hide();
});

$("#goToFloat").click(function() {
    $("#floatModal").modal("show");
});

$("#nav-btn").click(function() {
    $(".navbar-collapse").collapse("toggle");
    return false;
});

$("#sidebar-toggle-btn").click(function() {
    animateSidebar();
    return false;
});

$("#sidebar-hide-btn").click(function() {
    animateSidebar();
    return false;
});

$("#send-email").click(function() {
    $("#thanksModal").modal("show");
});

$("#legend-btn").click(function() {
    $("#legendModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});
$("#view-list").click(function(){
    animateSidebar();
});

//DEVICE HOME SCREEN INSTRUCTIONS
$("#ios-btn").click(function() {
    if ($("#instruct-android").hasClass("in")) {
        $("#instruct-android").removeClass("in");
    }
});

$("#android-btn").click(function() {
    if ($("#instruct-ios").hasClass("in")) {
        $("#instruct-ios").removeClass("in");
    }
});

//CLEAR WHERE STATEMENTS AND SHOW ALL RIVERS, ZOOM TO FULL STATE VIEW
$(".view-all").click(function() {
    
    removeLayers([basemap, imagery, accessLayer, startEndGroup]);

    if (!(map.hasLayer(accessLayer))) {
        map.addLayer(accessLayer);
    }

    clearPlan();

    floatPlanActive = false;

    $(".floatTable").remove();

    accessLayer.setWhere(fullWhere);
    accessLayer.query().bounds(function(error, latlngbounds) {
        map.flyToBounds(latlngbounds, {
            padding: zoomPadding
        });
    });
    
    $("#view-points").text("View All Points").removeClass("all").show();
    
    //NEED TO PUT THE DEFAULT STUFF BACK IN THE PANEL AND CLEAR THE LIST OF ITEMS
    $("#feature-list tbody").empty();
    $("#stream-names").val("Select a river name...");
    $("#scenic-names").val("Select a Scenic River...");
    $("#trail-names").val("Select a trail name...");
    $("#stream-title").html("Paddling the Palmetto State");
    $("#initial").show();
    $("#view-connect").css("display","none");
    
    $(this).blur();
});


$("#view-points").click(function(){
    if ($(this).hasClass("access")){
        accessLayer.setWhere(allWhere);
        $(this).text("View Only Access");
        $(this).toggleClass("all access");
    } else {
        accessLayer.setWhere(fullWhere);
        $(this).text("View All Points");
        $(this).toggleClass("all access");
    }
    $(this).blur();
});
    

/*$("#view-connect").click(function(){

});*/

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//SIDEBAR AND LAYOUT SETUP~~~~~~~~~~~~~~~~
function sizeLayerControl() {
    $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

var floatPlanActive = false;

if (document.body.clientWidth <= 767) {
    zoomPadding = [20, 20]
    var isCollapsed = true;
} else {
    zoomPadding = [100, 100]
    var isCollapsed = false;
}

function animateSidebar() {
    $("#sidebar").animate({
        width: "toggle"
    }, 800, function() {
        map.invalidateSize();
    });
}

function syncSidebar(layer,filter) {
        
    $("#feature-list tbody").append('<tr class="feature-row ' +getType(layer.feature.properties.pointType)[2]+'" id="' + layer.feature.properties.pointID + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="icons/' + getType(layer.feature.properties.pointType)[1] + '"></td><td class="point-name">' + getGage(layer.feature.properties.pointType,layer.feature.properties.pointName) + '</td><td class="stream-mile">' + layer.feature.properties.streamMile + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

    $("#stream-title").html(filter);
    
}

function removeLayers(keepLayers) {
    map.eachLayer(function(layer) {
        if ($.inArray(layer, keepLayers) == -1) {
            map.removeLayer(layer);
        }
    });
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~~~~~~~~~~MAP SETUP~~~~~~~~~~~~~~~~~~~~~

var imagery = L.esri.basemapLayer("Imagery");
var basemap = L.tileLayer("https://api.mapbox.com/styles/v1/scearthsci/cirnx501k0012g1mbinagyxgu/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2NlYXJ0aHNjaSIsImEiOiI3NTg0NGM0ZTMzNjI5N2Q5ZDRmMWQ0YjI5MjczNTlhYSJ9.36fX8a8aHxH7ZouF3KqMqQ");

map = L.map("map", {
    zoom: 8,
    center: [33.7, -81.1],
    zoomControl: false,
    attributionControl: false,
    minZoom:7
});

basemap.addTo(map);

map.on('baselayerchange', function(e){
    $("#view-all").toggleClass("dark light");
});

var baselayers = {"Topo":basemap,"Imagery":imagery};
L.control.layers(baselayers,null,{
    position:'topleft'
}).addTo(map);

var access = "https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/riversPortal/FeatureServer/0"

/* Attribution control */
function updateAttribution(e) {
    $.each(map._layers, function(index, layer) {
        if (layer.getAttribution) {
            $("#attribution").html((layer.getAttribution()));
        }
    });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
    position: "bottomright"
});
attributionControl.onAdd = function(map) {
    var div = L.DomUtil.create("div", "leaflet-control-attribution");
    div.innerHTML = "<span class='hidden-xs'>SC DNR, with help from... | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
    return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
    position: "bottomright"
}).addTo(map);

//Set up functions for getting properties formatted correctly
var pTypes = {
    1: ["Canoe/Kayak Access", "canoe.png"],
    2: ["Boat Ramp", "ramp.png"],
    3: ["Dam - Portage", "damp.png"],
    4: ["Rapids/Shoals", "rapids.png"],
    5: ["Public Land", "pub.png"],
    6: ["Bridge", "bridge.png"],
    7: ["Dam - No Portage", "damn.png"],
    8: ["Confluence", "conf.png"],
    9: ["Island", "island.png"],
    10: ["Reservoir", "lake.png"],
    11: ["Stream Gage", "gage.png","gage"]
};

var rSide = {
    1: ["North"],
    2: ["East"],
    3: ["South"],
    4: ["West"],
    5: ["Center/Island"],
    6: ["Either"],
    7: ["n/a"]
}

function getType(val) {
    return pTypes[val];
}

function getSide(val) {
    //accounting for nulls right now, but all data will have  a value in future, so we can delete this.
    if (val != null) {
        return rSide[val]
    } else {
        return "n/a"
    }
}

function getAmenities(property) {
    if (property != null) {
        return property
    } else {
        return ""
    }
}

function getUrl(property) {
    if (property != null) {
        var html = "<a href='" + property + "' target='_blank'>More Information</a>"
    } else {
        var html = ""
    }
    return html
}

function getGage(type,name){
    if (type == 11){
        return "USGS STREAM GAGE"
    } else {
        return name
    }
}
//unique values arrays
var riverNames = []
var trailNames = []
var scenicNames = []

var fullWhere = "pointType IN (1,2,5)"
var allWhere = "pointType IN (1,2,3,4,5,6,7,8,9,10,11)"

//Reusable functions to build geojson from data returned from esri

function featureModalContent(feature) {

    $(document).on("click", "#zoom", function(e) {
        var ll = [feature.properties.lat, feature.properties.long];
        map.flyTo(ll, 14);
        $("#featureModal").modal("hide");
    });
    
    var mailto = "mailto:arringtont@dnr.sc.gov?Subject=River%20App%20Feedback&body=Feedback%20For%20Feature%20ID:%20"+feature.properties.pointID
    $("#feature-feedback").attr("href",mailto);

    $("#feature-title").html(feature.properties.pointName + '&nbsp;&nbsp<img width="30" height="30" src="icons/' + getType(feature.properties.pointType)[1] + '">');
    
    var content = ""
    
    if (feature.properties.pointType == 11){
        
        $("#float-plan").css("display","none");
        
        content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><td colspan='2'> USGS Stream Gage </td></tr>" + "<tr><td colspan='2'><a href='"+feature.properties.linkURL + "' target='_blank'>USGS Data Page</a></td></tr>" + "<tr><th>Stream Mile</th><td>" + feature.properties.streamMile + "</td></tr>" + "<tr><th>Coordinates</th><td><a href='#' id='zoom'>" + feature.properties.lat + ", " + feature.properties.long + "</a></td></tr><table>";
        
    } else {
        
        content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><td colspan='2'>" + feature.properties.streamName + "</td></tr>" + "<tr><td colspan='2'>" + feature.properties.pointDesc + "</td></tr>" + "<tr><td colspan='2'>" + getAmenities(feature.properties.amenities) + "</td></tr>" + "<tr><td colspan='2'>" + getUrl(feature.properties.linkURL) + "</td></tr>" + "<tr><th>Stream Mile</th><td>" + feature.properties.streamMile + "</td></tr>" + "<tr><th>Side of River</th><td>" + getSide(feature.properties.riverSide)[0] + "</td></tr>" + "<tr><th>Coordinates</th><td><a href='#' id='zoom'>" + feature.properties.lat + ", " + feature.properties.long + "</a></td></tr>" + "<tr><th>Directions</th><td>" + "<a href='https://www.google.com/maps/dir//" + feature.properties.lat + "," + feature.properties.long + "' target='_blank'>" + "Google Maps" + "</a>" + "</td></tr>" + "<table>";    
        
        if (floatPlanActive == true) {
            $("#float-plan").css("display", "none");
        } else {
            $("#float-plan").css("display", "block");
        }
    }

    $("#feature-info").html(content);

}

function makePointToLayer(geojson, latlng) {
    return L.marker(latlng, {
        icon: L.icon({
            iconUrl: 'icons/' + getType(geojson.properties.pointType)[1],
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        })
    })
}

//used in onEachFeature to attach variables to each feature
function defineFloatPoints(layer) {
    planID = layer.feature.properties.pointID
    planName = layer.feature.properties.pointName
    planMiles = layer.feature.properties.streamMile
    planStream = layer.feature.properties.streamName
    planType = layer.feature.properties.pointType
    coords = [layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]]
}

//original data layer - esri feature layer
var accessLayer = L.esri.featureLayer({
    url: access,
    where:fullWhere,
//these options possibly improve performance    
    precision:5,
    renderer:L.canvas,
//---------------------------    
    pointToLayer: makePointToLayer,
    onEachFeature: function(feature, layer) {
        if ($.inArray(feature.properties.streamName, riverNames) === -1) {
            riverNames.push(feature.properties.streamName);
        }
        if ($.inArray(feature.properties.waterTrail_Name, trailNames) === -1) {
            trailNames.push(feature.properties.waterTrail_Name)
        }
        if ($.inArray(feature.properties.scenic_River, scenicNames) === -1) {
            scenicNames.push(feature.properties.scenic_River)
        }
        if (feature.properties) {
            layer.on({
                click: function(e) {
                    featureModalContent(feature);
                    $("#featureModal").modal("show");
                    defineFloatPoints(layer);
                }
            });
        }
    }
}).addTo(map);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~~~~~~~FIND A RIVER MODAL~~~~~~~~~~~~~~~~~~~~~~~~

//once original data loads, get unique value names for river dropdown lists.

accessLayer.on("load", function() {
    
    spinner.stop();
    $("#loading").hide();
    
    for (var i = 0; i < riverNames.length; i++) {
        val = riverNames.sort()[i];
        $("#stream-names").append('<option value="' + val + '">' + val + '</option>');
    }
    for (var i = 0; i < trailNames.length; i++) {
        val = trailNames.sort()[i];
        if (val != null) {
            $("#trail-names").append('<option value="' + val + '">' + val + '</option>');
        }
    }
    for (var i = 0; i < scenicNames.length; i++) {
        val = scenicNames.sort()[i];
        if (val != null) {
            $("#scenic-names").append('<option value="' + val + '">' + val + '</option>');
        }
    }
    
    accessLayer.off("load");

});

//get stream from options, run filter, display results
$(".filter-btn").click(function(evt) {
    if (this.id === "getStream") {
        var field = "streamName"
        var filter = $("#stream-names").val();
        //reset the other boxes selection
        $("#scenic-names").val("Select a Scenic River...");
        $("#trail-names").val("Select a trail name...");
        $("#view-connect").show();;
    } else if (this.id == "getTrail") {
        var field = "waterTrail_Name"
        var filter = $("#trail-names").val();
        //reset the other boxes selection
        $("#stream-names").val("Select a river name...");
        $("#scenic-names").val("Select a Scenic River...");
        $("#view-connect").hide();
    } else if (this.id == "getScenic") {
        var field = "scenic_River"
        var filter = $("#scenic-names").val();
        //reset the other boxes selection
        $("#stream-names").val("Select a river name...");
        $("#trail-names").val("Select a trail name...");
        $("#view-connect").hide();
    }

    var expression = field + "='" + filter + "'"

    $("#initial").hide();
    $("#feature-list tbody").empty();
    $("#view-points").hide();
    
    //clear layers and remove float plain points, if exist
    removeLayers([basemap, imagery, startEndGroup]);
    $(".floatTable").remove();
    
    accessLayer.query()
        .where(expression)
        .run(function(error,fc,response){
            filterLayer = L.geoJson(fc, {
                pointToLayer: makePointToLayer,
                onEachFeature: function(feature, layer) {
                        if (feature.properties) {

                            layer.on({
                                click: function(e) {
                                    featureModalContent(feature);
                                    $("#featureModal").modal("show");
                                    defineFloatPoints(layer);
                                }
                            });
                        }
                        syncSidebar(layer, filter);
                    }
                }).addTo(map);
        
                map.flyToBounds(filterLayer.getBounds(), {
                    padding: zoomPadding
                });
        });
});
             
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//~~~~~~~~~~~~NEAR MODAL - GEOLOCATION AND QUERY~~~~~~~~
//modernizr tests to see if supported, if not, button disabled

function syncSidebarGeo(layer, text) {

    $("#feature-list tbody").append('<tr class="feature-row" id="' + layer.feature.properties.pointID + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="icons/' + getType(layer.feature.properties.pointType)[1] + '"></td><td class="point-name">' + getGage(layer.feature.properties.pointType,layer.feature.properties.pointName) + '</td><td class="stream-name">' + layer.feature.properties.streamName + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

    $("#stream-title").html("Search distance: " + $("#distanceBox").val() + " miles.");
}

$("#stateBox").val("South Carolina")

function queryLatLng(latlng, text) {
    
    var distance = Number($("#distanceBox").val()) * 1609.34
    
    if ($("#check").is(':checked')) {
        var where = allWhere
    } else {
        var where = fullWhere
    }
    
    accessLayer.query()
        .where(where)
        .nearby(latlng, distance)
        .orderBy("streamName")
        .run(function(error, fc, response) {
            if (fc.features.length == 0) {
               $("#no-results").show();
               $("#errorModal").modal("show");
            } else {

                //remove layers and clear the side table of float plan points if it exists.
                removeLayers([basemap, imagery, startEndGroup]);
                $(".floatTable").remove();
                $("#feature-list tbody").empty();
                $("#initial").hide();

                var geoSearchLayer = L.geoJson(fc, {
                    pointToLayer: makePointToLayer,
                    onEachFeature: function(feature, layer) {
                        if (feature.properties) {

                            layer.on({
                                click: function(e) {
                                    featureModalContent(feature);
                                    $("#featureModal").modal("show");
                                    defineFloatPoints(layer);
                                }
                            });
                        }
                        syncSidebarGeo(layer, text);
                    }
                }).addTo(map);

                var geoMarker = L.marker(latlng).addTo(map)
                    .bindPopup("<b>" + text + "</b>")
                    .openPopup();

                map.flyToBounds(geoSearchLayer.getBounds(), {
                    padding: zoomPadding
                });
            }
        });
}

var geolatlng

var locateOn = false;

map.on('locationfound',function(e) {
    
    $("#located").show();
    $("#addressBox, #cityBox, #stateBox").attr("readOnly","");
    $("#distanceBox").focus();
    
    $("#locate-btn").css("background-color","#ffbf80");
    
    geolatlng = e.latlng
    
});

map.on('locationerror', function(){
    $("#not-located").show();
});

var lc = L.control.locate({
    position: 'bottomright',
    icon: 'fa fa-location-arrow',
    strings: {
        title: "Current Location"
    }
}).addTo(map);

//INFORMATION/LEGEND BUTTON----------------------------------------
$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#locate-btn").click(function() {
    if (locateOn == false){
        lc.start();
        locateOn = true;
    } else {
        lc.stop();
        locateOn = false;
        $("#located").hide();
        $("#not-located").hide();
        $("#addressBox, #cityBox, #stateBox").removeAttr("readOnly","");
        $("#locate-btn").css("background-color","#fff");
    }
});

function geocodeLatLng() {

    $("#view-points").hide();
    
    if (locateOn === false){

        var address = $("#addressBox").val()
        var city = $("#cityBox").val()
        var state = $("#stateBox").val()
        L.esri.Geocoding.geocode()
            .address(address)
            .city(city)
            .region(state)
            .run(function(err, address, response) {
                var lat = address.results[0].latlng.lat
                var lng = address.results[0].latlng.lng
                var text = address.results[0].text
                geolatlng = [lat, lng];
                queryLatLng(geolatlng, text);
        });
        
    } else {
        
        var text = "Your Location: "+geolatlng;    
        
        queryLatLng(geolatlng, text);         
    }
}

$("#geocode-btn").click(function() {
    geocodeLatLng();
    $("#stream-names").val("Select a river name...");
    $("#scenic-names").val("Select a Scenic River...");
    $("#trail-names").val("Select a trail name...");
});
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//~~~~~~~~~~~~~CREATE FLOAT PLAN~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//This works bc onEachFeature assigns the variables on the click for the modal, and then it is sent to the float plan modal when the button is clicked

var startEndGroup = L.featureGroup().addTo(map);

//empty float plan layer so it can be referenced in csv and pdf things
var floatPlanGroup = L.featureGroup();

var startCircle = L.circleMarker([0, 0], {
    radius: 18,
    fillOpacity: 0,
    color: "#00cc00"
});
var endCircle = L.circleMarker([0, 0], {
    radius: 18,
    fillOpacity: 0,
    color: "#ff3300"
});

$("#planStart").click(function() {
    starting = planName
    $("#planStartText").html(planName)
    startID = planID
    startMile = planMiles
    startStream = planStream
    $("#planStartStream").html(startStream)
    startCircle.setLatLng(coords).addTo(startEndGroup);

    //check to see if start point is of access or public land type, and add warning message if not.    
    startType = planType
    if (!(startType === 1 || startType === 2 || startType === 5)) {
        $("#float-warning-st").css("display", "block");
    } else {
        $("#float-warning-st").css("display", "none");
    }

    //style the border of the button to show it has been selected
    $("#planStart").addClass("startSelected").blur();

});

$("#planEnd").click(function() {
    ending = planName
    $("#planEndText").html(planName)
    endID = planID
    endMile = planMiles
    endStream = planStream
    $("#planEndStream").html(endStream)
    endCircle.setLatLng(coords).addTo(startEndGroup);

    //check to see if end point is of access or public land type, and add warning message if not.     
    endType = planType
    if (!(endType === 1 || endType === 2 || endType === 5)) {
        $("#float-warning-en").css("display", "block");
    } else {
        $("#float-warning-en").css("display", "none");
    }

    //style the border of the button to show it has been selected    
    $("#planEnd").addClass("endSelected").blur();
});

var clearPlan = function() {
    startID = "", $("#planStartText").html("No start point selected..."), $("#planStartStream").html("...")
    endID = "", $("#planEndText").html("No end point selected..."), $("#planEndStream").html("...")

    startEndGroup.clearLayers();

    $("#planStart").removeClass("startSelected");
    $("#planEnd").removeClass("endSelected");
}

$("#clear-plan").click(function() {
    clearPlan()
});


function syncSidebarFloat(layer, index) {

    var $tableID = $("#feature-list" + index.toString());

    $tableID.find("tbody").append('<tr class="feature-row ' +getType(layer.feature.properties.pointType)[2]+' id="' + layer.feature.properties.pointID + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="icons/' + getType(layer.feature.properties.pointType)[1] + '"></td><td class="point-name">' + getGage(layer.feature.properties.pointType,layer.feature.properties.pointName) + '</td><td class="stream-mile">' + layer.feature.properties.streamMile + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

    $("#stream-title").html("Float Plan");

}

function floatPlanQuery(list) {

    var lastEntry = list[list.length - 1]

    if (lastEntry["stream"] === endStream) {

        removeLayers([basemap, imagery, startEndGroup])
        floatPlanActive = true;
        $("#feature-list tbody").empty();
        $("#planMiles").empty();
        $("#initial").hide();

        var totalMiles = 0;

        for (var i = 0; i < list.length; i++) {

            //set up new tables for each stream in the list returned. will append each data to appropriate table with stream name as header.

            var $newTable = $("#feature-list").clone(true);
            $newTable.attr("id", "feature-list" + i.toString());
            $newTable.addClass("floatTable");
            $("#side-table").append($newTable);
            $newTable.find("tbody").append("<tr class='feature-row'><th colspan='4' style='text-align:center;'>" + list[i]['stream'] + "</th><tr>")

            var sMiles = list[i]['startMiles']
            var eMiles = list[i]['endMiles']
            var strm = list[i]['stream']

            var totMiles = (sMiles - eMiles).toFixed(1);

            $("#planMiles").append("<tr><th>" + strm + "</th><td class='totMiles'>" + totMiles.toString() + " miles</td><tr>");

            totalMiles += parseFloat(totMiles);

            getPoints(sMiles, eMiles, strm, i);

        }

        $("#starting").text(starting);
        $("#ending").text(ending);
        $("#totalMiles").text(totalMiles.toString());
        $("#totalRivers").text(list.length);
        floatPlanGroup.addTo(map);

    } else {

        //if the start and end miles end up both as zero in this part of the function, it means that the loop has run all the way to the bottom of the chain 
        //so we pass an error the float plan results modal 

        if (lastEntry["startMiles"] === 0 & lastEntry["endMiles"] === 0) {

            $("#float-error-mult").show();
            $("#errorModal").modal("show");
            $("#floatResultModal").modal("hide");

        } else {

            accessLayer.query()
                .where("pointType = 8 AND streamName = '" + lastEntry["stream"] + "'AND streamMile = 0")
                .run(function(error, conPoint, response) {

                    //point ID of the confluence point for Stream A
                    var pID = conPoint.features[0].properties.pointID

                    //point ID of the correspond confluence point on stream B
                    var coID = conPoint.features[0].properties.coID

                    //this expression returns the point of the corresponding confluence, so you can get that points streamName, and miles
                    var exp2 = "pointID = '" + coID + "'"

                    accessLayer.query()
                        .where(exp2)
                        .run(function(error, coIDPoint, response) {

                            var coIDStream = coIDPoint.features[0].properties.streamName
                            var coStartMile = coIDPoint.features[0].properties.streamMile

                            if (coIDStream === endStream) {
                                var coEndMiles = endMile
                            } else {
                                var coEndMiles = 0
                            }

                            list.push({
                                "stream": coIDStream,
                                "startMiles": coStartMile,
                                "endMiles": coEndMiles
                            });

                            console.log(list);

                            floatPlanQuery(list);

                        });

                });
        }

    }
}

//Begin to query the data in between the points...
function getPoints(mileA, mileB, streamName, index) {

    //Need to set up multiple tables so that the data can be divided up into river sections    

    mileExpression = "streamMile <=" + mileA + "AND streamMile >=" + mileB + "AND streamName = '" + streamName + "'"

    accessLayer.query()
        .where(mileExpression)
        .orderBy("streamMile", "desc")
        .run(function(error, floatPlanPoints, response) {

            var floatPlanLayer = L.geoJson(floatPlanPoints, {
                pointToLayer: makePointToLayer,
                onEachFeature: function(feature, layer) {
                    if (feature.properties) {
                        layer.on({
                            click: function(e) {
                                featureModalContent(feature);
                                $("#featureModal").modal("show");
                                defineFloatPoints(layer);
                            }
                        });
                    }
                    syncSidebarFloat(layer, index);
                }
            }).addTo(floatPlanGroup);

            map.flyToBounds(startEndGroup.getBounds(), {
                padding: zoomPadding
            });
        });
}

$("#generate-plan").click(function() {
    
    floatPlanGroup.clearLayers();

    if ($("#planStartText").text() == "No start point selected..." || $("#planEndText").text() == "No end point selected...") {

        $("#select-points").show();
        $("#errorModal").modal("show");

    } else {

        if (startStream === endStream) {

            //if the start mile is less than end mile on two points of the same stream, give error     
            if (startMile < endMile) {

                $("#float-error-bw").show();
                $("#errorModal").modal("show");
                $("#floatResultModal").modal("hide");

            } else {

                //run the float plan process for points that are on the same stream... else move on to deal with multiple streams 
                removeLayers([basemap, imagery, startEndGroup])
                floatPlanActive = true;
                $("#feature-list tbody").empty();
                $("#planMiles").empty();
                $("#initial").hide();

                var streamMilesArray = []

                streamMilesArray.push({
                    "stream": startStream,
                    "startMiles": startMile,
                    "endMiles": endMile
                });

                floatPlanQuery(streamMilesArray);
            }

        } else {

            var streamMilesArray = []

            streamMilesArray.push({
                "stream": startStream,
                "startMiles": startMile,
                "endMiles": 0
            })

            floatPlanQuery(streamMilesArray);

        }

        //open float plan results modal
        $("#floatModal").modal("hide");
        $("#floatResultModal").modal("show");
        $("#view-points").hide();

    }

});

//~~~~~~~FLOAT PLAN EXPORT OPTIONS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var exportOption

$("#export-csv").click(function() {
    var propArray = []

    //returning toGeoJSON from a featureGroup is different than a regular layer. See console for structure...     
    var geoJson = floatPlanGroup.toGeoJSON();

    floatPlanGroup.eachLayer(function(layer) {
        var geoJson = layer.toGeoJSON();
        var fLength = geoJson.features.length;

        for (var i = 0; i < fLength; i++) {
            propArray.push(geoJson.features[i].properties)
        }
    });

    var csv = Papa.unparse(propArray);
    
    var csvContent = "data:text/csv;charset=utf-8,"+csv;
    var encoded = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download","floatplan.csv");
    document.body.appendChild(link);
    link.click();

});

$("#export-gpx").click(function() {
    
    var geo = { "type": "FeatureCollection",
    "features": []
              }
    
    floatPlanGroup.eachLayer(function(layer) {
        var geoJson = layer.toGeoJSON();
        var fLength = geoJson.features.length;
        
        for (var i = 0; i < fLength; i++) {
            geo.features.push(geoJson.features[i])
        }        
    });
    
    var gpx = togpx(geo, {
        featureTitle: function(props) {
            return props.pointName
        },
        featureDescription: function(props){
            var pt = getType(props.pointType)[0]
            var sn = props.streamName
            var sm = props.streamMile
            var pd = props.pointDesc

            return pt+" - "+sn+" - Mile: "+sm+" - "+pd
        }
        
    });
    
    var gpxContent = "data:xml;charset=utf-8,"+gpx;
    var encoded = encodeURI(gpxContent);
    var link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download","floatplan.gpx");
    document.body.appendChild(link);
    link.click();
    
});

$("#export-raw").click(function(){
    
    $("#raw tbody").empty();
    
    var geoJson = floatPlanGroup.toGeoJSON();

    floatPlanGroup.eachLayer(function(layer) {
        var geoJson = layer.toGeoJSON();
        var fLength = geoJson.features.length;
        console.log(geoJson)
        for (var i = 0; i < fLength; i++) {
            props = geoJson.features[i].properties
            var content = 
                "<tr><td>" + props.pointName + 
                "</td><td>" + props.streamMile + 
                "</td><td>" + props.streamName + 
                "</td><td>" + props.pointDesc+ 
                "</td><td>" + getAmenities(props.amenities) + 
                "</td><td>" + getSide(props.riverSide)[0] +
                "</td><td>" + props.lat + 
                "</td><td>" + props.long + 
                "</td></tr>";
            
            $("#raw tbody").append(content);
        }
    });
    
    var raw = document.getElementById("raw");
    rawWindow = window.open('');
    rawWindow.document.write('<html"><head><title>Raw Data</title><link rel="stylesheet" type="text/css" href="css/raw.css"></head><body><p>')
    rawWindow.document.write(raw.outerHTML);
    rawWindow.document.write('</body></html>');
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
    L.DomEvent
        .disableClickPropagation(container)
        .disableScrollPropagation(container);
} else {
    L.DomEvent.disableClickPropagation(container);
}