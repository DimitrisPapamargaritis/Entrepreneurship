document.addEventListener('DOMContentLoaded', function () {
    // Tab switching logic
    const tabBtns = document.querySelectorAll('.profile-tab-btn');
    const tabContents = {
        details: document.getElementById('tab-details'),
        reviews: document.getElementById('tab-reviews'),
        stats: document.getElementById('tab-stats')
    };
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            Object.keys(tabContents).forEach(key => {
                tabContents[key].style.display = (btn.dataset.tab === key) ? '' : 'none';
            });
        });
    });

    // --- USER REVIEWS ---
    const user = JSON.parse(localStorage.getItem('registeredAccount') || '{}');
    const username = user.username;
    const reviewsListDiv = document.getElementById('user-reviews-list');
    if (reviewsListDiv && username) {
        fetch('./assets/spaces/spaces.xml')
            .then(res => res.text())
            .then(xmlText => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(xmlText, "text/xml");
                const spaces = xml.getElementsByTagName("space");
                const spaceNames = {};
                for (let i = 0; i < spaces.length; i++) {
                    const id = spaces[i].getElementsByTagName("id")[0].textContent;
                    const name = spaces[i].getElementsByTagName("name")[0].textContent;
                    spaceNames[id] = name;
                }

                // Gather all reviews from localStorage
                let reviews = [];
                for (let i = 1; i <= 5; i++) {
                    const key = 'collabrew_reviews_' + i;
                    try {
                        const arr = JSON.parse(localStorage.getItem(key)) || [];
                        arr.forEach(r => {
                            if (r.username === username) {
                                reviews.push({ ...r, spaceId: i, reviewIdx: arr.indexOf(r) });
                            }
                        });
                    } catch (e) {}
                }
                if (reviews.length === 0) {
                    reviewsListDiv.innerHTML = "<div>You haven't left any reviews yet.</div>";
                } else {
                    reviewsListDiv.innerHTML = "";
                    reviews.slice().reverse().forEach((r, idx) => {
                        const div = document.createElement('div');
                        div.style.marginBottom = "1.2rem";
                        div.style.borderBottom = "1px solid #eee";
                        div.style.paddingBottom = "0.7rem";
                        // Star rating
                        let stars = "";
                        const rating = parseFloat(r.rating);
                        const fullStars = Math.floor(rating);
                        const halfStar = rating - fullStars >= 0.5;
                        for (let i = 0; i < fullStars; i++) stars += '<i class="fa-solid fa-star" style="color:#f5b50a"></i>';
                        if (halfStar) stars += '<i class="fa-solid fa-star-half-stroke" style="color:#f5b50a"></i>';
                        for (let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) stars += '<i class="fa-regular fa-star" style="color:#f5b50a"></i>';
                        const storeName = spaceNames[r.spaceId] ? spaceNames[r.spaceId] : `Space #${r.spaceId}`;
                        div.innerHTML = `
                            <div style="font-size:1.1rem;">
                                ${stars}
                                <span style="color:#888;font-size:0.95rem;">on <b>${storeName}</b></span>
                            </div>
                            <div style="margin-top:0.3rem;" class="review-text">${r.text.replace(/</g,"&lt;")}</div>
                            <button class="btn btn-edit-review" data-space="${r.spaceId}" data-idx="${r.reviewIdx}" style="margin-top:0.5rem;background:#3a6ea5;color:#fff;">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn btn-delete-review" data-space="${r.spaceId}" data-idx="${r.reviewIdx}" style="margin-top:0.5rem;background:#e74c3c;color:#fff;">Delete</button>
                        `;
                        reviewsListDiv.appendChild(div);
                    });

                    // Edit review handler
                    reviewsListDiv.querySelectorAll('.btn-edit-review').forEach(btn => {
                        btn.onclick = function() {
                            const spaceId = btn.getAttribute('data-space');
                            const idx = parseInt(btn.getAttribute('data-idx'));
                            let arr = [];
                            try {
                                arr = JSON.parse(localStorage.getItem('collabrew_reviews_' + spaceId)) || [];
                            } catch (e) {}
                            const review = arr[idx];
                            if (!review) return;
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
                                arr[idx] = review;
                                localStorage.setItem('collabrew_reviews_' + spaceId, JSON.stringify(arr));
                                // Reload reviews
                                reviewsListDiv.innerHTML = "";
                                // Re-run the fetch and render logic
                                // (You can refactor this block into a function for DRY)
                                window.location.reload();
                            };
                            parentDiv.appendChild(saveBtn);

                            const cancelBtn = document.createElement('button');
                            cancelBtn.textContent = "Cancel";
                            cancelBtn.className = "btn";
                            cancelBtn.style.marginLeft = "0.5rem";
                            cancelBtn.onclick = function() {
                                window.location.reload();
                            };
                            parentDiv.appendChild(cancelBtn);
                        };
                    });

                    // Delete review handler (already present)
                    reviewsListDiv.querySelectorAll('.btn-delete-review').forEach(btn => {
                        btn.onclick = function() {
                            const spaceId = btn.getAttribute('data-space');
                            const idx = parseInt(btn.getAttribute('data-idx'));
                            let arr = [];
                            try {
                                arr = JSON.parse(localStorage.getItem('collabrew_reviews_' + spaceId)) || [];
                            } catch (e) {}
                            arr.splice(idx, 1);
                            localStorage.setItem('collabrew_reviews_' + spaceId, JSON.stringify(arr));
                            window.location.reload();
                        };
                    });
                }
            });
    }

    // --- USER BOOKING STATS ---
    const statsDiv = document.getElementById('user-booking-stats');
    if (statsDiv && username) {
        let orders = [];
        try {
            orders = JSON.parse(localStorage.getItem('collabrew_orders')) || [];
        } catch (e) {}
        orders = orders.filter(o => o.username === username);

        // Fetch space names from XML
        fetch('./assets/spaces/spaces.xml')
            .then(res => res.text())
            .then(xmlText => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(xmlText, "text/xml");
                const spaces = xml.getElementsByTagName("space");
                // Build a map: id -> name
                const spaceNames = {};
                for (let i = 0; i < spaces.length; i++) {
                    const id = spaces[i].getElementsByTagName("id")[0].textContent;
                    const name = spaces[i].getElementsByTagName("name")[0].textContent;
                    spaceNames[id] = name;
                }

                const total = orders.length;
                // Favorite space
                const freq = {};
                orders.forEach(o => {
                    freq[o.spaceId] = (freq[o.spaceId] || 0) + 1;
                });
                let favSpace = null, favCount = 0;
                for (let sid in freq) {
                    if (freq[sid] > favCount) {
                        favSpace = sid;
                        favCount = freq[sid];
                    }
                }
                statsDiv.innerHTML = `
                    <div>Total bookings: <b>${total}</b></div>
                    <div>Favorite space: <b>${favSpace ? (spaceNames[favSpace] || ('Space #' + favSpace)) : 'N/A'}</b> (${favCount} bookings)</div>
                `;

                // List all bookings with space name (REMOVED as requested)
                // if (orders.length === 0) {
                //     statsDiv.innerHTML += `<div style="color:#bbb;">No bookings yet.</div>`;
                // } else {
                //     orders.slice().reverse().forEach(order => {
                //         const spaceName = spaceNames[order.spaceId] || ('Space #' + order.spaceId);
                //         statsDiv.innerHTML += `
                //             <div style="margin-bottom:0.7rem;">
                //                 <span style="color:#3a6ea5;font-weight:bold;">${spaceName}</span>
                //                 <span style="color:#888;">(${order.date} ${order.hour})</span>
                //             </div>
                //         `;
                //     });
                // }
            });
    }

    // Referral code logic (replace previous referral code logic)
    const referralInput = document.getElementById('detail-referral');
    const generateReferralBtn = document.getElementById('generate-referral-btn');
    const referralGenerated = document.getElementById('referral-generated');
    if (referralInput && generateReferralBtn && referralGenerated) {
        // Load referral from localStorage if exists
        let user = JSON.parse(localStorage.getItem('registeredAccount') || '{}');
        if (user.referral) {
            referralInput.value = user.referral;
            referralGenerated.textContent = "Your referral: " + user.referral;
            generateReferralBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
        }

        generateReferralBtn.onclick = function () {
            let user = JSON.parse(localStorage.getItem('registeredAccount') || '{}');
            if (user.referral) {
                // Only copy, do NOT generate a new one
                navigator.clipboard.writeText(user.referral);
                referralGenerated.textContent = "Copied!";
                setTimeout(() => {
                    referralGenerated.textContent = "Your referral: " + user.referral;
                }, 1200);
            } else {
                let code = '';
                if (user.username) {
                    code = user.username + '-' + Math.floor(1000 + Math.random() * 9000);
                } else {
                    code = 'user-' + Math.floor(100000 + Math.random() * 900000);
                }
                referralInput.value = code;
                user.referral = code;
                localStorage.setItem('registeredAccount', JSON.stringify(user));
                referralGenerated.textContent = "Your referral: " + code;
                generateReferralBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
            }
        };
    }

    // Add referral logic
    const addReferralInput = document.getElementById('add-referral-input');
    const addReferralBtn = document.getElementById('add-referral-btn');
    const addReferralMsg = document.getElementById('add-referral-msg');
    if (addReferralInput && addReferralBtn && addReferralMsg) {
        // Load added referral if exists
        let user = JSON.parse(localStorage.getItem('registeredAccount') || '{}');
        if (user.addedReferral) addReferralInput.value = user.addedReferral;

        addReferralBtn.onclick = function () {
            const code = addReferralInput.value.trim();
            // Always reload user object to get latest referral
            let user = JSON.parse(localStorage.getItem('registeredAccount') || '{}');
            // Check: not empty, not your own, and you have a referral code
            if (!code) {
                addReferralMsg.style.display = '';
                addReferralMsg.style.color = "#e74c3c";
                addReferralMsg.textContent = "Enter a referral code.";
                setTimeout(() => { addReferralMsg.style.display = 'none'; }, 2000);
                return;
            }
            if (!user.referral) {
                addReferralMsg.style.display = '';
                addReferralMsg.style.color = "#e74c3c";
                addReferralMsg.textContent = "Generate your own referral first.";
                setTimeout(() => { addReferralMsg.style.display = 'none'; }, 2000);
                return;
            }
            if (code === user.referral) {
                addReferralMsg.style.display = '';
                addReferralMsg.style.color = "#e74c3c";
                addReferralMsg.textContent = "You can't add your own referral.";
                setTimeout(() => { addReferralMsg.style.display = 'none'; }, 2000);
                return;
            }
            else{user.addedReferral = code;
            localStorage.setItem('registeredAccount', JSON.stringify(user));
            addReferralMsg.style.display = '';
            addReferralMsg.style.color = "#27ae60";
            addReferralMsg.textContent = "Added!";
            setTimeout(() => { addReferralMsg.style.display = 'none'; }, 2000);
        } 
        };
    }
});