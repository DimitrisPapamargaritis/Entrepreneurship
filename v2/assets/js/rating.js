// --- Review Section Logic ---
// This script expects the following variables to be set in the HTML before including this file:
//   - SPACE_ID (string or number)
//   - reviewsKey (string, e.g. "collabrew_reviews_1")
//   - reviewsList (DOM element for reviews list)
//   - reviewForm (DOM element for the review form)
//   - reviewLoginMsg (DOM element for the login message)

(function () {
    // Check login
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('registeredAccount'));
    } catch (e) {}
    if (user && user.username) {
        reviewForm.style.display = '';
        reviewLoginMsg.style.display = 'none';
    } else {
        reviewForm.style.display = 'none';
        reviewLoginMsg.style.display = '';
    }

    // Load reviews
    function loadReviews() {
        reviewsList.innerHTML = "";
        let reviews = [];
        try {
            reviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];
        } catch (e) {}
        if (reviews.length === 0) {
            reviewsList.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
            return;
        }
        reviews.slice().reverse().forEach((r, idx) => {
            const div = document.createElement('div');
            div.style.marginBottom = "1rem";
            div.style.borderBottom = "1px solid #eee";
            div.style.paddingBottom = "0.5rem";
            // Star rating
            let stars = "";
            const rating = parseFloat(r.rating);
            const fullStars = Math.floor(rating);
            const halfStar = rating - fullStars >= 0.5;
            for (let i = 0; i < fullStars; i++) stars += '<i class="fa-solid fa-star" style="color:#f5b50a"></i>';
            if (halfStar) stars += '<i class="fa-solid fa-star-half-stroke" style="color:#f5b50a"></i>';
            for (let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) stars += '<i class="fa-regular fa-star" style="color:#f5b50a"></i>';
            div.innerHTML = `<div style="font-size:1.1rem;">${stars} <span style="color:#888;font-size:0.95rem;">by ${r.username}</span></div>
                <div style="margin-top:0.3rem;" class="review-text">${r.text.replace(/</g,"&lt;")}</div>`;
            // Add edit/delete buttons if it's the user's review
            if (user && user.username === r.username) {
                div.innerHTML += `
                    <button class="btn btn-edit-review" data-idx="${reviews.length - 1 - idx}" style="margin-top:0.5rem;background:#3a6ea5;color:#fff;">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-delete-review" data-idx="${reviews.length - 1 - idx}" style="margin-top:0.5rem;background:#e74c3c;color:#fff;">Delete</button>
                `;
            }
            reviewsList.appendChild(div);
        });

        // Edit review handler
        reviewsList.querySelectorAll('.btn-edit-review').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(btn.getAttribute('data-idx'));
                let reviews = [];
                try {
                    reviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];
                } catch (e) {}
                const review = reviews[idx];
                if (!review) return;
                // Replace text with textarea and stars with selector
                const parentDiv = btn.parentNode;
                const textDiv = parentDiv.querySelector('.review-text');
                const oldText = review.text;
                const oldRating = review.rating;
                const textarea = document.createElement('textarea');
                textarea.value = oldText;
                textarea.rows = 3;
                textarea.style.width = "90%";
                textarea.maxLength = 300;
                textDiv.replaceWith(textarea);

                // Star selector
                let starEditDiv = document.createElement('div');
                starEditDiv.style.fontSize = "2rem";
                starEditDiv.style.color = "#f5b50a";
                starEditDiv.style.margin = "0.5rem 0";
                let selected = parseFloat(oldRating);
                function renderEditStars(hoverValue = null) {
                    starEditDiv.innerHTML = '';
                    for (let i = 1; i <= 5; i++) {
                        let star = document.createElement('i');
                        let value = i;
                        if (hoverValue !== null) {
                            if (hoverValue >= i) {
                                star.className = 'fa-solid fa-star';
                            } else if (hoverValue >= i - 0.5) {
                                star.className = 'fa-solid fa-star-half-stroke';
                            } else {
                                star.className = 'fa-regular fa-star';
                            }
                        } else {
                            if (selected >= i) {
                                star.className = 'fa-solid fa-star';
                            } else if (selected >= i - 0.5) {
                                star.className = 'fa-solid fa-star-half-stroke';
                            } else {
                                star.className = 'fa-regular fa-star';
                            }
                        }
                        star.style.marginRight = "2px";
                        star.dataset.value = value;
                        star.addEventListener('mousemove', function(e) {
                            const rect = star.getBoundingClientRect();
                            const isHalf = (e.clientX - rect.left) < rect.width / 2;
                            renderEditStars(isHalf ? value - 0.5 : value);
                        });
                        star.addEventListener('mouseleave', function() {
                            renderEditStars();
                        });
                        star.addEventListener('click', function(e) {
                            const rect = star.getBoundingClientRect();
                            const isHalf = (e.clientX - rect.left) < rect.width / 2;
                            selected = isHalf ? value - 0.5 : value;
                            renderEditStars();
                        });
                        starEditDiv.appendChild(star);
                    }
                }
                renderEditStars();
                parentDiv.insertBefore(starEditDiv, btn);

                // Save/Cancel buttons
                btn.style.display = "none";
                const saveBtn = document.createElement('button');
                saveBtn.textContent = "Save";
                saveBtn.className = "btn";
                saveBtn.style.marginLeft = "0.5rem";
                saveBtn.style.background = "#27ae60";
                saveBtn.style.color = "#fff";
                saveBtn.onclick = function() {
                    const newText = textarea.value.trim();
                    if (!newText || !selected) {
                        alert("Please enter a comment and select a rating.");
                        return;
                    }
                    review.text = newText;
                    review.rating = selected;
                    reviews[idx] = review;
                    localStorage.setItem(reviewsKey, JSON.stringify(reviews));
                    loadReviews();
                };
                parentDiv.appendChild(saveBtn);

                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = "Cancel";
                cancelBtn.className = "btn";
                cancelBtn.style.marginLeft = "0.5rem";
                cancelBtn.onclick = function() {
                    loadReviews();
                };
                parentDiv.appendChild(cancelBtn);
            };
        });

        // Delete review handler
        reviewsList.querySelectorAll('.btn-delete-review').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(btn.getAttribute('data-idx'));
                let reviews = [];
                try {
                    reviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];
                } catch (e) {}
                reviews.splice(idx, 1);
                localStorage.setItem(reviewsKey, JSON.stringify(reviews));
                loadReviews();
            };
        });
    }
    loadReviews();

    // Handle review submit
    reviewForm.onsubmit = function(e) {
        e.preventDefault();
        if (!user || !user.username) {
            reviewForm.style.display = 'none';
            reviewLoginMsg.style.display = '';
            return;
        }
        const rating = document.getElementById('review-rating').value;
        const text = document.getElementById('review-text').value.trim();
        if (!rating || !text) {
            alert('Please select a rating and enter a comment.');
            return;
        }
        let reviews = [];
        try {
            reviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];
        } catch (e) {}
        reviews.push({
            username: user.username,
            rating: rating,
            text: text,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(reviewsKey, JSON.stringify(reviews));
        document.getElementById('review-text').value = "";
        document.getElementById('review-rating').value = "";
        loadReviews();
    };

    // Dynamic star rating selector
    (function() {
        const starContainer = document.getElementById('star-rating-select');
        const ratingInput = document.getElementById('review-rating');
        let selected = 0;

        // Render stars (5 stars, half-star steps)
        function renderStars(hoverValue = null) {
            starContainer.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                let star = document.createElement('i');
                let value = i;
                if (hoverValue !== null) {
                    if (hoverValue >= i) {
                        star.className = 'fa-solid fa-star';
                    } else if (hoverValue >= i - 0.5) {
                        star.className = 'fa-solid fa-star-half-stroke';
                    } else {
                        star.className = 'fa-regular fa-star';
                    }
                } else {
                    if (selected >= i) {
                        star.className = 'fa-solid fa-star';
                    } else if (selected >= i - 0.5) {
                        star.className = 'fa-solid fa-star-half-stroke';
                    } else {
                        star.className = 'fa-regular fa-star';
                    }
                }
                star.style.marginRight = "2px";
                star.dataset.value = value;
                // Mouse events for full star
                star.addEventListener('mousemove', function(e) {
                    const rect = star.getBoundingClientRect();
                    const isHalf = (e.clientX - rect.left) < rect.width / 2;
                    renderStars(isHalf ? value - 0.5 : value);
                });
                star.addEventListener('mouseleave', function() {
                    renderStars();
                });
                star.addEventListener('click', function(e) {
                    const rect = star.getBoundingClientRect();
                    const isHalf = (e.clientX - rect.left) < rect.width / 2;
                    selected = isHalf ? value - 0.5 : value;
                    ratingInput.value = selected;
                    renderStars();
                });
                starContainer.appendChild(star);
            }
        }
        renderStars();

        // Only check the dynamic stars (selected variable) on submit
        if (ratingInput && ratingInput.form) {
            ratingInput.form.addEventListener('submit', function(e) {
                if (!selected) {
                    e.preventDefault();
                    alert('Please select a rating.');
                }
            });
        }
    })();
})();