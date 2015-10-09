'use strict';

// Run function when page loaded to initialize app
$(function() {
  if (!localStorage.locations || (JSON.parse(localStorage.locations).length < 16)) {
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
    {"name": "Satriamandala Museum", "type": "landmark"},
    {"name": "Taman Suropati", "type": "park"},
    {"name": "Taman Menteng", "type": "park"},
    {"name": "Gelora Bung Karno", "type": "landmark"},
    {"name": "Monumen Nasional", "type": "landmark"},
    {"name": "Ragunan Zoo", "type": "zoo"},
    {"name": "Taman Mini Indonesia Indah", "type": "theme-park"},
    {"name": "Kuningan City Mall", "type": "mall"},
    {"name": "Mall of Indonesia", "type": "mall"},
    {"name": "Pondok Indah Mall", "type": "mall"},
    {"name": "Plaza Senayan", "type": "mall"},
    {"name": "Plaza Indonesia Mall", "type": "mall"},
    {"name": "Grand Indonesia Mall", "type": "mall"},
    {"name": "Dunia Fantasi", "type": "theme-park"},
    {"name": "Taman Safari", "type": "zoo"},
    {"name": "Taman Honda Tebet", "type": "park"}
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

  // Initializing Google Maps
  var map = new google.maps.Map(document.getElementById('map'), {
    center: jakarta.position,
    zoom: 10
  });

  // Initializing infowindow to be shown above the map markers
  var infowindowElem = '<div id="infowindow-content" data-bind="with: infowindowContent">';
  infowindowElem += '<h1 data-bind="text: title"></h1>';
  infowindowElem += '<h2>Wikipedia Description:</h2>';
  infowindowElem += '<p data-bind="text: wikiDesc"></p>';
  infowindowElem += '<h2>Flickr Images:</h2>';
  infowindowElem += '<div data-bind="html: flickrImg"></div></div>';

  var infowindow = new google.maps.InfoWindow({
    content: infowindowElem
  });

  // Function to show infowindow content when triggered and select list item in nav
  var infowindowOpen = function(spotObject, vm) {
    spotObject.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      spotObject.marker.setAnimation(null);
    }, 1500);
    var flickrStrings = '';
    map.panTo(spotObject.marker.getPosition());
    infowindow.open(map, spotObject.marker);
    vm.selectedSpot(spotObject);
    vm.infowindowTitle(spotObject.name);

    // Requesting wikiSpotUrl and wikiDesc
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + spotObject.name + ' &format=json&callback=wikiCallBack';

    $.ajax({
      url: wikiUrl,
      dataType: 'jsonp',
      success: function(data) {
        if (data[2].length > 0 && data[2][0] !== '') {
          vm.infowindowWikiDesc(data[2][0]);
        } else {
          vm.infowindowWikiDesc('Wikipedia does not have any description about this spot.');
        }
      }
    }).error(function() {
      vm.infowindowWikiDesc('There is an error on fetching Wikipedia info.');
    });

    // Requesting images from Flickr
    $.getJSON('https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?', {
      format: 'json',
      tags: spotObject.name
    }, function(data) {
      if (data.items.length > 0) {
        data.items.forEach(function(photo){
          flickrStrings = flickrStrings + '<a class="flick-img-container" target="_blank" href="' + photo.link +'"><img class="flickr-img" src="' + photo.media.m + '"></a>';
        });

        vm.infowindowFlickr(flickrStrings);
      } else {
        vm.infowindowFlickr('Flickr does not have images of this spot.')
      }
    }).error(function() {
      vm.infowindowFlickr('<p>There is something wrong; Flickr could not be loaded</p>');
    });
  };

  // Pseudoclassical class for initializing each spot
  var Spot = function(spotObj, vm) {
    this.name = spotObj.name;
    this.position = spotObj.position;
    this.type = spotObj.type;

    var icon = {
      'landmark': 'flag_maps.png',
      'park': 'parks_maps.png',
      'mall': 'shopping_maps.png',
      'zoo': 'horsebackriding_maps.png',
      'theme-park': 'arts_maps.png'
    };

    // Initializing marker
    this.marker = new google.maps.Marker({
      position: this.position,
      map: null,
      title: this.name,
      icon: 'https://maps.google.com/mapfiles/kml/shapes/' + icon[this.type],
      animation: google.maps.Animation.DROP
    });

    // Listen to click to open infowindow
    this.marker.addListener('click', (function(spot, vmCopy) {
      return function() {
        infowindowOpen(spot, vmCopy);
      };
    })(this, vm));
  };

  // Object to initialize knockout.js functionality
  var viewModel = function() {
    var self = this;

    self.query = ko.observable(''); // Value of navigation-search
    self.selectedSpot = ko.observable(null);
    self.filter = ko.observable('all');
    self.infowindowTitle = ko.observable('Loading...');
    self.infowindowFlickr = ko.observable('Loading...');
    self.infowindowWikiDesc = ko.observable('Loading...');
    self.infowindowContent = ko.computed(function() {
      return {
        title: self.infowindowTitle(),
        wikiDesc: self.infowindowWikiDesc(),
        flickrImg: self.infowindowFlickr()
      };
    });

    self.jakartaSpots = ko.computed(function() {
      var localStorageCopy = JSON.parse(localStorage.locations);
      var array = [];
      localStorageCopy.forEach(function(spot) {
        array.push(new Spot(spot, self));
      });

      return array;
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
      infowindowOpen(spotObj, self);
    };

    // Callback to make selectedSpot observable to be null when infowindow is closed
    google.maps.event.addListener(infowindow, 'closeclick', function() {
      self.selectedSpot(null);
    });
  };
  var ifInfowindowLoaded = false;
  var vmObject = new viewModel();
  ko.applyBindings(vmObject);
  google.maps.event.addListener(infowindow, 'domready', function() {
    if (!ifInfowindowLoaded) {
      ko.applyBindings(vmObject, document.getElementById('infowindow-content'));
      ifInfowindowLoaded = true;
    }
  });
}
