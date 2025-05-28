// booking-seat.js: Generic booking logic, uses window.bookingSeatConfig for per-space config

(function () {
    // Wait for config to be set by the page
    document.addEventListener("DOMContentLoaded", function () {
        // Check if user is logged in (sessionStorage)
        const registeredAccount = sessionStorage.getItem('registeredAccount');
        if (!registeredAccount) {
            alert('You must be logged in to book a seat.');
            window.location.href = "../auth/login.html";
            return;
        }

        // Default config (for safety)
        const config = window.bookingSeatConfig || {
            spaceId: 0,
            spaceName: "Unknown",
            hoursStr: "Δε-Κυρ 10:00πμ - 12:30πμ"
        };

        // Helper to parse Greek hours string, e.g. "Δε-Κυρ 10:00πμ - 12:30πμ"
        function parseHours(hoursStr) {
            // Extract the time part
            const match = hoursStr.match(/(\d{1,2}:\d{2})πμ\s*-\s*(\d{1,2}:\d{2})πμ/);
            if (match) {
                let open = match[1];
                let close = match[2];
                // If close is 12:xxπμ, treat close as 00:xx (next day)
                if (close.startsWith("12:")) {
                    close = "00:" + close.split(':')[1];
                }
                return { open, close };
            }
            // Try for "πμ - μμ" (morning to evening)
            const match2 = hoursStr.match(/(\d{1,2}:\d{2})πμ\s*-\s*(\d{1,2}:\d{2})μμ/);
            if (match2) {
                let open = match2[1];
                let close = match2[2];
                let [h, m] = close.split(':');
                close = (parseInt(h, 10) + 12) + ':' + m;
                return { open, close };
            }
            // Try for "μμ - μμ" (evening to evening)
            const match3 = hoursStr.match(/(\d{1,2}:\d{2})μμ\s*-\s*(\d{1,2}:\d{2})μμ/);
            if (match3) {
                let open = match3[1];
                let close = match3[2];
                let [h1, m1] = open.split(':');
                let [h2, m2] = close.split(':');
                open = (parseInt(h1, 10) + 12) + ':' + m1;
                close = (parseInt(h2, 10) + 12) + ':' + m2;
                return { open, close };
            }
            // Fallback
            return { open: "10:00", close: "00:30" };
        }

        const { open, close } = parseHours(config.hoursStr);

        function fetchAvailableSpaces(date, hour) {
            if (!date || !hour) return "Select date & hour";
            let hash = 0;
            for (let c of (date + hour)) hash += c.charCodeAt(0);
            return 3 + (hash % 13); // 3 to 15 seats
        }

        function isHourWithinWorkingHours(hour, open, close) {
            if (!hour) return false;
            if (open < close) {
                return hour >= open && hour <= close;
            } else {
                // Overnight case (e.g. 20:00-02:00)
                return (hour >= open || hour <= close);
            }
        }

        function isTimeInFuture(date, hour) {
            if (!date || !hour) return false;
            const today = new Date();
            const selected = new Date(date + "T" + hour);
            if (today.toISOString().slice(0, 10) === date) {
                const nowTime = today.getHours().toString().padStart(2, '0') + ':' + today.getMinutes().toString().padStart(2, '0');
                return hour >= nowTime;
            }
            return selected > today;
        }

        function updateAvailableSpaces() {
            const date = document.getElementById('booking-date').value;
            const hour = document.getElementById('booking-hour').value;
            const section = document.getElementById('available-spaces-section');
            const spacesCountElem = document.getElementById('spaces-count');
            if (!date || !hour || !isHourWithinWorkingHours(hour, open, close) || !isTimeInFuture(date, hour)) {
                section.style.display = "none";
                return;
            }
            const count = fetchAvailableSpaces(date, hour);
            spacesCountElem.textContent = count;
            section.style.display = "block";
        }

        // Only run if the booking elements exist (so it doesn't break other pages)
        if (
            document.getElementById('book-seat-btn') &&
            document.getElementById('calendar-container') &&
            document.getElementById('confirm-booking-btn') &&
            document.getElementById('available-spaces-section')
        ) {
            document.getElementById('book-seat-btn').onclick = function () {
                document.getElementById('calendar-container').style.display = 'block';
                this.style.display = 'none';
            };

            document.getElementById('confirm-booking-btn').onclick = function () {
                var date = document.getElementById('booking-date').value;
                var hour = document.getElementById('booking-hour').value;
                if (!date) {
                    alert('Please select a date.');
                    return;
                }
                if (!hour) {
                    alert('Please select an hour.');
                    return;
                }

                let valid = false;
                if (open < close) {
                    valid = (hour >= open && hour <= close);
                } else {
                    valid = (hour >= open || hour <= close);
                }
                if (!valid) {
                    alert(`Please select an hour between ${open} and ${close}.`);
                    return;
                }

                var today = new Date();
                if (today.toISOString().slice(0, 10) === date) {
                    var nowTime = today.getHours().toString().padStart(2, '0') + ':' + today.getMinutes().toString().padStart(2, '0');
                    if (hour < nowTime) {
                        alert('Please select a time that has not already passed.');
                        return;
                    }
                }

                // Save booking info for QR code and redirect
                localStorage.setItem('collabrew_booking', JSON.stringify({
                    spaceId: config.spaceId,
                    spaceName: config.spaceName,
                    date: date,
                    hour: hour,
                    timestamp: new Date().toISOString()
                }));
                window.location.href = "../payment/payment.html";
            };

            document.getElementById('available-spaces-section').style.display = "none";
            // Set min date for calendar to today
            var today = new Date().toISOString().split('T')[0];
            document.getElementById('booking-date').setAttribute('min', today);
            // Set min/max for time input
            document.getElementById('booking-hour').setAttribute('min', open);
            document.getElementById('booking-hour').setAttribute('max', close);
            // Show available spaces as soon as both date and hour are selected and valid
            document.getElementById('booking-date').addEventListener('change', updateAvailableSpaces);
            document.getElementById('booking-hour').addEventListener('change', updateAvailableSpaces);
            updateAvailableSpaces();
        }
    });
})();