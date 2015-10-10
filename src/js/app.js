/**
 * @fileOverview app.js contains functions to initialize Neighborhood Map App. The initialization starts when <tt>initializeApp</tt> function gets called by Google Maps API.
 * @author Wisnu Mulya
 */

'use strict';

/**
 * Initializes the whole functionalities of Neighborhood Map application by creating localStorage data with <tt>createLocalStorage</tt> when there is none and then call <tt>initializeFunctionalities</tt> to initializes the main functionalities of the app.
 * @see createLocalStorage
 * @see initializeFunctionalities
 */
function initializeApp() {
  if (!localStorage.locations || (JSON.parse(localStorage.locations).length < 16)) {
    createLocalStorage();
    setTimeout(initializeFunctionalities, 500); // Wait for the localStorage to be built
  } else {
    initializeFunctionalities();
  }
};

/**
 * Create a localStorage data of places whose location acquired through AJAX call to Google Geocoding API.
 */
function createLocalStorage() {
  localStorage.locations = '[]';      // Initialize localStorage array
  var localStorageObject;             // Variable to store data from Google Geocoding AJAX call to be then store in localStorage.

  /**
   * @constant places Places to be inserted in localStorage as data.
   * @memberof createLocalStorage
   */
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


/**
 * Initialize the functionalities of the app and initialize viewModel bindings of knockout to the view and localStorage.
 */
function initializeFunctionalities() {
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
    content: infowindowElem,
    maxWidth: 400
  });

  /**
   * Open infowindow above a marker of the selected spot.
   * @param {object} spotObject Object of the selected spot.
   * @param {object} vm Object of viewModel binded to infowindow content.
   * @see initializeFunctionalities~Spot
   * @see initializeFunctionalities~viewModel.self.infowindowOpen
   * @memberOf initializeFunctionalities
   */
  var infowindowOpen = function(spotObject, vm) {
    // Setting animation of the marker
    spotObject.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      spotObject.marker.setAnimation(null);
    }, 1500);

    var flickrStrings = '';                         // Variable to be used when Flickr callback function is called
    map.panTo(spotObject.marker.getPosition());     // Center map to the spot highlighted
    infowindow.open(map, spotObject.marker);

    vm.selectedSpot(spotObject);                    // Toggle selected css class to navigation list item whose spot is selected
    vm.infowindowTitle(spotObject.name);            // Update infowindow content title

    // Requesting wikiSpotUrl and wikiDesc
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + spotObject.name + ' &format=json&callback=wikiCallBack';

    $.ajax({
      url: wikiUrl,
      dataType: 'jsonp',
      success: function(data) {
        if (data[2].length > 0 && data[2][0] !== '') {  // Check whether Wikipedia has descriptions
          vm.infowindowWikiDesc(data[2][0]);            // Set infowindow description
        } else {
          vm.infowindowWikiDesc('Wikipedia does not have any description about this spot.');
        }
      }
    }).error(function() {                               // Error listener
      vm.infowindowWikiDesc('There is an error on fetching Wikipedia info.');
    });

    // Requesting images from Flickr
    $.getJSON('https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?', {
      format: 'json',
      tags: spotObject.name
    }, function(data) {
      if (data.items.length > 0) {                      // Check whether Flickr has images
        data.items.forEach(function(photo){             // Loop data to concatenate to flickrStrings variable
          flickrStrings = flickrStrings + '<a class="flick-img-container" target="_blank" href="' + photo.link +'"><img class="flickr-img" src="' + photo.media.m + '"></a>';
        });

        vm.infowindowFlickr(flickrStrings);             // Set infowindow Flickr images section
      } else {
        vm.infowindowFlickr('Flickr does not have images of this spot.')
      }
    }).error(function() {                               // Error listener
      vm.infowindowFlickr('<p>There is something wrong; Flickr could not be loaded</p>');
    });
  };

  /**
   * Creates a new instance of class Spot inside viewModel.
   * @class Represents a spot.
   * @param {object} spotObject A spot object that contains name, location, and type.
   * @param {object} vm A viewModel object that is put to be a closure variable when Spot.marker is clicked
   * @see initializeFunctionalities~viewModel
   */
  var Spot = function(spotObject, vm) {
    /**
     * The name of the spot.
     * @type {string}
     */
    this.name = spotObject.name;

    /**
     * The latitude and longitude position of the spot.
     * @type {object}
     */
    this.position = spotObject.position;

    /**
     * The type of the spot.
     * @type {string}
     */
    this.type = spotObject.type;

    // Different icons for different types of spot
    var icon = {
      'landmark': 'flag_maps.png',
      'park': 'parks_maps.png',
      'mall': 'shopping_maps.png',
      'zoo': 'horsebackriding_maps.png',
      'theme-park': 'arts_maps.png'
    };

    /**
     * The marker object of the spot
     * @type {object}
     */
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

  /**
   * Creates a new instance of class viewModel.
   * @class Represents a viewModel for KnockoutJS binding.
   */
  var viewModel = function() {
    var self = this;

    /**
     * Observable of navigation search input.
     * @type {string}
     * @memberOf initializeFunctionalities~viewModel
     */
    self.query = ko.observable('');

    /**
     * Observable of the selected spot.
     * @type {object}
     * @memberOf initializeFunctionalities~viewModel
     */
    self.selectedSpot = ko.observable(null);

    /**
     * Observable of radio input in the filter section of navigation.
     * @type {string}
     * @memberOf initializeFunctionalities~viewModel
     */
    self.filter = ko.observable('all');

    /**
     * Observable to determine the visibility of the menu.
     * @type {string}
     * @memberOf initializeFunctionalities~viewModel
     */
    self.menuClass = ko.observable('hidden');

    /**
     * Observable to determine infowindow title.
     * @type {string}
     * @memberOf initializeFunctionalities~viewModel
     * @see initializeFunctionalities~viewModel.self.infowindowContent
     */
    self.infowindowTitle = ko.observable('Loading...');

    /**
     * Observable to determine infowindow Flickr section.
     * @type {string}
     * @memberOf initializeFunctionalities~viewModel
     * @see initializeFunctionalities~viewModel.self.infowindowContent
     */
    self.infowindowFlickr = ko.observable('Loading...');

    /**
     * Observable to determine infowindow Wikipedia description.
     * @type {string}
     * @memberOf initializeFunctionalities~viewModel
     * @see initializeFunctionalities~viewModel.self.infowindowContent
     */
    self.infowindowWikiDesc = ko.observable('Loading...');

    /**
     * Computed observable to binding to infowindow content.
     * @type {object}
     * @memberOf initializeFunctionalities~viewModel
     * @see initializeFunctionalities~viewModel.self.infowindowTitle
     * @see initializeFunctionalities~viewModel.self.infowindowFlickr
     * @see initializeFunctionalities~viewModel.self.infowindowWikiDesc
     */
    self.infowindowContent = ko.computed(function() {
      return {
        title: self.infowindowTitle(),
        wikiDesc: self.infowindowWikiDesc(),
        flickrImg: self.infowindowFlickr()
      };
    });

    /**
     * Computed observable to determine possible spots to show in navigation.
     * @type {array}
     * @memberOf initializeFunctionalities~viewModel
     * @see initializeFunctionalities~viewModel.self.spots
     */
    self.jakartaSpots = ko.computed(function() {
      var localStorageCopy = JSON.parse(localStorage.locations);
      var array = [];
      localStorageCopy.forEach(function(spot) {
        array.push(new Spot(spot, self));
      });

      return array;
    });

    /**
     * Computed observable to determine spots to be shown in the list in navigation.
     * @type {string}
     * @memberOf initializeFunctionalities~viewModel
     * @see initializeFunctionalities~viewModel.self.jakartaSpots
     * @see initializeFunctionalities~viewModel.self.query
     * @see initializeFunctionalities~viewModel.self.filter
     */
    self.spots = ko.computed(function() {
      var search = this.query().toLowerCase();      // Search term
      var array = this.filter() === 'all'?          // Produce filtered array based on search term and type of spot checked
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

    /**
     * Function to be called when marker or navigation spot list clicked.
     * @param {object} spotObj Spot object that is clicked.
     * @memberOf initializeFunctionalities~viewModel
     * @see initializeFunctionalities~Spot
     */
    self.infowindowOpen = function(spotObj) {
      infowindowOpen(spotObj, self);
    };

    /**
     * Function to be called when menu icon is clicked to toggle menu.
     * @memberOf initializeFunctionalities~viewModel
     */
    self.toggleMenu = function() {
      self.menuClass(self.menuClass() === ''? 'hidden' : '');
    };

    // Callback to make selectedSpot observable to be null when infowindow is closed
    google.maps.event.addListener(infowindow, 'closeclick', function() {
      self.selectedSpot(null);
    });
  };

  var vmObject = new viewModel();                   // Initialize viewModel object

  // Bind infowindow content to viewModel
  var ifInfowindowLoaded = false;
  google.maps.event.addListener(infowindow, 'domready', function() {
    if (!ifInfowindowLoaded) {
      ko.applyBindings(vmObject, document.getElementById('infowindow-content'));
      ifInfowindowLoaded = true;
    }
  });

  ko.applyBindings(vmObject);                       // Bind viewModel to view
}
