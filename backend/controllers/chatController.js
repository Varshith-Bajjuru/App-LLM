const Chat = require("../models/chatModel");

exports.saveChat = async (req, res) => {
  try {
    const { prompt, response } = req.body;
    if (!prompt || !response) {
      return res
        .status(400)
        .json({ message: "Prompt and response are required" });
    }

    const chat = new Chat({ prompt, response });
    await chat.save();

    res.status(201).json({ message: "Chat saved successfully" });
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ message: "Error saving chat", error });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: -1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history", error });
  }
};
