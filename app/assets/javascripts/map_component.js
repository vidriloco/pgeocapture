$.extend({
	isDefined: function(dom) {
		return $(dom).length;
	}
});

var defaultZoom = 14;
var ViewComponents = {};
ViewComponents.Map = function(gMap, opts, callback) {
	var obj = {
		initialize: function(googleMap, opts, callback) {
			this.map = googleMap;
			this.lastMarker = null;
			this.markerList = [];
			this.lineList = [];
			this.lastLine = null;
			this.editable = false;
			this.mode = 'points';
			this.domElementForCoordinates = null;
			
			// Setting options
			this.setMapOptions(opts);
			
			var instance = this;
			// predefined events binding 
			google.maps.event.addListener(this.map, "click", function(event) {
				if(instance.pointsModeEnabled() && instance.isEditable()) {
					instance.propagateClickEvent(event.latLng);
				} 
			});
			
			return this;
		},
		
		setMapOptions: function(opts) {
			
			if(opts != undefined) {
				
				if(opts.isEditable != undefined) {
					this.editable = opts.isEditable;
				}
				
				if(opts.addressDom != undefined) {
					this.domElementForAddress = opts.addressDom;
				}
				
				if(opts.coordinatesDom != undefined) {
					this.domElementForCoordinates = opts.coordinatesDom;
				}
			}
		},
		
		// using the convention for dom_lat and dom_lon retrieve
		// the coordinates components for setting them on the map
		setCoordinatesFromDom: function(coordinates) {
			var latitude = coordinates+"_lat";
			var longitude = coordinates+"_lon";
			if($.isDefined(latitude) && $.isDefined(longitude)) {	
				var lat = $(latitude).val();
				var lon = $(longitude).val();
				
				this.simulatePinPoint(lat, lon, 18);
			}
		},
		
		setCoordinatesFromPair: function(latitude, longitude) {
			this.placeViewportAt({ lat: latitude, lon: longitude });
		},
		
		placeMapOn: function(opts) {
			this.placeViewportAt(opts);
			if(opts.iconName) {
				this.setMarkerOnPosition(this.map.getCenter(), opts.iconName);
			} else {
				this.setMarkerOnPosition(this.map.getCenter());
			}
		},
		
		placeViewportAt: function(opts) {
			if(("lat" in opts) && ("lon" in opts)) {
				this.map.setCenter(new google.maps.LatLng(parseFloat(opts.lat), parseFloat(opts.lon)));
			}

			if("zoom" in opts) {
				this.map.setZoom(opts.zoom);
			}
		},
		
		simulatePinPointSearch: function(opts) {
			this.placeViewportAt(opts);
			this.setSearchMapParams();
		},

		simulatePinPoint: function(lat, lon, zoom) {
			if(zoom != undefined) {
				this.placeViewportAt({zoom : zoom, lat: lat, lon : lon});
			}
			// this blocks mimics what method writePointToDom does
			this.propagateClickEvent(new google.maps.LatLng(lat, lon));
		},
		
		enableSearch: function(baseDom) {
			var instance = this;
			this.southWestDom = baseDom+"_sw";
			this.northEastDom = baseDom+"_ne";
			
			google.maps.event.addListener(this.map, "bounds_changed", function() {
				instance.setSearchMapParams();
				return true;
			});
			// will execute an action only the first time the map loads
			google.maps.event.addListenerOnce(this.map, 'drag', function(event){
			  instance.setSearchMapParams();
				return true; 
			});
		},

		setSearchMapParams: function() {
			var limits = this.map.getBounds();
			var ne = limits.getNorthEast();
			var sw = limits.getSouthWest();

			$(this.southWestDom).val(sw.lat() + "," + sw.lng());
			$(this.northEastDom).val(ne.lat() + "," + ne.lng());
			return true;
		},
		
		propagateClickEvent: function(latLng) {
			this.writeCoordinatesToDom(latLng);
			this.setMarkerOnPosition(latLng);
			this.writeAddressOn(latLng);
		},
		
		setMarkerOnPosition: function(latLng, iconName) {
			var marker = this.lastMarker;

			if(marker != null) {
				marker.setMap(null);
			} 
			
			var opts = { position: latLng, map: this.map };
			if(iconName) {
				opts = $.extend(opts, {icon: $.assetsURL+iconName+'.png'});
			}
			
			marker = new google.maps.Marker(opts);
			this.lastMarker = marker;
		},
		
		writeCoordinatesToDom: function(latLng) {
			$(this.domElementForCoordinates+"_lat").val(latLng.lat());
			$(this.domElementForCoordinates+"_lon").val(latLng.lng());
		},
		
		writeAddressOn: function(latLng) {
			if(this.domElementForAddress) {
				var geocoder = new google.maps.Geocoder();
				var instance = this;

				geocoder.geocode({'location': latLng}, function(results, status) {        
					if (status == google.maps.GeocoderStatus.OK) {
						var address = results[0].formatted_address;
						$(instance.domElementForAddress).html(""+address+"");
					} 
				});
			}
		},
		
		addCoordinatesAsMarkerToList: function(opts, callback) {
			if(opts.lat=="" || opts.lon=="") {
				return false;
			}

			var map = this.map;
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(opts.lat, opts.lon),
				map: map,
				icon: $.assetsURL+opts.iconName+'.png'
			});

			google.maps.event.addListener(marker, 'click', function() {
				callback(opts.resourceUrl);
			});
			this.markerList.push(marker);
		},

		resetMarkersList: function() {
			var markers = this.markerList;
			if (markers) {
				for (i in markers) {
					markers[i].setMap(null);
				}
			}
		},
		
		reset: function() {
			this.resetMarkersList();
			if(this.lastMarker != null) {
				this.lastMarker.setMap(null);
			}
			this.lastMarker = null;
			
			this.setEditable(false);
			this.placeViewportAt({zoom: defaultZoom });
		},
		
		isEditable: function() {
			return this.editable;
		},

		setEditable: function(status) {
			this.editable = status;
		},
		
		setLinesModeOn: function() {
			this.mode = 'lines';
		},
		
		setPointsModeOn: function() {
			this.mode = 'points';
		},
		
		pointsModeEnabled: function() {
			return this.mode == 'points';
		},
		
		linesModeEnabled: function() {
			return this.mode == 'lines';
		}
	}
	return obj.initialize(gMap, opts, callback);
}