$(document).ready(function() {
	var mapOptions = {
		center: new google.maps.LatLng(parseFloat(19.322721), parseFloat(-99.184570)),
		zoom: defaultZoom,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		streetViewControl: true,
		mapTypeControl: false,
		navigationControl: false,
		navigationControlOptions: {
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		zoomControlOptions: { style: google.maps.ZoomControlStyle.SMALL }
	};
	
	var map = null;
	
	var mapDom = $('#map');
	if(mapDom.length > 0) {
		map = new ViewComponents.Map(new google.maps.Map(document.getElementById("map"), mapOptions), {coordinatesDom: "#coordinates"});
		
		if(mapDom.hasClass('edit')) {
			map.setEditable(true);
			map.setCoordinatesFromDom("#coordinates");
		}
		
		if(mapDom.hasClass('show-only')) {
			map.simulatePinPoint($('#place').attr('lat'), $('#place').attr('lon'), 18);
		}
	} 
	
	$('.place-on-list').bind('click', function() {
		var lat = $(this).attr('lat');
		var lon = $(this).attr('lon');
		if(map != null) {
			$('.place-list').children().removeClass('active');
			map.placeMapOn({ lat : lat, lon : lon, zoom : 16 });
			$(this).addClass('active');
		}
	});
	
	/*$('.place-list').bind('mouseleave', function() {
		if(map != null) {
			map.reset();
		}
	});*/
});