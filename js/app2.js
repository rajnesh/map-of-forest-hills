var map;    // declares a global map variable
var panorama; // declares a global panorama variable

var mapCenter = { lat: 40.722259, lng: -73.844046}; //latitude/longtitude of Forest Hills, NY (Hometown of Simon & Garfunkle)
var mapZoom = 16;
var mapBounds = new google.maps.LatLngBounds(new google.maps.LatLng(40.7201004, -73.8472659), new google.maps.LatLng(40.7205189, -73.8429087));
var sv = new google.maps.StreetViewService();

var markerInvisibleClass = "list-group-item";
var markerVisibleClass = "list-group-item list-group-item-success";
var markerStreetViewClass = "list-group-item list-group-item-info"
var locIndex = 0;

var allLocations = [
  {
    name: "West Side Tennis Club",
    lat: 40.719708,
    lang: -73.847805,
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "Our Lady Queen of Martyrs Chruch",
    lat: 40.719330,
    lang: -73.840482,
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "Nick's Pizza",
    lat: 40.718004,
    lang: -73.840509,
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "Martha's Country Bakery",
    lat: 40.720363,
    lang: -73.846067,
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "Forest Hills Stadium",
    lat: 40.719635,
    lang: -73.848888,
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "The Billiard Company",
    lat: 40.720537,
    lang: -73.845214,
    marker: {},
    svData: {},
    svStatus: {}
  },
  {
    name: "A J Pizza",
    lat: 40.719801,
    lang: -73.843293,
    marker: {},
    svData: {},
    svStatus: {}
  }
];
  

var initializeMap = function() {
  var mapOptions = {
    center: mapCenter,
    zoom: 16,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));
  
  
  var input = document.getElementById('pac-input');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  var ListViewDiv = document.getElementById('place-list');
  map.controls[google.maps.ControlPosition.LEFT_CENTER].push(ListViewDiv);
  
  for (var i = 0; i < allLocations.length; i++) {
    var marker = new google.maps.Marker({
      map: map,
      position: new google.maps.LatLng(allLocations[i].lat, allLocations[i].lang),
      title: allLocations[i].name
    });
    allLocations[i].marker = marker;
    
  }
};

function streetViewCallback(data, status) {
  allLocations[locIndex].svData = data;
  allLocations[locIndex].svStatus = status;
  }
  
/*
function streetViewCallback(data, status) {
  if (status == google.maps.StreetViewStatus.OK) {
    panorama.setPano(data.location.pano);
    panorama.setPov({
      heading: 270,
      pitch: 0
    });
    panorama.setVisible(true);

    google.maps.event.addListener(marker, 'click', function() {

      var markerPanoID = data.location.pano;
      // Set the Pano to use the passed panoID
      panorama.setPano(markerPanoID);
      panorama.setPov({
        heading: 270,
        pitch: 0
      });
      panorama.setVisible(true);
    });
  } else {
    alert('Street View data not found for this location.');
  }
}*/

var ViewModel = function() {
  var self = this;
  var Location = function(data) {
    this.name = ko.observable(data.name);
    this.liClass = ko.observable(markerVisibleClass);
    this.visibleMarker = ko.observable("true");
    this.index = ko.observable(locIndex);
  };
  
  self.locationList = ko.observableArray([]);
  allLocations.forEach(function(aLocation) {
    self.locationList.push(new Location(aLocation));
    sv.getPanoramaByLocation(new google.maps.LatLng(allLocations[locIndex].lat, allLocations[locIndex].lang), 100, streetViewCallback);
    locIndex++;
  });
  
  self.searchTerm = ko.observable("");
  self.onEnter = function(data,element) {
    var st = data.searchTerm();
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
   
  this.setLocation = function(clickedLocation) {
    if(clickedLocation.visibleMarker() === "false") {
      showLocation(clickedLocation,clickedLocation.index());
    }
    else {
     hideLocation(clickedLocation,clickedLocation.index());
    }
  }; 
  
  var showLocation = function(setLocation,i) {
      setLocation.liClass(markerVisibleClass);
      allLocations[i].marker.setVisible(true);
      setLocation.visibleMarker("true");
  };
  
  var hideLocation = function(setLocation,i) {
      setLocation.liClass(markerInvisibleClass);
      allLocations[i].marker.setVisible(false);
      setLocation.visibleMarker("false");
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

ko.applyBindings(new ViewModel());

// Calls the initializeMap() function when the page loads
window.addEventListener('load', initializeMap);

window.addEventListener('resize', function(e) {
 map.fitBounds(mapBounds);
});

