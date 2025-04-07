// src/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Link to the user who made the booking
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the 'User' model (users collection)
        required: [true, "User ID is required for booking."],
        index: true // Index for easily finding a user's bookings
    },
    // Link to the movie being booked
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie', // Refers to the 'Movie' model (movies collection)
        required: [true, "Movie ID is required for booking."],
        index: true
    },
    // Link to the theater where the movie is booked
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater', // Refers to the 'Theater' model (theaters collection)
        required: [true, "Theater ID is required for booking."],
        index: true
    },
    // Details selected by the user
    language: {
        type: String,
        required: [true, "Language selection is required."]
    },
    format: {
        type: String,
        required: [true, "Format selection is required."]
    },
    // The specific date the user chose to watch the movie
    bookingDate: {
        type: Date, // Store as a full Date object
        required: [true, "Booking date is required."]
    },
    // The fixed time slot selected (e.g., "Morning", "Afternoon", "Evening")
    showtimeSlot: {
        type: String,
        required: [true, "Showtime slot is required."]
    },
    // Array of seat identifiers booked (e.g., ["A1", "A2", "C5"])
    seats: {
        type: [String],
        required: [true, "At least one seat must be selected."]
        // You could add validation here to ensure the array is not empty if needed elsewhere
    },
    // The total price calculated for this booking
    totalPrice: {
        type: Number,
        required: [true, "Total price is required."],
        min: [0, "Price cannot be negative."]
    },
    // bookingTime (createdAt) and last update time (updatedAt)
    // will be added automatically by the timestamps option below.

}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Optional: Index for querying occupied seats efficiently
bookingSchema.index({ movieId: 1, theaterId: 1, bookingDate: 1, showtimeSlot: 1 });

// Create the Mongoose model named 'Booking' based on the schema
// Mongoose will interact with the 'bookings' collection in MongoDB
const Booking = mongoose.model('Booking', bookingSchema);

// Export the model to be used in other parts of the application (like app.js)
module.exports = Booking;