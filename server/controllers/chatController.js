import { io } from "../server.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Match from "../models/Match.js";

// =====================================================
// CREATE OR GET CHAT FOR A CONFIRMED MATCH
// =====================================================
export const createOrGetChat = async (req, res) => {
  try {
    const { matchId } = req.body;

    if (!matchId) {
      return res.status(400).json({
        message: "Match ID is required.",
      });
    }

    // Find the match and related items
    const match = await Match.findById(matchId)
      .populate("lostItem", "owner title")
      .populate("foundItem", "owner title");

    if (!match) {
      return res.status(404).json({
        message: "Match not found.",
      });
    }

    // Chat is only available for confirmed matches
    if (match.status !== "confirmed") {
      return res.status(400).json({
        message: "Chat is only available for confirmed matches.",
      });
    }

    const userId = req.user._id.toString();

    const lostOwner = match.lostItem.owner.toString();
    const foundOwner = match.foundItem.owner.toString();

    // Make sure the logged-in user belongs to this match
    if (userId !== lostOwner && userId !== foundOwner) {
      return res.status(403).json({
        message: "You are not authorized to access this chat.",
      });
    }

    // Check whether a chat already exists
    let chat = await Chat.findOne({
      match: match._id,
    }).populate("participants", "name email avatar");

    // If chat doesn't exist, create it
    if (!chat) {
      chat = await Chat.create({
        match: match._id,
        participants: [match.lostItem.owner, match.foundItem.owner],
      });

      chat = await Chat.findById(chat._id).populate(
        "participants",
        "name email avatar"
      );
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error("Create/get chat error:", error);

    return res.status(500).json({
      message: "Unable to create or fetch chat.",
    });
  }
};

// =====================================================
// GET ALL CHATS FOR CURRENT USER
// =====================================================
export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "name email avatar")
      .populate({
        path: "match",
        populate: [
          {
            path: "lostItem",
            select: "title image status owner",
          },
          {
            path: "foundItem",
            select: "title image status owner",
          },
        ],
      })
      .sort({
        lastMessageAt: -1,
        createdAt: -1,
      });

    return res.status(200).json(chats);
  } catch (error) {
    console.error("Get my chats error:", error);

    return res.status(500).json({
      message: "Unable to fetch chats.",
    });
  }
};

// =====================================================
// GET MESSAGES FOR A CHAT
// =====================================================
export const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found.",
      });
    }

    const userId = req.user._id.toString();

    // Only participants can view messages
    const isParticipant = chat.participants.some(
      (participant) => participant.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not authorized to access this chat.",
      });
    }

    const messages = await Message.find({
      chat: chat._id,
    })
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get chat messages error:", error);

    return res.status(500).json({
      message: "Unable to fetch messages.",
    });
  }
};

// =====================================================
// SEND MESSAGE
// =====================================================
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty.",
      });
    }

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found.",
      });
    }

    const userId = req.user._id.toString();

    // Check whether sender belongs to the chat
    const isParticipant = chat.participants.some(
      (participant) => participant.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not authorized to send messages in this chat.",
      });
    }

    // Get the other participant
    const receiver = chat.participants.find(
      (participant) => participant.toString() !== userId
    );

    if (!receiver) {
      return res.status(400).json({
        message: "Unable to determine message receiver.",
      });
    }

    // Check match status
    const match = await Match.findById(chat.match);

    if (!match) {
      return res.status(404).json({
        message: "Associated match not found.",
      });
    }

    if (match.status !== "confirmed") {
      return res.status(400).json({
        message: "Messages can only be sent for confirmed matches.",
      });
    }

    // Create message
    const message = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      receiver,
      text: text.trim(),
    });

    // Update chat preview
    chat.lastMessage = text.trim();
    chat.lastMessageAt = new Date();

    await chat.save();

    // Return populated message
const populatedMessage = await Message.findById(message._id)
  .populate("sender", "name email avatar")
  .populate("receiver", "name email avatar");

// Send the message to everyone currently inside this chat room
io.to(chat._id.toString()).emit(
  "newMessage",
  populatedMessage
);

return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      message: "Unable to send message.",
    });
  }
};

// =====================================================
// MARK CHAT MESSAGES AS READ
// =====================================================
export const markMessagesAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found.",
      });
    }

    const userId = req.user._id.toString();

    const isParticipant = chat.participants.some(
      (participant) => participant.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not authorized to access this chat.",
      });
    }

    await Message.updateMany(
      {
        chat: chat._id,
        receiver: req.user._id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    return res.status(200).json({
      message: "Messages marked as read.",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);

    return res.status(500).json({
      message: "Unable to mark messages as read.",
    });
  }
};