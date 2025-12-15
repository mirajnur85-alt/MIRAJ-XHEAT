(() => {
    "use strict";

    const BIN_ID = "693f01acae596e708f99cd4a";
    const API_KEY = "$2a$10$WoyF7vOPnOj.qxyCwyrKKeegTAXy5H8eGMFiVhf3lXP8IhvLZ5zK6";
    const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

    const HEADERS = {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
    };

    const today = new Date().toISOString().slice(0, 10);

    function getEl(id) {
        return document.getElementById(id);
    }

    const todayEl = getEl("todayCount");
    const totalEl = getEl("totalCount");

    // ---- Load cached values instantly (fast UI) ----
    const cache = JSON.parse(localStorage.getItem("visitCache") || "{}");

    if (cache.date === today) {
        if (todayEl) todayEl.textContent = cache.today;
        if (totalEl) totalEl.textContent = cache.total;
    }

    async function updateCounter() {
        try {
            const res = await fetch(URL, { headers: HEADERS });
            if (!res.ok) throw new Error("Read failed");

            const data = await res.json();
            const record = data.record || {};

            const newTotal = (record.total ?? 0) + 1;
            const newToday =
                record.date === today ? (record.today ?? 0) + 1 : 1;

            // Update UI immediately
            if (totalEl) totalEl.textContent = newTotal;
            if (todayEl) todayEl.textContent = newToday;

            // Save cache
            localStorage.setItem(
                "visitCache",
                JSON.stringify({
                    total: newTotal,
                    today: newToday,
                    date: today
                })
            );

            // Write back (non-blocking)
            fetch(URL, {
                method: "PUT",
                headers: HEADERS,
                body: JSON.stringify({
                    total: newTotal,
                    today: newToday,
                    date: today
                })
            }).catch(() => { });

        } catch (err) {
            console.warn("Counter error:", err);
        }
    }

    // Non-blocking load
    window.addEventListener("load", updateCounter);
})();
