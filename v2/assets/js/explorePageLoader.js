// Define file paths and constants
const spacesXml = "./assets/spaces/spaces.xml";
const map = L.map("map"); // Initialize the map

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors | &copy; Coffebrew",
}).addTo(map);

// Fallback location coordinates
const fallbackLat = 39.640064;
const fallbackLng = 22.419485;

// Helper function to get query parameters from the URL
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Geolocation logic for user's current location
function setGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                console.log("Browser Geolocation: TRUE");
                map.setView([userLat, userLng], 15);
                addUserLocationMarker(userLat, userLng);
            },
            () => {
                console.log("Browser Geolocation: FALSE");
                alert("Unable to retrieve your location. Using default location instead.");
                map.setView([fallbackLat, fallbackLng], 15);
            }
        );
    } else {
        console.log("Browser Geolocation: FALSE");
        alert("Geolocation is not supported by your browser. Using default location instead.");
        map.setView([fallbackLat, fallbackLng], 15);
    }
}

// Add a custom marker for the user's location
function addUserLocationMarker(userLat, userLng) {
    const customIcon = L.icon({
        iconUrl: "./assets/media/map-pointers/home.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });

    L.marker([userLat, userLng], { icon: customIcon }).addTo(map).bindPopup("Your Location").openPopup();
}

// Load and parse XML file for spaces
function loadSpacesData() {
    fetch(spacesXml)
        .then((response) => response.text())
        .then((data) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            generateLocationList(xmlDoc);
            generateMapPoints(xmlDoc);
        });
}

// Generate map markers for all spaces
function generateMapPoints(xmlDoc) {
    const spaces = xmlDoc.getElementsByTagName("space");
    const markers = [];

    for (let i = 0; i < spaces.length; i++) {
        const space = spaces[i];
        const id = space.getElementsByTagName("id")[0].textContent;
        const name = space.getElementsByTagName("name")[0].textContent;
        const latitude = parseFloat(space.getElementsByTagName("latitude")[0].textContent);
        const longitude = parseFloat(space.getElementsByTagName("longitude")[0].textContent);
        const gmap_url = space.getElementsByTagName("gmap-url")[0].textContent;
        const gmap_id = space.getElementsByTagName("gmap-id")[0].textContent;
        const image = space.getElementsByTagName("image")[0].textContent;

        console.log(`MAP - Processing space: ${id}, ${name}`);

        const customIcon = L.icon({
            iconUrl: "./assets/media/map-pointers/space.png",
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
        });

        const message = `
            <div id="map-popup">
                <h5>${name}</h5>
                <p>
                    <a href="./space/${id}.html" style="color: #fafafa;">More Information</a>
                    <a href="https://maps.app.goo.gl/${gmap_id}" style="color: #fafafa;">Get directions</a>
                    <img src="${image}" alt="${name} Image">
                </p>
            </div>
        `;
        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map).bindPopup(message);
        markers[id] = marker;
    }

    const spaceId = getQueryParameter("space");
    if (spaceId && markers[spaceId]) {
        markers[spaceId].openPopup();
        map.setView(markers[spaceId].getLatLng(), 17);
    }
}

// Generate location list for display
function generateLocationList(xmlDoc) {
    const spaces = xmlDoc.getElementsByTagName("space");
    const spacesList = document.getElementById("locations-list");
    const sortDropdown = document.getElementById("sort-options");

    if (spaces.length === 0) {
        console.warn("No spaces found in the XML file.");
        return;
    }

    function createLocationList(spacesToDisplay, sortBy) {
        spacesList.innerHTML = "";
        spacesToDisplay.forEach((space) => {
            const id = space.getElementsByTagName("id")[0].textContent;
            const name = space.getElementsByTagName("name")[0].textContent;
            const image = space.getElementsByTagName("image")[0].textContent;
            const rating = parseInt(space.getElementsByTagName("rating")[0].textContent, 10);
            const distance = space.distance !== undefined ? space.distance.toFixed(2) : "N/A";

            const link = document.createElement("a");
            link.href = `explore.html?space=${id}&sort=${sortBy}`;
            link.style.textDecoration = "none";
            link.style.color = "inherit";

            const rowDiv = document.createElement("div");
            rowDiv.className = "row col-element hover-opacity itemlist";

            const imgCol = document.createElement("div");
            imgCol.className = "column col-30";
            const imgElement = document.createElement("img");
            imgElement.src = image;
            imgElement.alt = `${name} Image`;
            imgElement.height = 100;
            imgCol.appendChild(imgElement);

            const textCol = document.createElement("div");
            textCol.className = "column col-70";

            const nameElement = document.createElement("h5");
            nameElement.textContent = name;
            textCol.appendChild(nameElement);

            const distanceElement = document.createElement("p");
            distanceElement.textContent = `Distance: ${distance} km`;
            textCol.appendChild(distanceElement);

            const ratingElement = document.createElement("p");
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

            rowDiv.appendChild(imgCol);
            rowDiv.appendChild(textCol);
            link.appendChild(rowDiv);
            spacesList.appendChild(link);
        });
    }

    function calculateDistances(userLatLng) {
        Array.from(spaces).forEach((space) => {
            const lat = parseFloat(space.getElementsByTagName("latitude")[0].textContent);
            const lng = parseFloat(space.getElementsByTagName("longitude")[0].textContent);
            const locationLatLng = L.latLng(lat, lng);
            space.distance = userLatLng.distanceTo(locationLatLng) / 1000;
        });
    }

    function sortByDistance(userLatLng) {
        calculateDistances(userLatLng);
        const spacesArray = Array.from(spaces);
        spacesArray.sort((a, b) => a.distance - b.distance);
        createLocationList(spacesArray, 1);
    }

    function sortByRating() {
        const spacesArray = Array.from(spaces);
        spacesArray.sort((a, b) => {
            const ratingA = parseInt(a.getElementsByTagName("rating")[0].textContent, 10);
            const ratingB = parseInt(b.getElementsByTagName("rating")[0].textContent, 10);
            return ratingB - ratingA;
        });
        createLocationList(spacesArray, 2);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get("sort");
    if (sortParam === "1") {
        sortDropdown.value = "distance";
    } else if (sortParam === "2") {
        sortDropdown.value = "rating";
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLatitude = position.coords.latitude;
            const userLongitude = position.coords.longitude;
            const userLatLng = L.latLng(userLatitude, userLongitude);

            calculateDistances(userLatLng);

            if (sortParam === "1") {
                sortByDistance(userLatLng);
            } else if (sortParam === "2") {
                sortByRating();
            } else {
                sortByDistance(userLatLng);
            }

            sortDropdown.addEventListener("change", (event) => {
                if (event.target.value === "distance") {
                    sortByDistance(userLatLng);
                } else if (event.target.value === "rating") {
                    sortByRating();
                }
            });
        },
        (error) => {
            alert("Unable to retrieve your location. Using default sorting.");
            if (sortParam === "2") {
                sortByRating();
            } else {
                sortByRating();
            }

            sortDropdown.addEventListener("change", (event) => {
                if (event.target.value === "distance") {
                    alert("Distance sorting is not available without geolocation.");
                } else if (event.target.value === "rating") {
                    sortByRating();
                }
            });
        }
    );
}

// Initialize everything
setGeolocation();
loadSpacesData();

// Make sure QRCode.js is loaded in explore.html (see HTML snippet below).

function createPopupContent(place) {
    return `
        <div id="map-popup">
            <h5>${place.name}</h5>
            <img src="${place.image}" alt="${place.name}" width="180" />
            <p>${place.description || ''}</p>
            <a id="book-seat-btn" style="margin-top:10px;">Book a Seat</a>
            <div id="qrcode" style="margin-top:10px;"></div>
        </div>
    `;
}

// When creating a marker and binding a popup:
marker.bindPopup(createPopupContent(place));

// After the popup opens, attach the event listener:
marker.on('popupopen', function(e) {
    const btn = document.getElementById('book-seat-btn');
    if (btn) {
        btn.onclick = function() {
            // Clear previous QR code
            document.getElementById('qrcode').innerHTML = "";
            // Generate QR code with booking info
            const bookingData = {
                spaceId: place.id,
                spaceName: place.name,
                timestamp: new Date().toISOString()
            };
            new QRCode(document.getElementById('qrcode'), {
                text: JSON.stringify(bookingData),
                width: 160,
                height: 160
            });
        };
    }
});
