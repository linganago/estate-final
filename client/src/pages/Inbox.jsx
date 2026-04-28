import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ChatWindow from '../components/ChatWindow';
import { FiMessageSquare, FiLoader } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';

export default function Inbox() {
  const { currentUser } = useSelector((s) => s.user);
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chat/conversations', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setConversations(d.conversations);
      })
      .finally(() => setLoading(false));
  }, []);

  // Update conversation list when a new message arrives
  useEffect(() => {
    if (!socket) return;
    const handler = ({ conversationId, lastMessage, lastMessageAt }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, lastMessage, lastMessageAt } : c
        )
      );
    };
    socket.on('conversation_updated', handler);
    return () => socket.off('conversation_updated', handler);
  }, [socket]);

  const formatDate = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString();
  };

  const getUnread = (conv) =>
    currentUser._id === conv.buyerId ? conv.buyerUnread : conv.ownerUnread;

  return (
    <div className='max-w-5xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
        <FiMessageSquare className='text-emerald-600' />
        Messages
      </h1>

      <div className='flex gap-6 h-[70vh]'>
        {/* Sidebar */}
        <div className='w-full max-w-xs flex-shrink-0 overflow-y-auto border border-slate-200 rounded-2xl bg-white shadow-sm'>
          {loading && (
            <div className='flex justify-center p-6'>
              <FiLoader className='animate-spin text-emerald-600' size={22} />
            </div>
          )}
          {!loading && conversations.length === 0 && (
            <p className='text-slate-500 text-sm p-6 text-center'>No conversations yet.</p>
          )}
          {conversations.map((conv) => {
            const unread = getUnread(conv);
            const isActive = active?._id === conv._id;
            return (
              <button
                key={conv._id}
                onClick={() => setActive(conv)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition
                  ${isActive ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''}`}
              >
                <div className='flex justify-between items-start gap-2'>
                  <p className='text-sm font-semibold text-slate-800 truncate'>
                    {conv.listingName}
                  </p>
                  <span className='text-xs text-slate-400 flex-shrink-0'>
                    {formatDate(conv.lastMessageAt)}
                  </span>
                </div>
                <div className='flex justify-between items-center mt-0.5'>
                  <p className='text-xs text-slate-500 truncate max-w-[160px]'>
                    {conv.lastMessage || 'Start the conversation'}
                  </p>
                  {unread > 0 && (
                    <span className='ml-2 flex-shrink-0 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center'>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat panel */}
        <div className='flex-1'>
          {active ? (
            <ChatWindow conversation={active} />
          ) : (
            <div className='flex flex-col items-center justify-center h-full text-slate-400 border border-dashed border-slate-300 rounded-2xl'>
              <FiMessageSquare size={40} className='mb-3' />
              <p className='text-sm'>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
