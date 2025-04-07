// public/seating.js (Final Version - Redirects to ticket.html on Success)

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_BASE_URL = 'http://localhost:3000';
    // TODO: Get price dynamically based on movie/theater/slot if possible
    const PRICE_PER_SEAT = 250; // Example fixed price per seat

    // --- DOM Elements ---
    const movieTitleEl = document.getElementById('movie-title');
    const showtimeInfoEl = document.getElementById('showtime-info');
    const backLinkEl = document.getElementById('back-link');
    const seatsArea = document.querySelector('.seats-area');
    const seatStatusAreaEl = document.getElementById('seat-status-area'); // Area for loading/error messages
    const selectedSeatsListEl = document.getElementById('selected-seats-list');
    const totalPriceEl = document.getElementById('total-price');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');
    const seatingContainer = document.querySelector('.seating-container');

    // --- Get Data from URL Parameters ---
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('movieId');
    const theaterId = params.get('theaterId');
    const bookingDate = params.get('date'); // Expecting YYYY-MM-DD format
    const showtimeSlot = params.get('slot'); // Expecting "Morning", "Afternoon", "Evening"
    const language = params.get('lang');
    const format = params.get('format');
    const movieTitle = params.get('movieTitle') ? decodeURIComponent(params.get('movieTitle')) : 'Movie';
    const theaterName = params.get('theaterName') ? decodeURIComponent(params.get('theaterName')) : 'Theater';

    // --- State ---
    let selectedSeats = []; // Holds array of selected seat IDs, e.g., ["A1", "C5"]
    let occupiedSeatsFromServer = []; // Holds array of seat IDs already booked

    // --- Initialization ---
    async function initializePage() { // Make async to await fetch
        // 1. Display Static Header Info
        movieTitleEl.textContent = movieTitle;
        showtimeInfoEl.textContent = `${theaterName} | ${bookingDate} | ${showtimeSlot}`;
        if (movieId) {
             backLinkEl.href = `movie-details.html?id=${movieId}`; // Set back link correctly
             backLinkEl.style.display = 'inline-block';
        }

        // 2. Fetch Occupied Seats from Backend
        await fetchOccupiedSeats(movieId, theaterId, bookingDate, showtimeSlot);

        // 3. Render the Seat Map based on fetched data
        renderSeatMap(); // Render only after fetch is done (handles errors internally)

        // 4. Update Summary (initially shows 0/None)
        updateSummary();
    }

    // --- Fetch Occupied Seats ---
    async function fetchOccupiedSeats(movId, thId, date, slot) {
         setLoadingMessage("Loading seat availability...", seatStatusAreaEl);
         try {
              const queryParams = new URLSearchParams({
                  movieId: movId, theaterId: thId, bookingDate: date, showtimeSlot: slot
              });
              const response = await fetch(`${API_BASE_URL}/api/bookings/occupied-seats?${queryParams.toString()}`);
              if (!response.ok) {
                  const errorData = await response.json().catch(() => ({ message: response.statusText }));
                  throw new Error(`Failed to fetch occupied seats (${response.status}): ${errorData.message}`);
              }
              occupiedSeatsFromServer = await response.json();
              console.log("Fetched Occupied Seats:", occupiedSeatsFromServer);
              seatStatusAreaEl.innerHTML = ''; // Clear status on success

         } catch (error) {
              console.error("Error fetching occupied seats:", error);
              displayError(`Error loading seat availability: ${error.message}.`, seatStatusAreaEl);
              occupiedSeatsFromServer = [];
              confirmBookingBtn.disabled = true;
              confirmBookingBtn.textContent = 'Seat Status Unavailable';
         }
    }

    // --- Render Seat Map ---
    function renderSeatMap() {
        const allSeatElements = seatsArea.querySelectorAll('.seat');
        const loadingMsg = seatStatusAreaEl.querySelector('.loading-message');
        if (loadingMsg) loadingMsg.remove(); // Clear loading if still present
        const errorMsg = seatStatusAreaEl.querySelector('.error-message'); // Check for existing error

        if (!allSeatElements || allSeatElements.length === 0) {
            console.error("Seat elements not found in .seats-area! Check seating.html.");
            if (!errorMsg) displayError("Failed to find seat map elements in HTML.", seatStatusAreaEl);
            return;
        }
        // Only clear status area if no error is displayed
        if (!errorMsg) seatStatusAreaEl.innerHTML = '';

        allSeatElements.forEach(seat => {
            const seatId = seat.dataset.seatId;
            seat.removeEventListener('click', handleSeatClick);
            seat.classList.remove('occupied', 'selected', 'available');
            if (occupiedSeatsFromServer.includes(seatId)) {
                seat.classList.add('occupied');
            } else {
                seat.classList.add('available');
                seat.addEventListener('click', handleSeatClick);
            }
        });
    }


    // --- Event Handlers ---
    function handleSeatClick(event) {
        const seat = event.currentTarget;
        const seatId = seat.dataset.seatId;
        if (seat.classList.contains('occupied')) return;
        seat.classList.toggle('selected');
        if (seat.classList.contains('selected')) { selectedSeats.push(seatId); }
        else { selectedSeats = selectedSeats.filter(id => id !== seatId); }
        selectedSeats.sort();
        updateSummary();
    }
    confirmBookingBtn.addEventListener('click', handleConfirmBooking);

    // --- Update Summary UI ---
    function updateSummary() {
        selectedSeatsListEl.textContent = selectedSeats.length === 0 ? 'None' : selectedSeats.join(', ');
        const currentTotalPrice = selectedSeats.length * PRICE_PER_SEAT;
        totalPriceEl.textContent = currentTotalPrice;
        if (confirmBookingBtn.textContent === 'Booked!' || confirmBookingBtn.textContent === 'Seat Status Unavailable') {
             confirmBookingBtn.disabled = true;
        } else {
             confirmBookingBtn.disabled = selectedSeats.length === 0;
             confirmBookingBtn.textContent = 'Confirm Booking';
        }
    }

    // --- Confirm Booking (Calls API and Redirects) ---
    async function handleConfirmBooking() {
        if (selectedSeats.length === 0) {
            alert("Please select at least one seat.");
            return;
        }
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("Error: User not identified. Please log in again.");
            return;
        }

        const bookingData = {
            userId: userId, movieId: movieId, theaterId: theaterId, language: language, format: format,
            bookingDate: bookingDate, showtimeSlot: showtimeSlot, seats: selectedSeats,
            totalPrice: selectedSeats.length * PRICE_PER_SEAT
        };
        console.log("Sending Booking Data:", bookingData);

        try {
            confirmBookingBtn.textContent = 'Booking...'; confirmBookingBtn.disabled = true;
            const response = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', /* Add Auth header if needed */ },
                body: JSON.stringify(bookingData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || `Booking failed (${response.status})`);

            // --- SUCCESS ---
            alert(`Booking Successful!\nRedirecting to your ticket page...`); // Notify user

            // ** REDIRECT TO TICKET PAGE **
            window.location.href = `ticket.html?bookingId=${result.bookingId}`; // Pass new booking ID

            // Code below might not execute due to redirect, but good practice:
            // Update UI locally immediately (optional if redirecting)
            // selectedSeats.forEach(seatId => { ... mark as occupied ... });
            // selectedSeats = []; updateSummary(); confirmBookingBtn.textContent = 'Booked!';

        } catch (error) {
            // --- Booking Failed ---
            console.error("Booking failed:", error);
            alert(`Booking failed: ${error.message}`); // Show specific error
            confirmBookingBtn.textContent = 'Confirm Booking';
            confirmBookingBtn.disabled = (selectedSeats.length === 0); // Re-enable maybe?

            // If conflict error, refresh occupied seats
            if (error.message && error.message.includes("no longer available")) {
                 console.log("Conflict detected, re-fetching occupied seats...");
                 await fetchOccupiedSeats(movieId, theaterId, bookingDate, showtimeSlot);
                 renderSeatMap(); // Re-render map
                 selectedSeats = []; updateSummary(); // Clear failed selection
            }
        }
    }

     // --- Utility Functions ---
     function setLoadingMessage(message, container) { if(container) container.innerHTML = `<p class="loading-message">${message}</p>`; }
     function displayError(message, container) { if(container) container.innerHTML = `<p class="error-message">${message}</p>`; }

    // --- Start the Page Initialization ---
    if (movieId && theaterId && bookingDate && showtimeSlot && language && format) {
        initializePage(); // Calls the async function to start everything
    } else {
        displayError("Error: Missing necessary booking information in the URL.", seatingContainer);
        console.error("Missing URL parameters for seating page:", {movieId, theaterId, bookingDate, showtimeSlot, language, format});
    }

}); // End DOMContentLoaded