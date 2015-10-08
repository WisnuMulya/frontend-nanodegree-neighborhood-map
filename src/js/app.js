'use strict';

// Run function when page loaded to initialize app
$(function() {
  if (!localStorage.locations || (JSON.parse(localStorage.locations).length < 15)) {
    createLocalStorage();
    setTimeout(init, 1000); // Wait for the localStorage to be built
  } else {
    init();
  }
});

// Create local storage data when there's none or when the data is not complete
function createLocalStorage() {
  localStorage.locations = '[]'; // Initialize localStorage array
  var localStorageObject;

  var places = [
    {"name": "Museum Satria Mandala", "type": "landmark"},
    {"name": "Taman Suropati", "type": "park"},
    {"name": "Taman Menteng", "type": "park"},
    {"name": "Gelora Bung Karno", "type": "landmark"},
    {"name": "Monumen Nasional", "type": "landmark"},
    {"name": "Kebun Binatang Ragunan", "type": "zoo"},
    {"name": "Taman Mini Indonesia Indah", "type": "theme-park"},
    {"name": "Kuningan City Mall", "type": "mall"},
    {"name": "Mall of Indonesia", "type": "mall"},
    {"name": "Pondok Indah Mall", "type": "mall"},
    {"name": "Plaza Senayan", "type": "mall"},
    {"name": "Plaza Indonesia Mall", "type": "mall"},
    {"name": "Grand Indonesia Mall", "type": "mall"},
    {"name": "Dunia Fantasi", "type": "theme-park"},
    {"name": "Taman Safari", "type": "zoo"}
  ];

  // Building local storage by using Google Geocoding API for requesting location's lat & lng
  places.forEach(function(place) {
    $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyC4SBS-k9EzqVIQS67qjljL-Q5wlzftYY4&address=' + place.name,
      function(data) {
        place.position = data.results[0].geometry.location;
        localStorageObject = JSON.parse(localStorage.locations);
        localStorageObject.push(place);
        localStorage.locations = JSON.stringify(localStorageObject);
    }).error(function() {
      console.log('error');
    });
  });
};


// Initialize app functionalities
function init() {
  // Variable to center the position of the map at initialization
  var jakarta = {name: "jakarta", position: {lat: -6.2087634, lng: 106.845599}};

  // Spots to be shown in the view
  var jakartaSpots = JSON.parse(localStorage.locations);

  // Initializing Google Maps
  var map = new google.maps.Map(document.getElementById('map'), {
    center: jakarta.position,
    zoom: 10
  });

  // Initializing infowindow to be shown above the map markers
  var infowindow = new google.maps.InfoWindow({
    content: 'Loading...'
  });

  // Function to show infowindow content when triggered
  var infowindowOpen = function(locName, marker) {
    map.panTo(marker.getPosition())
    infowindow.open(map, marker);
    infowindow.setContent('Loading...');

    // Requesting images from Flickr
    $.getJSON('https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?', {
      format: 'json',
      tags: locName
    }, function(data) {
      var photos = '<h1>' + locName + '</h1>';

      data.items.forEach(function(photo){
        photos = photos + '<a class="flick-img-container" target="_blank" href="' + photo.link +'"><img class="flickr-img" src="' + photo.media.m + '"></a>';
      });

      infowindow.setContent(photos);
    }).error(function() {
      infowindow.setContent('<h1>' + locName + '</h1><p>There is something wrong; Flickr could not be loaded</p>')
    });
  };

  // Pseudoclassical class for initializing each spot
  var Spot = function(spotObj) {
    this.name = spotObj.name;
    this.position = spotObj.position;
    this.type = spotObj.type;

    // Initializing marker
    this.marker = new google.maps.Marker({
      position: this.position,
      map: null,
      title: this.name
    });

    // Listen to click to open infowindow
    this.marker.addListener('click', (function(nameCopy, markerCopy) {
      return function() {
        infowindowOpen(nameCopy, markerCopy);
      };
    })(this.name, this.marker));
  };

  // Object to initialize knockout.js functionality
  var viewModel = function() {
    var self = this;

    self.query = ko.observable(''); // Value of navigation-search
    self.jakartaSpots = ko.observableArray([]);
    self.filter = ko.observable('all');

    jakartaSpots.forEach(function(spot) {
      self.jakartaSpots.push(new Spot(spot));
    });

    // Create search functionality on spots
    self.spots = ko.computed(function() {
      var search = this.query().toLowerCase();
      var array = this.filter() === 'all'?
        ko.utils.arrayFilter(this.jakartaSpots(), function(spot) {return spot.name.toLowerCase().indexOf(search) >= 0}) :
        ko.utils.arrayFilter(this.jakartaSpots(), function(spot) {return ((spot.name.toLowerCase().indexOf(search) >= 0) && (spot.type === self.filter()))});

      // Toggle visibility of markers based on query in navigation search input
      this.jakartaSpots().forEach(function(spot) {
        spot.marker.setMap(null);
      });

      array.forEach(function(spot) {
        spot.marker.setMap(map);
      });

      return array;
    }, self);

    // Callback to click of navigation list item
    self.infowindowOpen = function(spotObj) {
      infowindowOpen(spotObj.name, spotObj.marker);
    };
  };

  ko.applyBindings(new viewModel());
}
