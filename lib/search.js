var directionsDisplay;
var map;
var start;


// Row builder for the JSON data response
function rowBuilder(data, i){
    return '<tr>'
        + '<td>' + i + '</td>'
        + '<td>' + data.Name + '</td>'
        + '<td>' + data.Gender + '</td>'
        + '<td>' + data['Report date'] + '</td>'
        + '<td>' + data.Country + '</td>'
        + '<td>' + data.Corridor + '</td>'
        + '<td>' + data.Cod + '</td>'
        + '<td>' + data['Ome cod'] + '</td>'
    + '</tr>'
}

// Perform the Ajax request with the parameters
function ajax_request(parameters) {
    $.ajax({
        url:'http://safetrails.herokuapp.com/cases/index.php',
        dataType:'json',
        xhrFields: { withCredentials: false },
        type:'GET',
        data: parameters,
        success:function(data){
            var cont = 0;
            var currentInfoWindow = null;
            initialize(borderLat, borderLng);
            $.each(data, function(i) {
                cont++;
                $(rowBuilder(this, cont)).appendTo("#results tbody")
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(this.Lat, this.Long),
                    map: map,
                    title: this.Name
                });
                marker.info = new google.maps.InfoWindow({
                  content: '<b>Case ' + this['Ext id'] + '</b><br>'
                    + this.Name + ', ' + this.Gender + '<br><br>'
                    + '<b>Reporting Date:</b> '+  this['Report date'] + '<br>'
                    + '<b>Corridor:</b> ' + this.Corridor + '<br>'
                    + '<b>County:</b> ' + this.Country + '<br>'
                    + '<b>Location:</b> ' + this.Place + '<br>'
                    + '<b>Cause of Death:</b> ' + this.Cod + '<br>'
                    + '<b>Description:</b> ' + this['Omd cod'] + '<br>'
                });

                google.maps.event.addListener(marker, 'click', function() {
                    if (currentInfoWindow != null) {
                        currentInfoWindow.close();
                    }
                    marker.info.open(map, marker);
                    currentInfoWindow = marker.info;
                });
            });
        },
        error: function(error) {
            $("#request-error").show().html("<strong>Sorry!</strong> The request could not be processed due to a server error.");
        }
    });
}

$(function() {
    
    $("form#search-form").submit(function() {
        $("#results tbody").find("tr").remove();
        var mydata = $("#search-form").serialize();
        //TODO: Fix the backend to exclude empty parameters
        var cleandata = mydata.replace(/[^&]+=\.?(?:&|$)/g, '');
        ajax_request(cleandata);

        return false;
    });
    var mapView = $("#map-canvas");
    var tableView = $(".table-results");
    $("#view-btn").click(function() {
        if (mapView.is(":visible")){
            mapView.hide("fast");
            tableView.show("fast");
            $("#view-btn").html("View Map");
        } else {
            tableView.hide("fast");
            mapView.show("fast");
            $("#view-btn").html("View Table");
        }
    });
});



