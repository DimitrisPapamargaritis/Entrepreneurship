// Initialize the map
const map = L.map("map");

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors | &copy; Coffebrew",
}).addTo(map);

// Geolocation to get user's current location

// Set fallback to a default location (e.g. Larissa, Greece)
const fallbackLat = 39.640064;
const fallbackLng = 22.419485;

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Set the map view to user's current location
            map.setView([userLat, userLng], 15);

            // Add a marker for the user's location
            L.marker([userLat, userLng]).addTo(map).bindPopup("You are here!").openPopup();
        },

        (error) => {
            alert("Unable to retrieve your location. Using default location instead.");
            // Fallback to a default location
            map.setView([fallbackLat, fallbackLng], 15);
        }
    );
} else {
    alert("Geolocation is not supported by your browser. Using default location instead.");
    // Fallback to a default location
    map.setView([fallbackLat, fallbackLng], 15);
}

// Add location pins
const locations = [
    {
        lat: 39.640774,
        lng: 22.414129,
        popup: `
        <p>Wisedog<br>
        <a href="#">Get directions</a>
        </p>
        <img src="./assets/media/destination1.jpg" alt="Wisedog" class="popup-img" style="height:160px;">
    `,
    },
    {
        lat: 39.638247,
        lng: 22.413358,
        popup: `
        <p>Ron<br>
        <a href="#">Get directions</a>
        </p>
        <img src="./assets/media/destination2.jpg" alt="Ron" class="popup-img" style="height:160px;>
    `,
    },
];

locations.forEach((location) => {
    L.marker([location.lat, location.lng]).addTo(map).bindPopup(location.popup);
    //.openPopup();
});

document.getElementById("link-location-1").addEventListener("click", (e) => {
    e.preventDefault();
    if (locations[0]) {
        const selectedloc = L.marker([locations[0].lat, locations[0].lng]).addTo(map).bindPopup(locations[0].popup);
        map.setView(selectedloc.getLatLng(), 17); // Center the map on location
        selectedloc.openPopup(); // Open Location
    }
});

document.getElementById("link-location-2").addEventListener("click", (e) => {
    e.preventDefault();
    if (locations[1]) {
        const selectedloc = L.marker([locations[1].lat, locations[1].lng]).addTo(map).bindPopup(locations[1].popup);
        map.setView(selectedloc.getLatLng(), 17); // Center the map on location
        selectedloc.openPopup(); // Open Location
    }
});
