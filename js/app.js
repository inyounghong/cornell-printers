//Angular App Module and Controller
var sampleApp = angular.module('mapsApp', []);
sampleApp.controller('MapCtrl', function ($scope, $http) {

  $scope.selected_color = 'BW';
  $scope.active_prices = [8, 9, 10, 25];

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

    $http.get("js/prices.json").success(function(data) {
      $scope.price_list = data;
      updatePrices();
    });

    function updatePrices(){
      $scope.prices = $scope.price_list[0][$scope.selected_color];
    }


    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(42.447909,-76.477998),
    }


  

  $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
  $scope.markers = [];

  $scope.priceFilter = $scope.selected_color;
  
  var infoWindow = new google.maps.InfoWindow();
  
  var createMarker = function (printer){
      var marker = new google.maps.Marker({
          map: null,
          position: new google.maps.LatLng(printer.lat, printer.lon),
          title: "title",
          info: printer
      });

      marker.content = '<div class="infoWindowContent">' + printer.desc + '</div>';
      
      google.maps.event.addListener(marker, 'click', function(){
        var str = '<div class="title">' + printer.id + '</div>';
        str += '<p>' + printer.name + '</p>';
        str += '<p>' + printer.cents + ' cents | ' + printer.color + '</p>';
        str += '<p>' + printer.duplex + '</p>';
          infoWindow.setContent(str);
          infoWindow.open($scope.map, marker);
      });
      
      $scope.markers.push(marker);
      
  }  

  $scope.openInfoWindow = function(e, selectedMarker){
      e.preventDefault();
      google.maps.event.trigger(selectedMarker, 'click');
  }

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

  $scope.hideMarkers = function() {
    for (var i = 0; i < $scope.markers.length; i++){
        $scope.markers[i].setMap(null);
    }
  };

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
      if (list[i] == item || (item >= 30 && list[i] == 30)){
        return true;
      }
    }
  }

  // Returns > for 30 price button
  $scope.get30 = function(price){
    if (price == 30) return ">";
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