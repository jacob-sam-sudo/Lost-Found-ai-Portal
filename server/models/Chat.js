import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    // The match this chat belongs to
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      unique: true,
    },

    // The two users involved in the match
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Last message for displaying chat previews
    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;