document.addEventListener("DOMContentLoaded", function () {
    const spacesXml = "./assets/spaces/spaces.xml";

    fetch(spacesXml)
        .then((response) => response.text())
        .then((data) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    displayTopRatedPlaces(xmlDoc, userLat, userLng);
                },
                (error) => {
                    console.error("Geolocation failed: ", error);
                    displayTopRatedPlaces(xmlDoc);
                }
            );
        });

    function displayTopRatedPlaces(xmlDoc, userLat = null, userLng = null) {
        const spaces = Array.from(xmlDoc.getElementsByTagName("space"));
        spaces.sort((a, b) => {
            const ratingA = parseFloat(a.getElementsByTagName("rating")[0].textContent);
            const ratingB = parseFloat(b.getElementsByTagName("rating")[0].textContent);
            return ratingB - ratingA;
        });

        const topRatedSpaces = spaces.slice(0, 3); // Get top 3 rated spaces

        // Ensure a div with class "row" exists
        let rowContainer = document.querySelector(".row");
        if (!rowContainer) {
            rowContainer = document.createElement("div");
            rowContainer.className = "row";
            document.body.appendChild(rowContainer); // Append to body or another parent element
        }

        // Create a div with id="popular-places" inside the row container
        let popularPlacesContainer = document.getElementById("popular-places");
        if (!popularPlacesContainer) {
            popularPlacesContainer = document.createElement("div");
            popularPlacesContainer.id = "popular-places";
            rowContainer.appendChild(popularPlacesContainer);
        }

        // Clear any existing content in the popularPlacesContainer
        popularPlacesContainer.innerHTML = "";

        topRatedSpaces.forEach((space) => {
            const id = space.getElementsByTagName("id")[0].textContent;
            const name = space.getElementsByTagName("name")[0].textContent;
            const image = space.getElementsByTagName("image")[0].textContent;
            const rating = parseFloat(space.getElementsByTagName("rating")[0].textContent);
            const latitude = parseFloat(space.getElementsByTagName("latitude")[0].textContent);
            const longitude = parseFloat(space.getElementsByTagName("longitude")[0].textContent);
            let distance = "Unknown distance";

            if (userLat !== null && userLng !== null) {
                distance = calculateDistance(userLat, userLng, latitude, longitude).toFixed(2) + " kilometers away";
            }

            const columnDiv = document.createElement("div");
            columnDiv.className = "column col-30";

            const colElementDiv = document.createElement("div");
            colElementDiv.className = "col-element hover-opacity";
            colElementDiv.style.cursor = "pointer";
            colElementDiv.addEventListener("click", () => {
                window.location.href = `./explore.html?space=${encodeURIComponent(id)}`;
            });

            const imgElement = document.createElement("img");
            imgElement.src = image;
            imgElement.alt = `${name} Image`;

            const nameElement = document.createElement("h3");
            nameElement.textContent = name;

            const starReviewDiv = document.createElement("div");
            starReviewDiv.className = "star-review";
            for (let i = 0; i < Math.floor(rating); i++) {
                const starIcon = document.createElement("i");
                starIcon.className = "fa fa-solid fa-star";
                starReviewDiv.appendChild(starIcon);
            }
            if (rating % 1 !== 0) {
                const halfStarIcon = document.createElement("i");
                halfStarIcon.className = "fa fa-solid fa-star-half-alt";
                starReviewDiv.appendChild(halfStarIcon);
            }

            const distanceElement = document.createElement("p");
            distanceElement.textContent = distance;

            colElementDiv.appendChild(imgElement);
            colElementDiv.appendChild(nameElement);
            colElementDiv.appendChild(starReviewDiv);
            colElementDiv.appendChild(distanceElement);

            columnDiv.appendChild(colElementDiv);
            popularPlacesContainer.appendChild(columnDiv);
        });
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = degreesToRadians(lat2 - lat1);
        const dLon = degreesToRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
});
