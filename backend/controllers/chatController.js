const Chat = require("../models/chatModel");
const { v4: uuidv4 } = require("uuid");

exports.saveChat = async (req, res) => {
  try {
    const { prompt, response, sessionId } = req.body;
    if (!prompt || !response) {
      return res
        .status(400)
        .json({ message: "Prompt and response are required" });
    }

    let chat;
    if (sessionId) {
      // Update existing session
      chat = await Chat.findOneAndUpdate(
        { sessionId, userId: req.user.id },
        {
          $push: {
            messages: { prompt, response },
          },
          $set: {
            updatedAt: Date.now(),
            title: prompt.slice(0, 30) || "New Chat", // Update title with latest prompt
          },
        },
        { new: true, upsert: false } // Don't create new if not found
      );

      if (!chat) {
        // Session not found, create new one
        const newSessionId = uuidv4();
        chat = new Chat({
          sessionId: newSessionId,
          userId: req.user.id,
          title: prompt.slice(0, 30) || "New Chat",
          messages: [{ prompt, response }],
        });
        await chat.save();
      }
    } else {
      // Create new session
      const newSessionId = uuidv4();
      chat = new Chat({
        sessionId: newSessionId,
        userId: req.user.id,
        title: prompt.slice(0, 30) || "New Chat",
        messages: [{ prompt, response }],
      });
      await chat.save();
    }

    // Broadcast update via WebSocket
    if (req.app.locals.broadcastUpdate) {
      req.app.locals.broadcastUpdate({
        action: chat.sessionId === sessionId ? "UPDATE" : "NEW",
        chat: {
          id: chat.sessionId,
          title: chat.title,
          messages: chat.messages
            .map((msg) => ({
              text: msg.prompt,
              isUser: true,
              timestamp: msg.timestamp,
            }))
            .concat(
              chat.messages.map((msg) => ({
                text: msg.response,
                isUser: false,
                timestamp: msg.timestamp,
              }))
            ),
          timestamp: chat.updatedAt,
        },
        sessionId: chat.sessionId,
        userId: chat.userId.toString(),
      });
    }

    res.status(201).json({
      message: "Chat saved successfully",
      sessionId: chat.sessionId,
      isNew: chat.sessionId !== sessionId,
    });
  } catch (error) {
    console.error("Error saving chat:", error);
    res
      .status(500)
      .json({ message: "Error saving chat", error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    const formattedChats = chats.map((chat) => ({
      id: chat.sessionId,
      title: chat.title || chat.messages[0]?.prompt?.slice(0, 30) || "New Chat",
      messages: chat.messages.flatMap((msg) => [
        { text: msg.prompt, isUser: true, timestamp: msg.timestamp },
        { text: msg.response, isUser: false, timestamp: msg.timestamp },
      ]),
      timestamp: chat.updatedAt,
    }));

    res.status(200).json(formattedChats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res
      .status(500)
      .json({ message: "Error fetching chat history", error: error.message });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { sessionId } = req.body; // Changed from 'id' to 'sessionId'

    const result = await Chat.deleteOne({
      sessionId,
      userId: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found or not owned by user",
      });
    }

    if (req.app.locals.broadcastUpdate) {
      req.app.locals.broadcastUpdate({
        action: "DELETE",
        sessionId: sessionId,
        userId: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete chat session",
      error: error.message,
    });
  }
};
