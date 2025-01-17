spacesXml = "./assets/spaces/spaces.xml";

// Initialize the map
const map = L.map("map");

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors | &copy; Coffebrew",
}).addTo(map);

// Geolocation to get user's current location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            console.log("Browser Geolocation: TRUE");

            // Set the map view to user's current location
            map.setView([userLat, userLng], 15);

            // Define a custom icon
            const customIcon = L.icon({
                iconUrl: "./assets/media/map-pointers/home.png", // URL to your custom marker image
                iconSize: [40, 40], // Size of the icon [width, height]
                iconAnchor: [20, 40], // Anchor point (middle-bottom of the icon)
                popupAnchor: [0, -40], // Position of the popup relative to the icon
            });

            // Add a marker for the user's location
            L.marker([userLat, userLng], { icon: customIcon }).addTo(map).bindPopup("Your Location").openPopup();
        },

        (error) => {
            alert("Unable to retrieve your location. Using default location instead.");
            console.log("Browser Geolocation: FALSE");

            // Set fallback location to Larissa, Greece
            const fallbackLat = 39.640064;
            const fallbackLng = 22.419485;
            // Fallback to a default location
            map.setView([fallbackLat, fallbackLng], 15);
        }
    );
} else {
    alert("Geolocation is not supported by your browser. Using default location instead.");
    console.log("Browser Geolocation: FALSE");

    // Fallback to a default location
    map.setView([fallbackLat, fallbackLng], 15);
}

// Helper function to get query parameters from the URL
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Load spaces from XML file
fetch(spacesXml)
    .then((response) => response.text())
    .then((data) => {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(data, "text/xml");
        generateLocationList(xmlDoc); // Pass the parsed XML to the list generator
        generateMapPoints(xmlDoc); // Pass the parsed XML to the map points generator
    });

function generateMapPoints(xmlDoc) {
    var locations = xmlDoc.getElementsByTagName("location");
    console.log("MAP - Number of locations found:", locations.length);
    var markers = [];

    // Loop through each location and add a marker to the map
    for (var i = 0; i < locations.length; i++) {
        var id = locations[i].getElementsByTagName("id")[0].textContent;
        var name = locations[i].getElementsByTagName("name")[0].textContent;
        var latitude = parseFloat(locations[i].getElementsByTagName("latitude")[0].textContent);
        var longitude = parseFloat(locations[i].getElementsByTagName("longitude")[0].textContent);
        var message = locations[i].getElementsByTagName("message")[0].textContent;
        console.log(`MAP - Processing location: ${id}, ${name}`);

        // Define a custom icon
        const customIcon = L.icon({
            iconUrl: "./assets/media/map-pointers/space.png", // URL to your custom marker image
            iconSize: [40, 40], // Size of the icon [width, height]
            iconAnchor: [20, 40], // Anchor point (middle-bottom of the icon)
            popupAnchor: [0, -40], // Position of the popup relative to the icon
        });

        // Create a marker and add it to the map
        var marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map).bindPopup(message);

        // Store the marker along with its ID for later lookup
        markers[id] = marker;
    }

    // Get the "space" query parameter from the URL
    var spaceId = getQueryParameter("space");

    // If "space" is provided in the URL, open the corresponding popup
    if (spaceId && markers[spaceId]) {
        // Open the popup for the marker with the matching ID
        markers[spaceId].openPopup();
        // Center the map on the marker's location
        map.setView(markers[spaceId].getLatLng(), 17);
    }
}

function generateLocationList(xmlDoc) {
    var locations = xmlDoc.getElementsByTagName("location");
    console.log("LIST - Number of locations found:", locations.length);

    if (locations.length === 0) {
        console.warn("No locations found in the XML file.");
        return;
    }

    var locationsList = document.getElementById("locations-list");

    // Function to generate the list HTML
    function createLocationList(locationsToDisplay, sortBy) {
        locationsList.innerHTML = ''; // Clear previous list
        locationsToDisplay.forEach(location => {
            var id = location.getElementsByTagName("id")[0].textContent;
            var name = location.getElementsByTagName("name")[0].textContent;
            var latitude = parseFloat(location.getElementsByTagName("latitude")[0].textContent);
            var longitude = parseFloat(location.getElementsByTagName("longitude")[0].textContent);
            var rating = parseInt(location.getElementsByTagName("rating")[0].textContent, 10);
            var image = location.getElementsByTagName("image")[0].textContent;
            console.log(`LIST - Processing location: ${id}, ${name}`);


            // Create the main anchor element
            var link = document.createElement("a");
            link.href = `explore.html?space=${id}&sort=${sortBy}`; // Include sort parameter
            link.style.textDecoration = "none";
            link.style.color = "inherit";

            // Create the main row div
            var rowDiv = document.createElement("div");
            rowDiv.className = "row col-element hover-opacity itemlist";

            // Create the image column
            var imgCol = document.createElement("div");
            imgCol.className = "column col-30";
            var imgElement = document.createElement("img");
            imgElement.src = image;
            imgElement.alt = `${name} Image`;
            imgElement.height = 100;
            imgCol.appendChild(imgElement);

            // Create the text column
            var textCol = document.createElement("div");
            textCol.className = "column col-70";

            // Add the name
            var nameElement = document.createElement("h5");
            nameElement.textContent = name;
            textCol.appendChild(nameElement);

            // Add the dynamically calculated distance
            var distanceElement = document.createElement("p");
            distanceElement.textContent = `Distance: ${location.distance.toFixed(2)} km`; // Display distance with 2 decimal places
            textCol.appendChild(distanceElement);

            // Add the rating
            var ratingElement = document.createElement("p");
            ratingElement.textContent = "Rating: ";
            for (let j = 0; j < rating; j++) {
                const solidStar = document.createElement("i");
                solidStar.className = "fa fa-solid fa-star";
                ratingElement.appendChild(solidStar);
            }
            for (let j = rating; j < 5; j++) {
                const regularStar = document.createElement("i");
                regularStar.className = "fa fa-regular fa-star";
                ratingElement.appendChild(regularStar);
            }
            textCol.appendChild(ratingElement);

            // Append the columns to the row
            rowDiv.appendChild(imgCol);
            rowDiv.appendChild(textCol);

            // Append the row to the link
            link.appendChild(rowDiv);

            // Append the link to the locations list container
            locationsList.appendChild(link);
        });
    }

    // Function to sort locations by distance
    function sortByDistance(userLatLng) {
        var locationsArray = Array.from(locations);
        locationsArray.forEach(location => {
            var lat = parseFloat(location.getElementsByTagName("latitude")[0].textContent);
            var lng = parseFloat(location.getElementsByTagName("longitude")[0].textContent);
            var locationLatLng = L.latLng(lat, lng);

            // Calculate the distance (in km) from the user's location
            location.distance = userLatLng.distanceTo(locationLatLng) / 1000; // Convert meters to kilometers
        });

        // Sort locations by calculated distance
        locationsArray.sort(function (a, b) {
            return a.distance - b.distance;
        });

        // Return the sorted list
        createLocationList(locationsArray, 1); // 1 for distance sorting
    }

    // Function to sort locations by rating
    function sortByRating() {
        var locationsArray = Array.from(locations);

        // Sort locations by rating, highest to lowest
        locationsArray.sort(function (a, b) {
            var ratingA = parseInt(a.getElementsByTagName("rating")[0].textContent, 10);
            var ratingB = parseInt(b.getElementsByTagName("rating")[0].textContent, 10);
            return ratingB - ratingA;
        });

        // Return the sorted list
        createLocationList(locationsArray, 2); // 2 for rating sorting
    }

    // Get user's geolocation for sorting by distance
    navigator.geolocation.getCurrentPosition(function (position) {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;
        const userLatLng = L.latLng(userLatitude, userLongitude);

        // Initially sort by distance
        sortByDistance(userLatLng);

        // Event listener for dropdown changes
        document.getElementById("sort-options").addEventListener("change", function (event) {
            if (event.target.value === "distance") {
                sortByDistance(userLatLng);
            } else if (event.target.value === "rating") {
                sortByRating();
            }
        });
    }, function (error) {
        // Fallback if geolocation fails
        alert("Unable to retrieve your location. Using default sorting.");
        sortByRating(); // Default to sorting by rating if geolocation fails
    });
}
