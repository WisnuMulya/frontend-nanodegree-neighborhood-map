'use strict';

$(function() {
  // Variable to center the position of the map at initialization
  var jakarta = {name: "jakarta", position: {lat: -6.2087634, lng: 106.845599}};

  // Spots to be shown in the view
  var jakartaSpots = [
    {name: 'Museum Satria Mandala', position: {lat: -6.231082, lng: 106.819013}, type: 'landmark'},
    {name: 'Taman Suropati', position: {lat: -6.1993382, lng: 106.8324018}, type: 'landmark'},
    {name: 'Gelora Bung Karno', position: {lat: -6.218597, lng: 106.8017673}, type: 'landmark'},
    {name: 'Monumen Nasional', position: {lat: -6.1753924, lng: 106.8271528}, type: 'landmark'},
    {name: 'Kebun Binatang Ragunan', position: {lat: -6.3124593, lng: 106.8201865}, type: 'zoo'},
    {name: 'Taman Menteng', position: {lat: -6.196162999999999, lng: 106.829615}, type: 'landmark'},
    {name: 'Taman Mini Indonesia Indah', position: {lat: -6.302445899999999, lng: 106.8951559}, type: 'theme-park'},
    {name: "Pondok Indah Mall", position: {lat: -6.266409299999999, lng: 106.7836598}, type: 'mall'},
    {name: "Plaza Senayan", position: {lat: -6.2255809, lng: 106.7999552}, type: 'mall'}
  ];

  // Initializing Google Maps
  var map = new google.maps.Map(document.getElementById('map'), {
    center: jakarta.position,
    zoom: 12
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
});
