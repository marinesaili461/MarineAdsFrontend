// src/Pages/ChatPage.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../Context/ChatContext";
import { AuthContext } from "../Context/AuthContext";
import MessageBubble from "../Components/Chat/MessageBubble";
import ChatAdminPanel from "../Components/Chat/ChatAdminPanel";

const EMOJI_ROWS = [
  ["😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎"],
  ["😍","🥰","😘","😗","😙","😚","🙂","🤗","🤩","🥳","😏","😒"],
  ["😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢"],
  ["😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰"],
  ["😥","😓","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","🙄"],
  ["😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤧"],
  ["🥴","😵","🤠","🥸","😈","👿","💀","☠️","👋","🤚","✋","🖐"],
  ["👍","👎","👏","🙌","🤝","🤜","🤛","✊","👊","🫶","❤️","🔥"],
  ["🎉","🎊","🎈","🎁","🏆","💯","✅","❌","⭐","🌟","💥","💫"],
];

function formatBanTime(expiresAt) {
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return "expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const ChatPage = () => {
  const {
    messages, typingUsers, isClosed, banInfo,
    sendMessage, sendImage, reactToMessage, deleteMessage, sendTyping,
  } = useContext(ChatContext);
  const { user } = useContext(AuthContext);

  const isAdmin = ["admin", "superadmin"].includes(user?.role);

  const [text, setText]             = useState("");
  const [error, setError]           = useState("");
  const [showEmoji, setShowEmoji]   = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const [sending, setSending]       = useState(false);
  const [replyTo, setReplyTo]       = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const bottomRef = useRef(null);
  const fileRef   = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  const handleSend = async () => {
    if (sending) return;
    setError("");
    if (imgPreview) {
      setSending(true);
      try { await sendImage(imgPreview.file); setImgPreview(null); setReplyTo(null); }
      catch (e) { setError(e.message); }
      setSending(false);
      return;
    }
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendMessage(text.trim(), replyTo?._id || null);
      setText(""); setReplyTo(null); setShowEmoji(false);
    } catch (e) { setError(e.message); }
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    else if (e.key === "Escape") setReplyTo(null);
    else sendTyping();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgPreview({ file, url: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const appendEmoji = (emoji) => { setText((t) => t + emoji); inputRef.current?.focus(); };

  const activeBan = banInfo && new Date(banInfo.expiresAt) > Date.now();

  // Unique senders for admin ban panel (keep fullName for admin UI)
  const uniqueSenders = messages.reduce((acc, msg) => {
    const sid = msg.sender?._id;
    if (sid && sid !== user?._id && !acc.find((u) => u._id === sid)) {
      acc.push({ _id: sid, fullName: msg.sender?.fullName || "Unknown" });
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">

      {/* Top Bar */}
      <nav className="w-full bg-orange-400 flex items-center justify-between px-4 py-3 sticky top-0 z-50 shadow shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-white text-base">MarineCash Chat</h2>
          {isClosed && (
            <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
              CLOSED
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="relative bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <i className="fas fa-shield-halved"></i> Admin
            </button>
          )}
          <span className="text-[11px] bg-green-500 text-white px-2 py-1 rounded-full font-bold">
            {isClosed ? "Closed" : "Live"}
          </span>
        </div>
      </nav>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-3 py-3 space-y-3 pb-[90px]">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-10">No messages yet. Say hello! 👋</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender?._id?.toString() === user?._id?.toString();
          return (
            <MessageBubble
              key={msg._id}
              msg={msg}
              isMe={isMe}
              isAdmin={isAdmin}
              userId={user?._id}
              onReact={reactToMessage}
              onDelete={deleteMessage}
              onReply={setReplyTo}
            />
          );
        })}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 pl-10">
            <div className="bg-white rounded-2xl px-3 py-2 text-xs text-gray-400 shadow animate-pulse flex items-center gap-1">
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </span>
              {typingUsers.join(", ")} typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Error toast */}
      {error && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
          {error}
        </div>
      )}

      {/* Ban notice */}
      {activeBan && (
        <div className="fixed bottom-[90px] left-0 right-0 mx-3 bg-red-50 border border-red-300 rounded-2xl p-3 text-center text-xs font-semibold text-red-600 shadow z-40">
          🚫 You are banned from this chat. Ban expires in {formatBanTime(banInfo.expiresAt)}.
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="fixed bottom-[72px] left-0 right-0 bg-white border-t shadow-xl z-40 p-2">
          <div className="max-h-44 overflow-y-auto space-y-1">
            {EMOJI_ROWS.map((row, i) => (
              <div key={i} className="flex gap-1 justify-start flex-wrap">
                {row.map((e) => (
                  <button key={e} onClick={() => appendEmoji(e)} className="text-2xl hover:scale-125 transition-transform p-0.5">
                    {e}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image preview bar */}
      {imgPreview && (
        <div className="fixed bottom-[72px] left-0 right-0 bg-white border-t px-3 py-2 flex items-center gap-3 z-40 shadow">
          <img src={imgPreview.url} alt="preview" className="w-16 h-16 object-cover rounded-xl border" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-700">📷 Image</p>
            <p className="text-[11px] text-gray-400 truncate">{imgPreview.file?.name}</p>
          </div>
          <button onClick={() => setImgPreview(null)} className="text-red-500 text-sm shrink-0">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Reply preview bar */}
      {replyTo && !imgPreview && (
        <div className="fixed bottom-[60px] left-0 right-0 bg-orange-50 border-t border-orange-200 px-3 py-2 flex items-center gap-2 z-40">
          <div className="border-l-4 border-orange-400 pl-2 flex-1 min-w-0">
            <p className="text-[11px] font-bold text-orange-500">
              {replyTo.sender?.fullName?.trim().split(" ")[0] || "Unknown"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {replyTo.type === "image" ? "📷 Image" : replyTo.content}
            </p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-gray-400 shrink-0">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="fixed bottom-0 w-full bg-white border-t flex items-center gap-2 px-2 py-2 z-50 shrink-0">
        <button
          onClick={() => setShowEmoji((s) => !s)}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl shrink-0 transition"
        >
          😊
        </button>
        <label className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer flex items-center justify-center shrink-0 transition">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <i className="fas fa-image text-gray-500"></i>
        </label>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={
            activeBan ? "You are banned..." :
            isClosed && !isAdmin ? "Chatroom is closed..." :
            replyTo ? `Reply to ${replyTo.sender?.fullName?.trim().split(" ")[0] || "message"}...` :
            "Type a message..."
          }
          disabled={activeBan || (isClosed && !isAdmin)}
          className="flex-1 min-w-0 border-2 border-orange-300 focus:border-orange-500 rounded-2xl px-3 py-2 text-sm outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition"
        />
        <button
          onClick={handleSend}
          disabled={sending || activeBan || (isClosed && !isAdmin)}
          className="w-10 h-10 bg-orange-500 hover:bg-orange-600 active:scale-95 transition rounded-full flex items-center justify-center shrink-0 disabled:opacity-50"
        >
          {sending
            ? <i className="fas fa-spinner fa-spin text-white text-sm"></i>
            : <i className="fas fa-paper-plane text-white text-sm"></i>
          }
        </button>
      </div>

      {/* Admin Panel */}
      {showAdminPanel && isAdmin && (
        <ChatAdminPanel
          onClose={() => setShowAdminPanel(false)}
          uniqueSenders={uniqueSenders}
        />
      )}
    </div>
  );
};

export default ChatPage;
