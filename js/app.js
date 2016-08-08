var map;

//Might use this when other map layers are added and we might use a layer control
$(window).resize(function() {
    sizeLayerControl();
});


//ZOOMS TO THE POINT WHEN CLICKED FROM THE SIDEBAR    
$(document).on("click", ".feature-row", function(e) {
    map.flyTo([$(this).attr("lat"), $(this).attr("lng")], 17);
    /* Hide sidebar and go to the map on small screens */
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

$(".feedback-btn").click(function() {
    $("#feedbackModal").modal("show");
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

//Might use this when other layers are added.
function sizeLayerControl() {
    $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

var floatPlanActive = false;

//INFORMATION/LEGEND BUTTON IN SMALL SCREENS--------------------
if (document.body.clientWidth <= 767) {
    zoomPadding = [20, 20]
} else {
    zoomPadding = [100, 100]
};

function animateSidebar() {
    $("#sidebar").animate({
        width: "toggle"
    }, 800, function() {
        map.invalidateSize();
    });
}

function syncSidebar(field, filter) {
    // Empty sidebar features
    $("#feature-list tbody").empty();
    // Add features to side bar
    accessLayer.eachFeature(function(layer) {
        if (layer.feature.properties[field] === filter) {
            $("#feature-list tbody").append('<tr class="feature-row" id="' + layer.feature.properties.pointID + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="icons/' + getType(layer.feature.properties.pointType)[1] + '"></td><td class="point-name">' + layer.feature.properties.pointName + '</td><td class="stream-mile">' + layer.feature.properties.streamMile + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
        }
    });
    $("#stream-title").html(filter);
}

// Basemap Layers
var basemap = L.esri.basemapLayer("Imagery");

// GET RIVER ACCESS DATA VIA ESRI LEAFLET FROM AGOL (FOR NOW, PROBABLY SWITCH TO SERVER)

var access = "https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/riversPortal/FeatureServer/0"

var pTypes = {
    1: ["Canoe/Kayak Access", "canoe.svg"],
    2: ["Boat Ramp", "ramp.svg"],
    3: ["Dam - Portage", "damp.svg"],
    4: ["Rapids/Shoals", "rapids.svg"],
    5: ["Public Land", "pub.svg"],
    6: ["Bridge", "bridge.svg"],
    7: ["Dam - No Portage", "damn.svg"],
    8: ["Confluence", "conf.svg"],
    9: ["Island", "island.svg"],
    10: ["Reservoir", "lake.svg"],
    11: ["Stream Gage", "gage.svg"]
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

//GET THE UNIQUE NAMES OF RIVERS AND POPULATE A DROPDOWN IN THE 'FIND A RIVER' MODAL
var riverNames = []
var trailNames = []
var scenicNames = []

map = L.map("map", {
    zoom: 8,
    center: [33.7, -81.1],
    zoomControl: false,
    attributionControl: false
});

basemap.addTo(map);

var fullWhere = "pointType IN (1,2,5)"

function removeLayers(keepLayers) {
    map.eachLayer(function(layer) {
        if ($.inArray(layer, keepLayers) == -1) {
            map.removeLayer(layer);
        }
    });
}

//~~~~~THESE FUNCTIONS WILL BE USED TO BUILD AND DISPLAY LEAFLET GEOJSON, BOTH ON ORIGINAL ESRI FEATURE LAYER AND ALSO FEATURE COLLECTIONS RETURNED FROM ESRI.QUERY~~~~~~~~~~~

function featureModalContent(feature) {

    var ll = [feature.properties.lat, feature.properties.long];

    $(document).on("click", "#zoom", function(e) {
        alert(ll);
        map.flyTo(ll, 14);
        $("#featureModal").modal("hide");
    });

    $("#feature-title").html(feature.properties.pointName + '&nbsp;&nbsp<img width="30" height="30" src="icons/' + getType(feature.properties.pointType)[1] + '">');

    var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><td colspan='2'>" + feature.properties.streamName + "</td></tr>" + "<tr><td colspan='2'>" + feature.properties.pointDesc + "</td></tr>" + "<tr><td colspan='2'>" + getAmenities(feature.properties.amenities) + "</td></tr>" + "<tr><td colspan='2'>" + getUrl(feature.properties.linkURL) + "</td></tr>" + "<tr><th>Stream Mile</th><td>" + feature.properties.streamMile + "</td></tr>" + "<tr><th>Side of River</th><td>" + getSide(feature.properties.riverSide)[0] + "</td></tr>" + "<tr><th>Coordinates</th><td><a href='#' id='zoom'>" + feature.properties.lat + ", " + feature.properties.long + "</a></td></tr>" + "<tr><th>Directions</th><td>" + "<a href='https://www.google.com/maps/dir//" + feature.properties.lat + "," + feature.properties.long + "' target='_blank'>" + "Google Maps" + "</a>" + "</td></tr>" + "<table>";

    $("#feature-info").html(content);

    if (floatPlanActive == true) {
        $("#float-plan").css("display", "none");
    } else {
        $("#float-plan").css("display", "block");
    }
}

//NOT USING RIGHT NOW, MAYBE USE LATER.
function pushToSearch(layer) {
    accessSearch.push({
        name: layer.feature.properties.pointName,
        source: "Access",
        id: layer.feature.properties.pointID,
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
    });
}

function makePointToLayer(geojson, latlng) {
    return L.marker(latlng, {
        icon: L.icon({
            iconUrl: 'icons/' + getType(geojson.properties.pointType)[1],
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    })
}

function defineFloatPoints(layer) {
    planID = layer.feature.properties.pointID
    planName = layer.feature.properties.pointName
    planMiles = layer.feature.properties.streamMile
    planStream = layer.feature.properties.streamName
    planType = layer.feature.properties.pointType
    coords = [layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]]
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//DEFINE THE DATA FROM ESRI FEATURE LAYER - PLUGIN IN THE FUNCTIONS TO BUILD GEOSJON ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var accessLayer = L.esri.featureLayer({
    url: access,
    where: fullWhere,
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
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
    var isCollapsed = true;
} else {
    var isCollapsed = false;
}

//ONCE ALL DATA LOADS, GET ALL THE RIVER and TRAIL NAMES AND ADD THEM TO THE DROPDOWN LISTS IN THE MODALS.
accessLayer.on("load", function() {
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

//GET STREAM NAME FROM OPTION, RUN ESRI QUERY, ZOOM TO THOSE FEATURES
$(".filter-btn").click(function(evt) {
    if (this.id === "getStream") {
        var field = "streamName"
        var filter = $("#stream-names").val();
        //reset the other boxes selection
        $("#scenic-names").val("Select a Scenic River...");
        $("#trail-names").val("Select a trail name...");
    } else if (this.id == "getTrail") {
        var field = "waterTrail_Name"
        var filter = $("#trail-names").val();
        //reset the other boxes selection
        $("#stream-names").val("Select a river name...");
        $("#scenic-names").val("Select a Scenic River...");
    } else if (this.id == "getScenic") {
        var field = "scenic_River"
        var filter = $("#scenic-names").val();
        //reset the other boxes selection
        $("#stream-names").val("Select a river name...");
        $("#trail-names").val("Select a trail name...");
    }

    var expression = field + "='" + filter + "'"

    $("#initial").hide();

    //clear layers and remove float plain points, if exist
    removeLayers([basemap, accessLayer, startEndGroup]);
    $(".floatTable").remove();
    //make sure that accessLayer is added to map, or setWhere filter can't happen
    if (!(map.hasLayer(accessLayer))) {
        map.addLayer(accessLayer);
    }

    //CONSIDER DOING A QUERY INSTEAD OF SET WHERE FILTER....

    accessLayer.setWhere(expression, function() {
        syncSidebar(field, filter);
    });

    accessLayer.query()
        .where(expression)
        .bounds(function(error, latlngbounds) {
            map.flyToBounds(latlngbounds, {
                padding: zoomPadding
            });
        });
});


//NEAR MODAL SCRIPT USING ESRI GEOCODER-----------------------

function syncSidebarGeo(layer, text) {

    $("#feature-list tbody").append('<tr class="feature-row" id="' + layer.feature.properties.pointID + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="icons/' + getType(layer.feature.properties.pointType)[1] + '"></td><td class="point-name">' + layer.feature.properties.pointName + '</td><td class="stream-name">' + layer.feature.properties.streamName + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

    $("#stream-title").html("Search distance: " + $("#distanceBox").val() + " miles.");

}

//SET THE STATE VALUE TO AUTOMATICALLY BE SC, BUT WILL CHANGE IF SOMEONE CHANGES IT
$("#stateBox").val("South Carolina")

function queryLatLng(latlng, text) {

    var distance = Number($("#distanceBox").val()) * 1609.34

    accessLayer.query()
        .where("pointType IN (1,2,5)")
        .nearby(latlng, distance)
        .orderBy("streamName")
        .run(function(error, fc, response) {
            if (fc.features.length == 0) {
                alert("No results were found. Please enter a valid address or increase your search distance.")
            } else {

                //remove layers and clear the side table of float plan points if it exists.
                removeLayers([basemap, startEndGroup]);
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

function geocodeLatLng() {

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
            var latlng = [lat, lng];

            queryLatLng(latlng, text);

        });

}

$("#geocode-btn").click(function() {
    geocodeLatLng();
    $("#stream-names").val("Select a river name...");
    $("#scenic-names").val("Select a Scenic River...");
    $("#trail-names").val("Select a trail name...");
});

//GEOLOCATOR BUTTON - POPULATE FIELDS FOR QUERY------------------------------
function onLocationFound(e) {
    map.locate({
        setView: true,
        maxZoom: 16
    });

    var geocodeService = L.esri.Geocoding.geocodeService();
    map.on('locationfound', function(e) {
        geocodeService.reverse().latlng(e.latlng).run(function(error, result) {
            L.marker(result.latlng).addTo(map).bindPopup(result.address.Match_addr).openPopup();
            $('#addressBox').val(result.address.Address);
            $('#cityBox').val(result.address.City);
        });
    });
    //queryLatLng(e.latlng);
};


$("#locate-btn").click(function() {
    //map.on('locationfound', onLocationFound);
    onLocationFound();
});


//INFORMATION/LEGEND BUTTON----------------------------------------
$("#legend-btn").click(function() {
    $("#legendModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

//INFORMATION/LEGEND BUTTON IN SMALL SCREENS--------------------
/*if (document.body.clientWidth <= 767) {
    $("#info-text").text('About');
} else {
    $("#info-text").text('');
};*/

//APPLE DEVICE HOME SCREEN INSTRUCTIONS-----------------------
$("#ios-btn").click(function() {
  $('#ios').show();
  $('#android').hide();
});

//ANDROID DEVICE HOME SCREEN INSTRUCTIONS--------------------
$("#android-btn").click(function() {
  $('#android').show();
  $('#ios').hide();
});

//CLEAR WHERE STATEMENTS AND SHOW ALL RIVERS, ZOOM TO FULL STATE VIEW
$(".view-all").click(function() {

    removeLayers([basemap, accessLayer, startEndGroup]);

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

    //NEED TO PUT THE DEFAULT STUFF BACK IN THE PANEL AND CLEAR THE LIST OF ITEMS
    $("#feature-list tbody").empty();
    $("#stream-names").val("Select a river name...");
    $("#scenic-names").val("Select a Scenic River...");
    $("#trail-names").val("Select a trail name...");
    $("#stream-title").html("Paddling the Palmetto State");
    $("#initial").show();
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DEVELOP FLOAT PLAN TOOL
// SELECT A START AND END POINT, RETURN ALL POINTS IN BETWEEN
// IF MULTIPLE STREAMS, RETURN ERROR IF THOSE DO NOT CONNECT

//This works bc onEachFeature assigns the variables on the click for the modal, and then it is sent to the float plan modal when the button is clicked
//This is the initial stuff that happens on the map and getting the points.

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
    $("#planStart").addClass("startSelected");

});

$("#planEnd").click(function() {
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
    $("#planEnd").addClass("endSelected");
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

    $tableID.find("tbody").append('<tr class="feature-row" id="' + layer.feature.properties.pointID + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="icons/' + getType(layer.feature.properties.pointType)[1] + '"></td><td class="point-name">' + layer.feature.properties.pointName + '</td><td class="stream-mile">' + layer.feature.properties.streamMile + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

    $("#stream-title").html("Float Plan");

}

function floatPlanQuery(list) {

    var lastEntry = list[list.length - 1]

    if (lastEntry["stream"] === endStream) {

        removeLayers([basemap, startEndGroup])
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

        $("#totalMiles").text(totalMiles.toString());
        $("#totalRivers").text(list.length);
        floatPlanGroup.addTo(map);

    } else {

        //if the start and end miles end up both as zero in this part of the function, it means that the loop has run all the way to the bottom of the chain 
        //so we pass an error the float plan results modal 

        if (lastEntry["startMiles"] === 0 & lastEntry["endMiles"] === 0) {

            $("#float-error-mult").css("display", "block");
            $("#float-header").hide();
            $("#planOptions").hide();
            $("#error-close").show();

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

        alert("Select a start and end point by clicking on access points on the map.")

    } else {

        if (startStream === endStream) {

            //if the start mile is less than end mile on two points of the same stream, give error     
            if (startMile < endMile) {

                $("#float-error-bw").css("display", "block");
                $("#float-header").hide();
                $("#planOptions").hide();
                $("#error-close").show();

            } else {

                //run the float plan process for points that are on the same stream... else move on to deal with multiple streams 
                removeLayers([basemap, startEndGroup])
                floatPlanActive = true;
                $("#feature-list tbody").empty();
                $("#planMiles").empty();
                $("#initial").hide();

                var streamMilesArray = []

                streamMilesArray.push({
                    "stream": startStream,
                    "startMiles": startMile,
                    "endMiles": endMile
                })

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

    }

});

//Get the data into CSV format and initiate download... using PapaParse to 'unparse' the geoJson 'feature' objects. 
//USING PAPA PARSE
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

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'floatPlan.csv';
    hiddenElement.click();

});

$("#export-gpx").click(function() {
    
    var geoJson = floatPlanGroup.toGeoJSON();
    var gpx = togpx(geoJson, {
        featureTitle: function(props) {
            return props.pointName
        }
    });

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + gpx;
    hiddenElement.target = '_blank';
    hiddenElement.download = 'floatPlan.gpx';
    hiddenElement.click();
})

function nullPdf(inProp){
    if (inProp == null){
        return ''
    } else {
        return inProp
    }
}

function buildPDF() {
    
    var body = [
                [{
                    text: 'Point Type',
                    style: 'tableHeader'
                },
                {
                    text: 'Name',
                    style: 'tableHeader'
                }, {
                    text: 'Stream Miles',
                    style: 'tableHeader'
                }, {
                    text: 'Stream/River',
                    style: 'tableHeader'
                }, {
                    text: 'Description',
                    style: 'tableHeader'
                }, {
                    text: 'Amenities',
                    style: 'tableHeader'
                },{
                    text: 'Latitude',
                    style: 'tableHeader'
                },{
                    text: 'Longitude',
                    style: 'tableHeader'
                }, {
                    text: 'Side of River',
                    style: 'tableHeader'
                }],
            ]
    
    var geoJson = floatPlanGroup.toGeoJSON();

    floatPlanGroup.eachLayer(function(layer) {
        var geoJson = layer.toGeoJSON();
        var fLength = geoJson.features.length;

        for (var i = 0; i < fLength; i++) {
            var row = [
                getType(geoJson.features[i].properties.pointType)[0],
                nullPdf(geoJson.features[i].properties.pointName),
                geoJson.features[i].properties.streamMile.toString(),
                geoJson.features[i].properties.streamName,
                nullPdf(geoJson.features[i].properties.pointDesc),
                nullPdf(geoJson.features[i].properties.amenities),
                geoJson.features[i].properties.lat,
                geoJson.features[i].properties.long,
                getSide(geoJson.features[i].properties.riverSide)
            ]
            body.push(row);
        }
    });
    
    return body
}

$("#export-pdf").click(function() {
    
    var pdfData = {
        pageOrientation: 'landscape',
        content: [{
            text: 'Float Plan',
            fontSize: 14,
            bold: true,
            margin: [0, 20, 0, 8]
        }, {
            style: 'tableExample',
            table: {
                headerRows: 1,
                body: buildPDF()
            },
            layout: 'lightHorizontalLines'
        }]
    };
    
    pdfMake.createPdf(pdfData).open();
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