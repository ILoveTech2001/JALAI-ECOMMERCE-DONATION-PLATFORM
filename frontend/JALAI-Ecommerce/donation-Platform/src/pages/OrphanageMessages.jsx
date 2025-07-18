import React, { useState } from "react";
import Sidebar from "../components/Orphanage/sidebar";

const OrphanageMessages = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      name: "Emeka Obi",
      email: "emeka@example.com",
      message: "Hello, I have some books and clothes to donate.",
      direction: "received",
    },
    {
      id: 2,
      name: "Grace Adeniyi",
      email: "grace.ad@gmail.com",
      message: "Hi, I’d like to know if you accept food donations.",
      direction: "received",
    },
    {
      id: 3,
      name: "Grace Adeniyi",
      email: "grace.ad@gmail.com",
      message: "Yes, we accept food donations. Thank you!",
      direction: "sent",
    },
  ]);
  const [replyTo, setReplyTo] = useState(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [editMsgId, setEditMsgId] = useState(null);
  const [editMsg, setEditMsg] = useState("");

  // Handle reply form submit
  const handleReply = (e) => {
    e.preventDefault();
    // For demo: open mail client
    window.location.href = `mailto:${replyTo.email}?subject=Reply from Orphanage&body=${encodeURIComponent(
      replyMsg
    )}`;
    // Add to messages as "sent"
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: replyTo.name,
        email: replyTo.email,
        message: replyMsg,
        direction: "sent",
      },
    ]);
    setReplyTo(null);
    setReplyMsg("");
  };

  // Handle edit submit
  const handleEdit = (e) => {
    e.preventDefault();
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === editMsgId ? { ...msg, message: editMsg } : msg
      )
    );
    setEditMsgId(null);
    setEditMsg("");
  };

  // Handle delete
  const handleDelete = (id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 md:ml-64 transition-all">
        {/* Topbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:w-40 md:w-72 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600 hover:text-green-600 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              HO
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Inbox & Sent</h3>
          <ul className="space-y-6">
            {messages.map((msg) => (
              <li key={msg.id} className="border-b pb-4 border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {msg.name}{" "}
                      <span
                        className={`ml-2 text-xs ${
                          msg.direction === "sent"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {msg.direction === "sent" ? "Sent" : "Received"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">{msg.email}</p>
                    {editMsgId === msg.id ? (
                      <form onSubmit={handleEdit}>
                        <textarea
                          className="w-full border rounded p-2 mb-2"
                          rows={3}
                          value={editMsg}
                          onChange={(e) => setEditMsg(e.target.value)}
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 text-sm"
                            onClick={() => setEditMsgId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-gray-700 mb-2">{msg.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {msg.direction === "received" && (
                      <button
                        onClick={() => {
                          setReplyTo(msg);
                          setReplyMsg("");
                        }}
                        className="inline-block text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Reply
                      </button>
                    )}
                    {msg.direction === "sent" && (
                      <button
                        onClick={() => {
                          setEditMsgId(msg.id);
                          setEditMsg(msg.message);
                        }}
                        className="inline-block text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="inline-block text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Reply Modal */}
        {replyTo && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-green-600 text-xl"
                onClick={() => setReplyTo(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">
                Reply to {replyTo.name}
              </h4>
              <form onSubmit={handleReply}>
                <textarea
                  className="w-full border rounded p-2 mb-4"
                  rows={5}
                  value={replyMsg}
                  onChange={(e) => setReplyMsg(e.target.value)}
                  placeholder="Type your message..."
                  required
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrphanageMessages;
