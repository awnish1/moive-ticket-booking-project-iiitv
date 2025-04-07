// src/models/Movie.js

const mongoose = require("mongoose");

// Define the schema for the 'movies' collection
const movieSchema = new mongoose.Schema({
    // === Core Info ===
    title: {
        type: String,
        required: [true, "Movie title is required."],
        trim: true
    },
    description: { // Often called 'synopsis'
        type: String,
        required: [true, "Movie description/synopsis is required."]
    },

    // === Visuals & Links ===
    imageUrl: { // Main poster image
        type: String,
        required: [true, "Movie poster image URL is required."]
    },
    bannerUrl: { // Optional: Wider banner image
        type: String
    },
    trailerUrl: { // Optional: Link to the movie trailer
        type: String
    },

    // === Key Details ===
    duration: { // e.g., "2h 17m" or store as minutes (Number) for calculations
        type: String // Storing as string is simpler for display
        // Alternatively: type: Number // Store total minutes (e.g., 137)
    },
    releaseDate: { // When the movie was released
        type: Date
    },
    certification: { // Age rating (e.g., "U/A", "A", "U", "PG-13")
        type: String
    },
    rating: { // Average user/critic rating (e.g., 8.5) - Optional
        type: Number,
        min: 0,
        max: 10 // Or 5, depending on your scale
    },

    // === Classification & Availability ===
    categories: { // Movie genres
        type: [String], // e.g., ["Action", "Adventure", "Sci-Fi"]
        index: true
    },
    languages: { // Available audio languages
        type: [String], // e.g., ["English", "Hindi", "Tamil"]
        index: true
    },
    formats: { // Available viewing formats
        type: [String] // e.g., ["2D", "3D", "IMAX", "4DX"]
    },
    screen: { // Optional: Could refer to specific screen types like 'Gold Class', 'Platinum' if relevant beyond format
        type: String
    },

    // === Credits ===
    director: {
        type: String
    },
    cast: { // Array of main actors/actresses
        type: [String]
    },

    // === Pricing (Optional Base Price) ===
    price: { // A base ticket price, actual price might depend on showtime/format/seat
        type: Number,
        min: 0
    },

    // === Timestamps ===
    createdAt: { // Track when the movie was added to the DB
        type: Date,
        default: Date.now
    },
    updatedAt: { // Track last update time
        type: Date,
        default: Date.now
    }
});

// Middleware to update the `updatedAt` field on save
movieSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
// Create the Mongoose model from the schema
const Movie = mongoose.model("Movie", movieSchema);

// Export the model
module.exports = Movie;