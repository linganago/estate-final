import { FaSearch } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import AppImage from './AppImage';
import { useSocket } from '../context/SocketContext';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';
  const isInbox = location.pathname === '/inbox';
  const { socket } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', searchTerm);
    navigate(`/search?${urlParams.toString()}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    setSearchTerm(searchTermFromUrl || '');
  }, [location.search]);

  // Fetch initial unread count whenever user logs in
  useEffect(() => {
    if (!currentUser) {
      setTotalUnread(0);
      return;
    }
    fetch('/api/chat/conversations', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        const unread = d.conversations.reduce((sum, conv) => {
          return sum + (currentUser._id === conv.buyerId ? conv.buyerUnread : conv.ownerUnread);
        }, 0);
        setTotalUnread(unread);
      })
      .catch(() => {});
  }, [currentUser?._id]);

  // Clear badge when user opens the inbox
  useEffect(() => {
    if (isInbox) setTotalUnread(0);
  }, [isInbox]);

  // Increment badge in real time when a new message arrives
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      if (!window.location.pathname.includes('/inbox')) {
        setTotalUnread((prev) => prev + 1);
      }
    };
    socket.on('conversation_updated', handler);
    return () => socket.off('conversation_updated', handler);
  }, [socket]);

  return (
    <header className='sticky top-0 z-40 border-b border-white/60 bg-white/80 shadow-sm backdrop-blur-xl'>
      <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6'>
        <Link
          to='/'
          className='rounded-full border border-emerald-100 bg-white/90 px-4 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
        >
          <h1 className='flex items-center gap-2 text-base font-bold tracking-wide text-slate-800 sm:text-lg'>
            <span className='rounded-full bg-emerald-100 px-2 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.28em] text-emerald-700'>
              Estate
            </span>
            <span>
              <span className='text-slate-500'>Nest</span>
              <span className='text-slate-800'>Quest</span>
            </span>
          </h1>
        </Link>

        <form
          onSubmit={handleSubmit}
          role='search'
          className='order-3 flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm sm:order-none sm:ml-auto sm:max-w-md'
        >
          <label htmlFor='global-search' className='sr-only'>
            Search listings
          </label>
          <input
            id='global-search'
            type='text'
            placeholder='Search by title, area, or keyword'
            className='w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type='submit'
            aria-label='Search'
            className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-emerald-700'
          >
            <FaSearch className='text-sm' />
          </button>
        </form>

        <nav aria-label='Primary' className='ml-auto'>
          <ul className='flex items-center gap-2 sm:gap-3'>
            <li>
              <Link
                to='/'
                aria-current={isHome ? 'page' : undefined}
                className={`hidden rounded-full px-3 py-2 text-sm font-medium transition sm:inline-flex ${
                  isHome
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to='/about'
                aria-current={isAbout ? 'page' : undefined}
                className={`hidden rounded-full px-3 py-2 text-sm font-medium transition sm:inline-flex ${
                  isAbout
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                About
              </Link>
            </li>

            {/* Messages link with unread notification bubble */}
            {currentUser && (
              <li>
                <Link
                  to='/inbox'
                  className='relative hidden rounded-full px-3 py-2 text-sm font-medium transition sm:inline-flex text-slate-700 hover:bg-slate-100'
                >
                  Messages
                  {totalUnread > 0 && (
                    <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow'>
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </Link>
              </li>
            )}

            <li>
              <Link
                to='/profile'
                className='inline-flex items-center justify-center rounded-full'
                aria-label={currentUser ? 'Open profile' : 'Sign in'}
              >
                {currentUser ? (
                  <AppImage
                    className='h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm'
                    src={currentUser?.avatar}
                    alt={`${currentUser.username || 'User'} avatar`}
                    fallback='avatar'
                    width={80}
                    height={80}
                  />
                ) : (
                  <span className='rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700'>
                    Sign in
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}