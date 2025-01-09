function initMap() {
    // Create a map centered on a specific location
    var map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 40.748817, lng: -73.985428 }, // Example: New York City
      zoom: 12,
    });
  
    // Add locations (places) data
    var locations = [
      { 
        name: 'Place 1', 
        lat: 40.748817, 
        lng: -73.985428, 
        photo: 'https://via.placeholder.com/200', 
        rating: 5, 
        description: 'Great place to stay!' 
      },
      { 
        name: 'Place 2', 
        lat: 40.758817, 
        lng: -73.975428, 
        photo: 'https://via.placeholder.com/200', 
        rating: 4, 
        description: 'Perfect for a short stay.' 
      },
      { 
        name: 'Place 3', 
        lat: 40.768817, 
        lng: -73.965428, 
        photo: 'https://via.placeholder.com/200', 
        rating: 4.5, 
        description: 'Lovely neighborhood.' 
      },
      { 
        name: 'Place 4', 
        lat: 40.778817, 
        lng: -73.955428, 
        photo: 'https://via.placeholder.com/200', 
        rating: 4.8, 
        description: 'Close to main attractions.' 
      },
      { 
        name: 'Place 5', 
        lat: 40.788817, 
        lng: -73.945428, 
        photo: 'https://via.placeholder.com/200', 
        rating: 5, 
        description: 'Ideal for families.' 
      }
    ];
  
    // User's current location (to calculate distance from)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var userLat = position.coords.latitude;
        var userLng = position.coords.longitude;
  
        // Loop through locations and add them to the map
        locations.forEach(function(place) {
          var placeLatLng = new google.maps.LatLng(place.lat, place.lng);
  
          var marker = new google.maps.Marker({
            position: placeLatLng,
            map: map,
            title: place.name
          });
  
          // Calculate the distance from the user's location to the place
          var userLocation = new google.maps.LatLng(userLat, userLng);
          var distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, placeLatLng) / 1000; // Distance in km
  
          // Add the place to the list with distance, photo, and rating
          var listItem = document.createElement('li');
          listItem.innerHTML = `
            <h3>${place.name}</h3>
            <img src="${place.photo}" alt="${place.name}">
            <p class="distance">Distance: ${distance.toFixed(2)} km away</p>
            <p class="rating">Rating: ${'★'.repeat(place.rating)} ${place.rating}</p>
            <p>${place.description}</p>
          `;
          document.getElementById('places-container').appendChild(listItem);
        });
      });
    }
  }
  