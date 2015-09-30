'use strict';

var map;
var locations = ['jakarta', 'monas', 'kebun binatang ragunan', 'gelora bung karno', 'plaza senayan', 'pondok indah mall', 'sarinah', 'mall gandaria city', 'museum satria mandala', 'taman mini indonesia indah', 'taman suropati', 'taman menteng'];

var locationsGeo = {};

locations.forEach(function(loc) {
  $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + loc, function(data) {
    locationsGeo[loc] = data.results[0].geometry.location;
  });
});

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: locationsGeo.jakarta,
    zoom: 10
  });

  locations.forEach(function(loc) {
    var marker = new google.maps.Marker({
      position: locationsGeo[loc],
      map: map,
      title: loc
    });
  });
}
