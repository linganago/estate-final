import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ChatWindow from './ChatWindow';
import { FiMessageSquare, FiMail } from 'react-icons/fi';

export default function Contact({ listing }) {
  const { currentUser } = useSelector((s) => s.user);
  const navigate = useNavigate();

  const [landlord, setLandlord] = useState(null);
  const [mailMessage, setMailMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the owner's public info (username + email) for the mailto link
  useEffect(() => {
    if (!listing.userRef) return;
    fetch(`/api/user/contact/${listing.userRef}`)
      .then((r) => r.json())
      .then((d) => setLandlord(d))
      .catch(() => {});
  }, [listing.userRef]);

  const handleOpenChat = async () => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    if (currentUser._id === listing.userRef) return;

    setChatLoading(true);
    setError('');
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          listingId: listing._id,
          listingName: listing.name,
          ownerId: listing.userRef,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConversation(data.conversation);
      } else {
        setError(data.message || 'Could not start chat');
      }
    } catch {
      setError('Could not start chat. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  // Owner viewing their own listing — show nothing
  if (currentUser?._id === listing.userRef) {
    return <p className='text-xs text-slate-400 text-center'>This is your listing</p>;
  }

  // Chat window is open — show it full width
  if (conversation) {
    return (
      <div className='h-[420px]'>
        <ChatWindow
          conversation={conversation}
          onClose={() => setConversation(null)}
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      {landlord && (
        <p className='text-sm leading-6 text-slate-600'>
          Contact <span className='font-semibold'>{landlord.username}</span> for{' '}
          <span className='font-semibold'>{listing.name.toLowerCase()}</span>
        </p>
      )}

      {error && <p className='text-red-500 text-sm'>{error}</p>}

      {/* ── Real-time chat ── */}
      <button
        onClick={handleOpenChat}
        disabled={chatLoading}
        className='flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <FiMessageSquare size={16} />
        {chatLoading ? 'Connecting...' : 'Chat with Owner'}
      </button>

      {/* ── Divider ── */}
      <div className='flex items-center gap-2'>
        <div className='flex-1 h-px bg-slate-200' />
        <span className='text-xs text-slate-400'>or</span>
        <div className='flex-1 h-px bg-slate-200' />
      </div>

      {/* ── Mailto (traditional) ── */}
      {landlord && (
        <div className='flex flex-col gap-2'>
          <textarea
            rows={2}
            value={mailMessage}
            onChange={(e) => setMailMessage(e.target.value)}
            placeholder='Write a message to send by email...'
            className='w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white text-sm resize-none'
          />
          <a
            href={`mailto:${landlord.email}?subject=${encodeURIComponent(
              `Regarding ${listing.name}`
            )}&body=${encodeURIComponent(mailMessage)}`}
            className='flex items-center justify-center gap-2 rounded-full border border-emerald-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 transition hover:bg-emerald-50'
          >
            <FiMail size={16} />
            Send Email
          </a>
        </div>
      )}
    </div>
  );
}
