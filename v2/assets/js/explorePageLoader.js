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

    // Get the user's current location
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const userLatitude = position.coords.latitude;
            const userLongitude = position.coords.longitude;
            const userLatLng = L.latLng(userLatitude, userLongitude);

            // Loop through each location and create the corresponding HTML element
            for (var i = 0; i < locations.length; i++) {
                // Safely retrieve each field and handle missing elements
                var id = locations[i].getElementsByTagName("id")[0].textContent;
                var name = locations[i].getElementsByTagName("name")[0].textContent;
                var latitude = parseFloat(locations[i].getElementsByTagName("latitude")[0].textContent);
                var longitude = parseFloat(locations[i].getElementsByTagName("longitude")[0].textContent);
                var rating = parseInt(locations[i].getElementsByTagName("rating")[0].textContent, 10);
                var image = locations[i].getElementsByTagName("image")[0].textContent;
                console.log(`LIST - Processing location: ${id}, ${name}`);

                // Create LatLng object for the location
                const locationLatLng = L.latLng(latitude, longitude);

                // Calculate the distance from the user's location (in km)
                const distance = userLatLng.distanceTo(locationLatLng) / 1000; // Convert meters to kilometers

                // Create the main anchor element
                var link = document.createElement("a");
                link.href = `?space=${id}`;
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
                distanceElement.textContent = `Distance: ${distance.toFixed(2)} km`; // Display distance with 2 decimal places
                textCol.appendChild(distanceElement);

                // Add the rating
                var ratingElement = document.createElement("p");
                ratingElement.textContent = "Rating: ";
                // Add solid stars (for the given rating)
                for (let j = 0; j < rating; j++) {
                    const solidStar = document.createElement("i");
                    solidStar.className = "fa fa-solid fa-star";
                    ratingElement.appendChild(solidStar);
                }

                // Add regular stars (to make up the remaining up to 5)
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
            }
        },
        function (error) {
            // If geolocation fails, set distance to "Unknown" for all locations

            // Loop through each location and create the corresponding HTML element
            for (var i = 0; i < locations.length; i++) {
                // Safely retrieve each field and handle missing elements
                var id = locations[i].getElementsByTagName("id")[0].textContent;
                var name = locations[i].getElementsByTagName("name")[0].textContent;
                var latitude = parseFloat(locations[i].getElementsByTagName("latitude")[0].textContent);
                var longitude = parseFloat(locations[i].getElementsByTagName("longitude")[0].textContent);
                var rating = parseInt(locations[i].getElementsByTagName("rating")[0].textContent, 10);
                var image = locations[i].getElementsByTagName("image")[0].textContent;
                console.log(`LIST - Processing location: ${id}, ${name}`);

                // Create the main anchor element
                var link = document.createElement("a");
                link.href = `?space=${id}`;
                link.style.textDecoration = "none";
                link.style.color = "inherit";

                // Create the main row div
                var rowDiv = document.createElement("div");
                rowDiv.className = "row col-element hover-opacity itemlist column";

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
                distanceElement.textContent = `Distance: Unknown`;
                textCol.appendChild(distanceElement);

                // Add the rating
                var ratingElement = document.createElement("p");
                ratingElement.textContent = "Rating: ";
                // Add solid stars (for the given rating)
                for (let j = 0; j < rating; j++) {
                    const solidStar = document.createElement("i");
                    solidStar.className = "fa fa-solid fa-star";
                    ratingElement.appendChild(solidStar);
                }

                // Add regular stars (to make up the remaining up to 5)
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
            }
        }
    );
}
