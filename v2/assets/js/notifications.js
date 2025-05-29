window.showNotification = function(msg, duration = 3000) {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    toast.style.display = 'block';
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.style.display = 'none'; }, 500);
    }, duration);
};

// Show notification if redirected from payment complete
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.search.includes('from=complete')) {
        showNotification('Booking complete! Check your orders for details.');
        // Optionally, remove the query param so it doesn't show again on refresh
        if (window.history.replaceState) {
            const url = new URL(window.location);
            url.searchParams.delete('from');
            window.history.replaceState({}, document.title, url.pathname + url.search);
        }
    }
});