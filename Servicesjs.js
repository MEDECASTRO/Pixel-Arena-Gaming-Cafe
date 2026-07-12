const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const ZONES = {
    console: { cols: 4, price: 40, prefix: "C", elId: "zone-console" },
    vip:      { cols: 6, price: 75, prefix: "V", elId: "zone-vip", vip: true },
    standard: { cols: 4, price: 50, prefix: "S", elId: "zone-standard" }
};

const BOOKED = new Set([
    "C-A-1", "C-A-2",
    "V-B-3", "V-D-6", "V-F-2",
    "S-C-11", "S-E-13", "S-G-12"
]);

const selectedSeats = new Map();

function buildZone(zoneKey) {
    const zone = ZONES[zoneKey];
    const container = document.getElementById(zone.elId);
    if (!container) return;
    container.innerHTML = "";

    ROWS.forEach(row => {
        for (let col = 1; col <= zone.cols; col++) {

            const id = `${zone.prefix}-${row}-${col}`;
            const seat = document.createElement("button");
            seat.type = "button";
            seat.className = "seat" + (zone.vip ? " vip-seat" : "");
            seat.textContent = `${row}${col}`;
            seat.dataset.id = id;
            seat.dataset.zone = zoneKey;
            seat.dataset.price = zone.price;
            seat.dataset.label = `${zone.prefix}${row}${col}`;

            if (BOOKED.has(id)) {
                seat.classList.add("booked");
                seat.disabled = true;
                seat.title = "Already booked";
            } else {
                seat.classList.add("available");
                seat.addEventListener("click", () => toggleSeat(seat));
            }

            container.appendChild(seat);
        }
    });
}

function toggleSeat(seat) {
    const id = seat.dataset.id;

    if (selectedSeats.has(id)) {
        selectedSeats.delete(id);
        seat.classList.remove("selected");
    } else {
        selectedSeats.set(id, {
            zone: seat.dataset.zone,
            price: Number(seat.dataset.price),
            label: seat.dataset.label
        });
        seat.classList.add("selected");
    }

    updateSummary();
}

function removeSeat(id) {
    selectedSeats.delete(id);
    const seatEl = document.querySelector(`.seat[data-id="${id}"]`);
    if (seatEl) seatEl.classList.remove("selected");
    updateSummary();
}

function updateSummary() {
    const listEl = document.getElementById("selectionList");
    const countEl = document.getElementById("stationCount");
    const hoursEl = document.getElementById("hoursDisplay");
    const totalEl = document.getElementById("totalPrice");
    const confirmBtn = document.getElementById("confirmBtn");
    
    const hoursInput = document.getElementById("bookingHours");
    const hours = hoursInput ? Number(hoursInput.value) : 1;

    if (!listEl) return;
    listEl.innerHTML = "";

    if (selectedSeats.size === 0) {

        listEl.innerHTML = `<p class="empty-msg">No stations selected yet.</p>`;
    } else {
        selectedSeats.forEach((data, id) => {
            const chip = document.createElement("div");
            chip.className = "chip";

            chip.innerHTML = `${data.label} <button aria-label="Remove ${data.label}">&times;</button>`;
            chip.querySelector("button").addEventListener("click", () => removeSeat(id));
            listEl.appendChild(chip);
        });
    }

    let total = 0;
    selectedSeats.forEach(data => total += data.price * hours);

    if (countEl) countEl.textContent = selectedSeats.size;
    if (hoursEl) hoursEl.textContent = hours;

    if (totalEl) totalEl.textContent = `₱${total}`;
    if (confirmBtn) confirmBtn.disabled = selectedSeats.size === 0;
}

const hoursSelect = document.getElementById("bookingHours");
if (hoursSelect) {
    hoursSelect.addEventListener("change", updateSummary);
}

const confirmButton = document.getElementById("confirmBtn");
if (confirmButton) {
    confirmButton.addEventListener("click", () => {
        const date = document.getElementById("bookingDate").value;
        const hours = document.getElementById("bookingHours").value;
        const stations = Array.from(selectedSeats.values()).map(s => s.label).join(", ");
        const total = document.getElementById("totalPrice").textContent;

        if (!date) {
            alert("Please pick a date for your booking.");
            return;
        }
        const bookingDetails = {
            date: date,
            hours: hours,
            stations: stations,
            total: total
        };
        localStorage.setItem('activeReservation', JSON.stringify(bookingDetails));
        alert(`Booking confirmed!\n\nDate: ${date}\nHours: ${hours}\nStations: ${stations}\nTotal Price: ${total}\n\nRedirecting you to the home page...`);
        
        window.location.href = 'index.html';
    });
}

const dateInput = document.getElementById("bookingDate");
if (dateInput) {
    dateInput.min = new Date().toISOString().split("T")[0];
    dateInput.value = new Date().toISOString().split("T")[0];
}

Object.keys(ZONES).forEach(buildZone);
updateSummary();
