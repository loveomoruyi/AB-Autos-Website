/* ================= LOCAL STORAGE BACKEND ================= */

/* ---------- Utilities ---------- */
const Storage = {
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  get(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }
};

/* ---------- Booking Backend ---------- */
function saveBooking(bookingData) {
  const bookings = Storage.get("ab_bookings");
  bookings.push({
    ...bookingData,
    id: Date.now(),
    createdAt: new Date().toISOString()
  });
  Storage.save("ab_bookings", bookings);
}

/* ---------- Contact / Visit Backend ---------- */
function saveVisitRequest(data) {
  const visits = Storage.get("ab_visits");
  visits.push({
    ...data,
    id: Date.now(),
    status: "pending"
  });
  Storage.save("ab_visits", visits);
}

/* ---------- Fleet Booking Backend ---------- */
function saveFleetBooking(carData) {
  const fleetBookings = Storage.get("ab_fleet_bookings");
  fleetBookings.push({
    ...carData,
    bookedAt: new Date().toISOString()
  });
  Storage.save("ab_fleet_bookings", fleetBookings);
}

/* ---------- Public API ---------- */
window.ABAutozBackend = {
  saveBooking,
  saveVisitRequest,
  saveFleetBooking,
  getBookings: () => Storage.get("ab_bookings"),
  getVisits: () => Storage.get("ab_visits"),
  getFleetBookings: () => Storage.get("ab_fleet_bookings")
};


  /* ================= EXPOSE TO BACKEND ================= */
  window.bookNowBtn = bookNowBtn;
  window.popupName = popupName;
  window.popupPrice = popupPrice;
  window.popupYear = popupYear;
  window.closePopup = closePopup;
