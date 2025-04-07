const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/youtubeRegistration", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log(" Connected to MongoDB successfully!"))
  .catch(err => console.error(" MongoDB connection error:", err));
