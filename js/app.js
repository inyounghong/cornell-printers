//Angular App Module and Controller
var app = angular.module('mapsApp', []);
app.controller('MapCtrl', function ($scope, $http) {

  // Selected options
  $scope.NYFilter = {"location":'!ny'};
  $scope.selected_color = 'BW';
  $scope.active_prices = [8, 9, 10, 25];
  $scope.priceFilter = $scope.selected_color;

  $scope.markers = [];

  // Get printer data
  $http.get("js/printers.json").success(function(data) {
      var printer = data;
      $scope.printers = data;
      for (i = 0; i < printer.length; i++){
          createMarker(printer[i]);

      }
      
      // Show
      showMarkers();
  });

  // Get price data
  $http.get("js/prices.json").success(function(data) {
    $scope.price_list = data;
    updatePrices();
  });

  // Establish map options
  var mapOptions = {
      zoom: 16,
      center: new google.maps.LatLng(42.449,-76.483),
  }

  $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
  navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        });

  var infoWindow = new google.maps.InfoWindow();
  
  // Creates markers and adds to markers list
  var createMarker = function (printer){
      var marker = new google.maps.Marker({
          map: null,
          position: new google.maps.LatLng(printer.lat, printer.lon),
          title: "title",
          info: printer
      });

      marker.content = '<div class="infoWindowContent">' + printer.desc + '</div>';
      
      google.maps.event.addListener(marker, 'click', function(){
        var str = '<div class="title">' + getImage(printer.color) + printer.id + '</div>';
        str += '<p>' + printer.name + '</p>';
        str += '<p><b>' + printer.cents + ' cents</b> - ' + printer.color + ' - ';
        str += printer.duplex + ' - ' + printer.dpi + ' dpi</p>';
          infoWindow.setContent(str);
          infoWindow.open($scope.map, marker);
      });
      
      $scope.markers.push(marker);
  }  

  $scope.openInfoWindow = function(e, selectedMarker){
      e.preventDefault();
      google.maps.event.trigger(selectedMarker, 'click');
  }


  // Get b/w or color icon
  function getImage(color){
    if(color == "BW"){
      return '<img src="img/drop.png">';
    }
    return '<img src="img/drop-color.png">';
  }

  // Updates the list of prices
  function updatePrices(){
    $scope.prices = $scope.price_list[0][$scope.selected_color];
  }

  // Returns true if marker matches selected color
  function matchColor(marker){
    return (marker.info.color == $scope.selected_color);
  }

  function matchPrice(marker){
    return isInList(marker.info.cents, $scope.active_prices);
  }

  // Filters and displays markers
  function showMarkers() {
    for (var i = 0; i < $scope.markers.length; i++){
      var marker = $scope.markers[i];
      if (matchColor(marker) && matchPrice(marker)){
        marker.setMap($scope.map);
      } else {
        marker.setMap(null);
      }
    }
  }


  $scope.isActiveColor = function(color){
    if ($scope.selected_color == color){
      return "color active";
    }
    return "color";
  }

  $scope.setActiveColor = function(color){
    $scope.selected_color = color;
    showMarkers();
    updatePrices();
  }

  $scope.isActivePrice = function(cents){
    if (isInList(cents, $scope.active_prices)){
      return "price active";
    }
    return "price";
  }



  $scope.setActivePrice = function(cents){
    // Remove if already in list
    if (isInList(cents, $scope.active_prices)){
      var index = $scope.active_prices.indexOf(cents);
      $scope.active_prices.splice(index, 1);
    } 
    else {
      // Add to list
      $scope.active_prices.push(cents);
    }
    showMarkers();
  }

  // Returns true if item is in list
  function isInList(item, list){
    for (var i = 0; i < list.length; i++){
      if (list[i] == item || (item >= 30 && list[i] == 30) || (item <= 8 && list[i] == 8)){
        return true;
      }
    }
  }

  // Returns > for 30 price button
  $scope.get30 = function(price){
    if (price == 30) return ">";
    if (price == 8) return "<";
  }


  $scope.setNYFilter = function(str){
    $scope.NYFilter = {"location":str};
  }

  $scope.isActiveLocation = function(str){
    if ($scope.NYFilter.location == str){
      return "location active";
    }
    return "location";
  }

  // Table filtering

  $scope.orderByField = 'id';
  $scope.reverseSort = false;

  $scope.order = function(field){
    if (field == $scope.orderByField){
      $scope.reverseSort = !$scope.reverseSort;
    }
    $scope.orderByField = field;

  }

  $scope.activeOrder = function(field){
    if ($scope.orderByField == field){
      return "active-field";
    }
  }

});