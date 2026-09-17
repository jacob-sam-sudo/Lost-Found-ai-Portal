import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

import {
  getMyChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
} from "../services/chatService";

import { AuthContext } from "../context/AuthContext";

const SOCKET_URL = "http://localhost:5000";

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  /*
   * Convert any MongoDB ID format into a string.
   */
  const getId = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "object" && value._id) {
      return value._id.toString();
    }

    return value.toString();
  };

  /*
   * Current logged-in user's ID.
   */
  const currentUserId = getId(user?._id || user?.id);

  /*
   * Scroll to the latest message.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  /*
   * Load chat and messages.
   */
  const loadChat = async () => {
    try {
      setLoading(true);
      setError("");

      const chats = await getMyChats();

      const currentChat = chats.find(
        (item) => getId(item._id) === getId(chatId)
      );

      if (!currentChat) {
        setError("Chat not found.");
        return;
      }

      setChat(currentChat);

      const chatMessages = await getChatMessages(chatId);

      setMessages(chatMessages);

      await markMessagesAsRead(chatId);
    } catch (error) {
      console.error("Load chat error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load chat."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Load chat whenever chat ID changes
   * or the authenticated user becomes available.
   */
  useEffect(() => {
    if (chatId && currentUserId) {
      loadChat();
    }
  }, [chatId, currentUserId]);

  /*
   * Socket.IO real-time connection.
   */
  useEffect(() => {
    if (!chatId || !currentUserId) {
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(
        "Connected to chat server:",
        socket.id
      );

      socket.emit("joinChat", chatId);
    });

    /*
     * Receive a message in real time.
     */
    socket.on("newMessage", (message) => {
      console.log(
        "New real-time message:",
        message
      );

      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (existingMessage) =>
            getId(existingMessage._id) ===
            getId(message._id)
        );

        if (alreadyExists) {
          return currentMessages;
        }

        return [...currentMessages, message];
      });

      /*
       * If the received message is for the
       * current user, mark it as read.
       */
      const receiverId = getId(
        message.receiver
      );

      if (receiverId === currentUserId) {
        markMessagesAsRead(chatId).catch(
          (error) => {
            console.error(
              "Mark message as read error:",
              error
            );
          }
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(
        "Disconnected from chat server"
      );
    });

    socket.on("connect_error", (error) => {
      console.error(
        "Socket connection error:",
        error.message
      );
    });

    return () => {
      socket.emit("leaveChat", chatId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [chatId, currentUserId]);

  /*
   * Scroll whenever messages change.
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /*
   * Send message.
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const messageText = text.trim();

    if (!messageText || sending) {
      return;
    }

    try {
      setSending(true);

      const newMessage = await sendMessage(
        chatId,
        messageText
      );

      /*
       * REST returns the message immediately.
       * Socket.IO will also broadcast it, so
       * prevent duplicates here.
       */
      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (message) =>
            getId(message._id) ===
            getId(newMessage._id)
        );

        if (alreadyExists) {
          return currentMessages;
        }

        return [
          ...currentMessages,
          newMessage,
        ];
      });

      setText("");

      setChat((currentChat) =>
        currentChat
          ? {
              ...currentChat,
              lastMessage: messageText,
              lastMessageAt: new Date(),
            }
          : currentChat
      );
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * Enter = send
   * Shift + Enter = new line
   */
  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  /*
   * Find the OTHER participant.
   *
   * This is the important fix.
   */
  const otherUser =
    chat?.participants?.find(
      (participant) =>
        getId(participant._id) !==
        currentUserId
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-600">
          Loading chat...
        </p>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
            ⚠️
          </div>

          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Unable to open chat
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "This chat could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/matches")
            }
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to My Matches
          </button>
        </div>
      </div>
    );
  }

  const lostItem = chat.match?.lostItem;
  const foundItem = chat.match?.foundItem;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="mx-auto max-w-4xl">

        {/* Back button */}
        <Link
          to="/matches"
          className="mb-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back to My Matches
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* ================= HEADER ================= */}

          <div className="border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-4">

              <div className="flex min-w-0 items-center gap-3">

                {/* OTHER USER AVATAR */}
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100">

                  {otherUser?.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={
                        otherUser.name ||
                        "User"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-indigo-600">
                      {otherUser?.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "U"}
                    </span>
                  )}

                </div>

                <div className="min-w-0">

                  <h1 className="truncate text-lg font-bold text-slate-900">
                    {otherUser?.name ||
                      "Other User"}
                  </h1>

                  <p className="text-xs text-slate-500">
                    Lost & Found Conversation
                  </p>

                </div>

              </div>

              <span className="hidden rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 sm:block">
                ✓ Confirmed Match
              </span>

            </div>
          </div>

          {/* ================= RELATED ITEMS ================= */}

          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">

            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Related Items
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              {/* LOST ITEM */}

              <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-white p-3">

                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">

                  {lostItem?.image ? (
                    <img
                      src={lostItem.image}
                      alt={lostItem.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl">
                      📷
                    </div>
                  )}

                </div>

                <div className="min-w-0">

                  <span className="text-[10px] font-bold uppercase tracking-wide text-red-600">
                    Lost
                  </span>

                  <p className="truncate text-sm font-semibold text-slate-800">
                    {lostItem?.title ||
                      "Lost Item"}
                  </p>

                </div>

              </div>

              {/* FOUND ITEM */}

              <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-white p-3">

                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">

                  {foundItem?.image ? (
                    <img
                      src={foundItem.image}
                      alt={foundItem.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl">
                      📷
                    </div>
                  )}

                </div>

                <div className="min-w-0">

                  <span className="text-[10px] font-bold uppercase tracking-wide text-green-600">
                    Found
                  </span>

                  <p className="truncate text-sm font-semibold text-slate-800">
                    {foundItem?.title ||
                      "Found Item"}
                  </p>

                </div>

              </div>

            </div>
          </div>

          {/* ================= MESSAGES ================= */}

          <div className="h-[500px] overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">

            {messages.length === 0 ? (

              <div className="flex h-full items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl">
                    💬
                  </div>

                  <h2 className="mt-4 text-lg font-semibold text-slate-800">
                    Start the conversation
                  </h2>

                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Send a message to discuss
                    the item, verify ownership,
                    and arrange the handover.
                  </p>

                </div>

              </div>

            ) : (

              <div className="space-y-3">

                {messages.map(
                  (message) => {

                    /*
                     * IMPORTANT:
                     *
                     * Compare the message sender
                     * against the authenticated
                     * user's ID.
                     */
                    const senderId =
                      getId(
                        message.sender
                      );

                    const isMine =
                      senderId ===
                      currentUserId;

                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[80%] sm:max-w-[65%] ${
                            isMine
                              ? "items-end"
                              : "items-start"
                          }`}
                        >

                          <div
                            className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                              isMine
                                ? "rounded-br-md bg-indigo-600 text-white"
                                : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {message.text}
                          </div>

                          <p
                            className={`mt-1 px-1 text-[10px] text-slate-400 ${
                              isMine
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            {message.createdAt
                              ? new Date(
                                  message.createdAt
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )
                              : ""}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

                <div ref={messagesEndRef} />

              </div>
            )}

          </div>

          {/* ================= MESSAGE INPUT ================= */}

          <form
            onSubmit={handleSendMessage}
            className="border-t border-slate-200 bg-white p-4"
          >

            <div className="flex items-end gap-3">

              <textarea
                value={text}
                onChange={(e) =>
                  setText(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                maxLength={1000}
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="submit"
                disabled={
                  sending ||
                  !text.trim()
                }
                className="flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending
                  ? "Sending..."
                  : "Send"}
              </button>

            </div>

            <div className="mt-2 flex justify-between">

              <p className="text-[11px] text-slate-400">
                Press Enter to send • Shift +
                Enter for a new line
              </p>

              <p className="text-[11px] text-slate-400">
                {text.length}/1000
              </p>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default Chat;