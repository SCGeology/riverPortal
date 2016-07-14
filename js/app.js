var map, featureList, accessSearch = [];

$(window).resize(function() {
    sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
    $(document).off("mouseout", ".feature-row");
    sidebarClick(parseInt($(this).attr("id"), 10));
});

if (!("ontouchstart" in window)) {
    $(document).on("mouseover", ".feature-row", function(e) {
        highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
    });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#near-btn").click(function() {
    $("#nearModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#river-btn").click(function() {
    $("#riverModal").modal("show");
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
    $("#floatModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
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

function sizeLayerControl() {
    $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
    highlight.clearLayers();
}

function animateSidebar() {
    $("#sidebar").animate({
        width: "toggle"
    }, 800, function() {
        map.invalidateSize();
    });
}

//ZOOMS TO THE POINT WHEN CLICKED FROM THE SIDEBAR
function sidebarClick(id) {
    $('.feature-row').on('click', function() {
        map.flyTo([$(this).attr("lat"), $(this).attr("lng")], 15);
        /* Hide sidebar and go to the map on small screens */
        if (document.body.clientWidth <= 767) {
            $("#sidebar").hide();
            map.invalidateSize();
            map.invalidateSize();
        }
    });
}

function syncSidebar(stream) {
    /* Empty sidebar features */
    $("#feature-list tbody").empty();
    accessLayer.eachFeature(function(layer) {
        if (layer.feature.properties.streamName === stream) {
            $("#feature-list tbody").append('<tr class="feature-row" id="' + layer.feature.properties.pointID + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="icons/' + getType(layer.feature.properties.pointType)[1] + '"></td><td class="point-name">' + layer.feature.properties.pointName + '</td><td class="stream-mile">' + layer.feature.properties.streamMile + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
        }   
    });    
}

function syncList(){
        /* Update list.js featureList */
    featureList = new List("features", {
        valueNames: ["point-name"]
    });
    featureList.sort("stream-mile", {
        order: "desc"
    });
}

// Basemap Layers
var basemap = L.esri.basemapLayer("Imagery");

// GET RIVER ACCESS DATA VIA ESRI LEAFLET FROM AGOL (FOR NOW, PROBABLY SWITCH TO SERVER)

var access = "https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/riversPortal/FeatureServer/0"

var pTypes = {
    1: ["Canoe/Kayak Access", "canoe.svg", "canoe.svg"],
    2: ["Boat Ramp", "ramp.svg", "ramp.svg"],
    3: ["Dam - Portage", "damp.svg", "damp.svg"],
    4: ["Rapids/Shoals", "rapids.svg", "rapids.svg"],
    5: ["Public Land", "pub.svg", ""],
    6: ["Bridge", "bridge.svg"],
    7: ["Dam - No Portage", "damn.svg", "damn.svg"],
    8: ["Confluence", "conf.svg"],
    9: ["Island", "island.svg"],
    10: ["Reservoir", "lake.svg"]
};

function getType(val) {
    return pTypes[val];
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

map = L.map("map", {
    zoom: 8,
    center: [33.7, -81.1],
    zoomControl: false,
    attributionControl: false
});

basemap.addTo(map);

var accessLayer = L.esri.featureLayer({
    url: access,
    pointToLayer: function(geojson, latlng) {
        return L.marker(latlng, {
            icon: L.icon({
                iconUrl: 'icons/' + getType(geojson.properties.pointType)[1],
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            }),
        });
    },
    onEachFeature: function(feature, layer) {
        if ($.inArray(feature.properties.streamName, riverNames) === -1) {
            riverNames.push(feature.properties.streamName);
        };
        if (feature.properties) {
            //THIS IS WHAT GOES IN THE MODAL    
            var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><td colspan='2'>" + feature.properties.streamName + "</td></tr>" + "<tr><td colspan='2'>" + feature.properties.pointDesc + "</td></tr>" + "<tr><td colspan='2'>" + feature.properties.amenities + "<tr><td colspan='2'>" + getUrl(feature.properties.linkURL) + "</td></tr>" + "<tr><th>Stream Mile</th><td>" + feature.properties.streamMile + "</td></tr>" + "<tr><th>Coordinates</th><td>" + feature.properties.lat + ", " + feature.properties.long + "</td></tr>" + "<table>";
            layer.on({
                click: function(e) {
                    $("#feature-title").html(feature.properties.pointName + '&nbsp;&nbsp<img width="30" height="30" src="icons/' + getType(layer.feature.properties.pointType)[1] + '">');
                    $("#feature-info").html(content);
                    $("#featureModal").modal("show");
                    //highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
                }
            });
            accessSearch.push({
                name: layer.feature.properties.pointName,
                source: "Access",
                id: layer.feature.properties.pointID,
                lat: layer.feature.geometry.coordinates[1],
                lng: layer.feature.geometry.coordinates[0]
            });
        }
    }
}).addTo(map);

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
    highlight.clearLayers();
});

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
    div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
    return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
    position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
    position: "bottomright",
    drawCircle: true,
    follow: true,
    setView: true,
    keepCurrentZoomLevel: true,
    markerStyle: {
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.8
    },
    circleStyle: {
        weight: 1,
        clickable: false
    },
    icon: "fa fa-location-arrow",
    metric: false,
    strings: {
        title: "My location",
        popup: "You are within {distance} {unit} from this point",
        outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
    },
    locateOptions: {
        maxZoom: 18,
        watch: true,
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
    }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
    var isCollapsed = true;
} else {
    var isCollapsed = false;
}

/* Highlight search box text on click */
$("#searchbox").click(function() {
    $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function(e) {
    if (e.which == 13) {
        e.preventDefault();
    }
});

$("#featureModal").on("hidden.bs.modal", function(e) {
    $(document).on("mouseout", ".feature-row", clearHighlight);
});

//ONCE ALL DATA LOADS, GET ALL THE RIVER NAMES AND ADD THEM TO THE DROPDOWN LIST IN THE MODAL. 
accessLayer.on("load", function() {
    for (var i = 0; i < riverNames.length; i++) {
        val = riverNames.sort()[i];
        $("#stream-names").append('<option value="' + val + '">' + val + '</option>');
    }
});

//GET STREAM NAME FROM OPTION, RUN ESRI QUERY, ZOOM TO THOSE FEATURES - still working on the zoom to part
$("#getStream").click(function() {
    var stream = $("#stream-names").val();
    accessLayer.setWhere("streamName ='" + stream + "'", function() {
        syncSidebar(stream);
        syncList();
    });
});


// Typeahead search functionality
$(document).on("ajaxStop", function() {
    $("#loading").hide();
    sizeLayerControl();
    // Fit map to boroughs bounds 
    map.fitBounds(accessLayer.getBounds());

    var geonamesBH = new Bloodhound({
        name: "GeoNames",
        datumTokenizer: function(d) {
            return Bloodhound.tokenizers.whitespace(d.name);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
            filter: function(data) {
                return $.map(data.geonames, function(result) {
                    return {
                        name: result.name + ", " + result.adminCode1,
                        lat: result.lat,
                        lng: result.lng,
                        source: "GeoNames"
                    };
                });
            },
            ajax: {
                beforeSend: function(jqXhr, settings) {
                    settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
                    $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
                },
                complete: function(jqXHR, status) {
                    $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
                }
            }
        },
        limit: 10
    });

    geonamesBH.initialize();

    // instantiate the typeahead UI
    $("#searchbox").typeahead({
        minLength: 3,
        highlight: true,
        hint: false
    }, {
        name: "GeoNames",
        displayKey: "name",
        source: geonamesBH.ttAdapter(),
        templates: {
            header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
        }
    }).on("typeahead:selected", function(obj, datum) {
        if (datum.source === "GeoNames") {
            map.setView([datum.lat, datum.lng], 14);
        }
        if ($(".navbar-collapse").height() > 50) {
            $(".navbar-collapse").collapse("hide");
        }
    }).on("typeahead:opened", function() {
        $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
        $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
    }).on("typeahead:closed", function() {
        $(".navbar-collapse.in").css("max-height", "");
        $(".navbar-collapse.in").css("height", "");
    });
    $(".twitter-typeahead").css("position", "static");
    $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
    L.DomEvent
        .disableClickPropagation(container)
        .disableScrollPropagation(container);
} else {
    L.DomEvent.disableClickPropagation(container);
}