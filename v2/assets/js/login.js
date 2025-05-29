// Replace Log-in/Register button if user is registered (on every page load)
window.addEventListener('DOMContentLoaded', function() {
    const account = localStorage.getItem('registeredAccount');
    if (account) {
        const user = JSON.parse(account);
        const menu = document.querySelector('.menu');
        if (menu) {
            const loginBtn = menu.querySelector('.btn');
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <div class="user-dropdown">
                        <button class="user-dropdown-btn">
                            <i class="fas fa-user"></i> ${user.username} <i class="fas fa-caret-down"></i>
                        </button>
                        <div class="user-dropdown-content">
                            <a href="../profile.html">Profile</a>
                            <a href="../past-orders.html">Orders</a>
                            <button id="logout-btn">Log out</button>
                        </div>
                    </div>
                `;
                loginBtn.classList.add('user-logged-in'); // Add this line
                // Add logout handler
                const logoutBtn = loginBtn.querySelector('#logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', function() {
                        localStorage.removeItem('registeredAccount');
                        window.location.reload();
                    });
                }
            }
        }
    }
});