var map;    // declares a global google map variable
var panorama; // declares a global google panorama variable
var sv; //declares global google street view service variable
var infowindow; //declares global google infowindow variable
var ps; //declares global google place service variable

var mapCenter = { lat: 40.720259, lng: -73.844046}; //latitude/longtitude of Forest Hills, NY (Hometown of Simon & Garfunkle)
var mapSouthWestBounds = { lat: 40.7200004, lng: -73.8472659};
var mapNorthEastBounds = { lat: 40.7205189, lng: -73.8429087};
var mapZoom = 14; //starting zoom level
var mapBounds; 

var svRadius = 50; //search radius for street view

//bootstrap classes for li items
var markerInvisibleClass = "list-group-item";
var markerVisibleClass = "list-group-item list-group-item-success";
var markerStreetViewClass = "list-group-item list-group-item-info";

var locStates = ["white", "green", "blue"]; //color states for li items
var locIndex = 0; //the index of the location array whose street view is being shown

//Name and position of all locations on the map. 
//Each location also has a marker object and data for its streetview
//data is stored once fetched so that its fetched just once per location per pageload
var allLocations = [
  {
    name: "The Church in the Gardens",
    lat: 40.716362,
    lang: -73.841604,
    placeID: "ChIJx2i74J9gwokRFpS2M7AjCLs",
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "Our Lady Queen of Martyrs Church",
    lat: 40.719330,
    lang: -73.840482,
    placeID: "ChIJXWJBLplgwokR5ysJNStyewY",
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "Nick's Pizza",
    lat: 40.718006,
    lang: -73.84051,
    placeID: "ChIJUQL7Np5gwokRNuZjIxhNGU8",
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "Martha's Country Bakery",
    lat: 40.720363,
    lang: -73.846067,
    placeID: "ChIJr3n5MyFewokRT9dhgQhY86c",
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "Queens Library",
    lat: 40.722085,
    lang: -73.843034,
    placeID: "ChIJ92MKbidewokR1x9MtgbBjLA",
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "The Billiard Company",
    lat: 40.720537,
    lang: -73.845214,
    placeID: "ChIJb-tJLCFewokRcOzS32tpHuw",
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "A J Pizza",
    lat: 40.719801,
    lang: -73.843293,
    placeID: "ChIJ2euUtyBewokRpDdRMGgmKRs",
    marker: {},
    svData: {},
    svStatus: {}
  }
];

//called to initialize the map as soon as the page loads
var initializeMap = function() {
  var mapOptions = {
    center: mapCenter,
    zoom: 16,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false
  };
  
  //set the google variables for map, street view and panorama
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  sv = new google.maps.StreetViewService();
  panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));
  mapBounds = new google.maps.LatLngBounds(new google.maps.LatLng(mapSouthWestBounds.lat, mapSouthWestBounds.lng), new google.maps.LatLng(mapNorthEastBounds.lat, mapNorthEastBounds.lng));
  infowindow = new google.maps.InfoWindow();
  ps = new google.maps.places.PlacesService(map);

  
  //adds the search box and the list group to the map (along with its toggle switch)
  var input = document.getElementById('pac-input');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  var ListToggleDiv = document.getElementById('list-toggle');
  map.controls[google.maps.ControlPosition.LEFT_CENTER].push(ListToggleDiv);
  var ListViewDiv = document.getElementById('place-list');
  map.controls[google.maps.ControlPosition.LEFT_CENTER].push(ListViewDiv);
  
  //creates the marker for each location
  for (var i = 0; i < allLocations.length; i++) {
    var marker = new google.maps.Marker({
      map: map,
      position: new google.maps.LatLng(allLocations[i].lat, allLocations[i].lang),
      title: allLocations[i].name,
      opacity: 0.50
    });
    marker.setVisible(true);
    allLocations[i].marker = marker;
    
    //Event listner for markers. 
    //Since inside a loop, added closure to listen for the right marker
    google.maps.event.addListener(marker, 'click', function(m) {
      return function() {
        for (j = 0; j < allLocations.length; j++ ) {
          if (allLocations[j].marker == m) { 
            locIndex = j;
            m.setOpacity(1);
            vm.locationList()[j].liClass(markerStreetViewClass);
            var request = { 
              placeId: allLocations[j].placeID
            };
            ps.getDetails(request, function(place, status) {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + place.formatted_address + '<br> Phone:' + place.formatted_phone_number + '<br> Website:' + place.website);
                infowindow.open(map, m);
              }
            });
          }
          else {
            allLocations[j].marker.setOpacity(0.5);
            if (allLocations[j].marker.getVisible()) {
              vm.locationList()[j].liClass(markerVisibleClass);
            }
          }
        }
        //sv.getPanoramaByLocation(m.getPosition(), svRadius, streetViewCallback);
        if (jQuery.isEmptyObject(allLocations[locIndex].svData)) {   
          sv.getPanoramaByLocation(m.getPosition(), svRadius, streetViewCallback);
        }
        else {
          showPanorama(locIndex);
        }
      }
    }(marker));
  }
  window.addEventListener('resize', function(e) {
    map.fitBounds(mapBounds);
  });
};

//callback function for Google's Street View API
var streetViewCallback = function(data, status) {
  allLocations[locIndex].svData = data;
  allLocations[locIndex].svStatus = status;
  showPanorama(locIndex);
};

//When called, shows the actual street view panorama
var showPanorama = function(i) {
  if (allLocations[i].svStatus === "OK") {
    panorama.setPano(allLocations[i].svData.location.pano);
    panorama.setPov({
      heading: 270,
      pitch: 0
    });
    panorama.setVisible(true);
  } 
  else {
    alert('Street View data not found for this location.');
  }
}; 

var ViewModel = function() {
  var self = this;
  
  //creates a Location object holding knockout observable variables
  var Location = function(data) {
    this.name = ko.observable(data.name);
    this.liClass = ko.observable(markerVisibleClass);
    this.index = ko.observable(locIndex);
    this.state = ko.observable(locStates[1]);
  };
  
  //locationList observable array will be created to hold each location
  self.locationList = ko.observableArray([]);
  allLocations.forEach(function(aLocation) {
    self.locationList.push(new Location(aLocation));
    locIndex++;
  });
  
  //the value in the search box
  self.searchTerm = ko.observable("");
  
  //Bindings for toggling visibility of the list and street view
  self.toggleText = ko.observable("Hide List and Street View");
  self.showList = ko.observable(true);
  
  //Knockout bound to toggle li click
  self.setToggle = function() {
    self.showList(!self.showList());
    self.showList() ? self.toggleText("Hide List and Street View") : self.toggleText("Show List and Street View");
  };
  
  //Handles the click event on the search box
  self.onEnter = function(data,element) {
    var st = data.searchTerm();
    panorama.setVisible(false);
    infowindow.close();
    if (st.length === 0) {
      for (var i = 0; i < this.locationList().length; i++) {
        showLocation(this.locationList()[i],i);
      }
      return;
    } 
    for (i = 0; i < allLocations.length; i++) {
      if(allLocations[i].name.toLowerCase().search(st.toLowerCase()) !== -1 ) {
        showLocation(this.locationList()[i],i);
      }
      else {
        hideLocation(this.locationList()[i],i);
      }
    }
  };
  
 
  //Knockout bound to the li click event
  this.setLocation = function(clickedLocation) {
    var index = clickedLocation.index();
    if(clickedLocation.state() !== locStates[2]) {
      infowindow.close();
      showClickedLocation(clickedLocation,index,locIndex);
      locIndex = index;
      if (jQuery.isEmptyObject(allLocations[index].svData)) {   
        sv.getPanoramaByLocation(new google.maps.LatLng(allLocations[index].lat, allLocations[index].lang), svRadius, streetViewCallback);
      }
      else {
        showPanorama(index);
      }
    }
  }; 
  
  //sets attributes for observables and marker when an li is clicked
  var showClickedLocation = function(setLocation,i,oldi) {
    setLocation.state(locStates[2]);
    setLocation.liClass(markerStreetViewClass);
    allLocations[i].marker.setVisible(true);
    allLocations[i].marker.setOpacity(1);
    if (oldi < allLocations.length) {
      allLocations[oldi].marker.setOpacity(0.50);
      if (allLocations[oldi].marker.getVisible()) {
        self.locationList()[oldi].liClass(markerVisibleClass);
        self.locationList()[oldi].state(locStates[1]);
      }
    }
  };
  
  //sets attributes when showing marker
  var showLocation = function(setLocation,i) {
    setLocation.liClass(markerVisibleClass);
    allLocations[i].marker.setVisible(true);
    setLocation.state(locStates[1]);
    allLocations[i].marker.setOpacity(0.5);
  };
  
   //sets attributes when hiding marker (when not part of search filter)
  var hideLocation = function(setLocation,i) {
    setLocation.liClass(markerInvisibleClass);
    allLocations[i].marker.setOpacity(0.5);
    setLocation.state(locStates[0]);
    allLocations[i].marker.setVisible(false);
  }; 
};

//KO custom binding for <enter> keypress event 
ko.bindingHandlers.enterKey = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    ko.utils.registerEventHandler(element, "keyup", function(event) {
      if (event.keyCode === 13) {
        ko.utils.triggerEvent(element, "change");
        valueAccessor().call(viewModel, viewModel);
      }
      return true;
    });
  }         
};

vm = new ViewModel();
ko.applyBindings(vm);

function loadScript() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  
  //alert user if cannot access Google Maps
  script.onerror = function(event) {
    alert("Unable to load Google Maps");
  };
  //calls back Initialize
  script.src = "https://maps.googleapis.com/maps/api/js?v=3.19&libraries=places&key=AIzaSyCcFrjytFjVdtG47x1LAkQBm3m5asqdVRw&callback=initializeMap";
  document.body.appendChild(script);
}

// Load script for Google Maps when the page loads
window.addEventListener('load', loadScript);