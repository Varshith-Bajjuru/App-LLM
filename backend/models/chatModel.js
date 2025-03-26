const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  messages: [
    {
      prompt: {
        type: String,
        required: true,
      },
      response: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: "New Chat",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Add compound index to prevent duplicates
chatSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Chat", chatSchema);
