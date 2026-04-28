import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { FiSend, FiX, FiLoader } from 'react-icons/fi';

export default function ChatWindow({ conversation, onClose }) {
  const { currentUser } = useSelector((s) => s.user);
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);

  const convId = conversation._id;

  // ── Load history ────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch(`/api/chat/conversations/${convId}/messages`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMessages(d.messages);
        else setError('Could not load messages.');
      })
      .catch(() => setError('Could not load messages.'))
      .finally(() => setLoading(false));
  }, [convId]);

  // ── Socket: join room & listen ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_conversation', { conversationId: convId });

    const onNewMessage = (msg) => {
      setMessages((prev) => {
        // Avoid duplicates (optimistic + socket echo)
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const onTyping = () => setOtherTyping(true);
    const onStopTyping = () => setOtherTyping(false);

    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onTyping);
    socket.on('user_stopped_typing', onStopTyping);

    return () => {
      socket.emit('leave_conversation', { conversationId: convId });
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onTyping);
      socket.off('user_stopped_typing', onStopTyping);
    };
  }, [socket, convId]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  // ── Typing indicator helpers ─────────────────────────────────────────────────
  const emitTyping = useCallback(() => {
    if (!socket) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { conversationId: convId });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stop_typing', { conversationId: convId });
    }, 1500);
  }, [socket, convId]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);

    // Clear typing indicator immediately
    clearTimeout(typingTimer.current);
    isTypingRef.current = false;
    socket?.emit('stop_typing', { conversationId: convId });

    if (socket?.connected) {
      // Optimistic local update
      const tempMsg = {
        _id: `temp-${Date.now()}`,
        conversationId: convId,
        senderId: currentUser._id,
        text: trimmed,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };
      setMessages((prev) => [...prev, tempMsg]);
      setText('');
      socket.emit('send_message', { conversationId: convId, text: trimmed });
      setSending(false);
    } else {
      // REST fallback
      try {
        const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text: trimmed }),
        });
        const data = await res.json();
        if (data.success) {
          setMessages((prev) => [...prev, data.message]);
          setText('');
        }
      } catch {
        setError('Failed to send message.');
      } finally {
        setSending(false);
      }
    }
  }, [text, sending, socket, convId, currentUser._id]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherName =
    currentUser._id === conversation.buyerId
      ? `Owner`
      : `Buyer`;

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className='flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 bg-emerald-700 text-white'>
        <div>
          <p className='font-semibold text-sm truncate max-w-[200px]'>
            {conversation.listingName}
          </p>
          <p className='text-xs text-emerald-200'>{otherName}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className='p-1 rounded-full hover:bg-emerald-600 transition'
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-50'>
        {loading && (
          <div className='flex justify-center mt-10'>
            <FiLoader className='animate-spin text-emerald-600' size={24} />
          </div>
        )}
        {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

        {!loading &&
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm
                    ${isMine
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                    } ${msg._optimistic ? 'opacity-70' : ''}`}
                >
                  <p className='break-words'>{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isMine ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}

        {/* Typing indicator */}
        {otherTyping && (
          <div className='flex justify-start'>
            <div className='bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm'>
              <div className='flex gap-1 items-center h-4'>
                <span className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]' />
                <span className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]' />
                <span className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]' />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className='flex items-end gap-2 px-3 py-3 border-t border-slate-200 bg-white'>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            emitTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder='Type a message...'
          className='flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition max-h-28 overflow-y-auto'
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className='flex-shrink-0 p-2.5 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition'
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
}
