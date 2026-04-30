import AppImage from './AppImage';

export default function AuthShell({ title, children }) {
  return (
    <main className='mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:py-12'>
      <aside className='hidden overflow-hidden rounded-[34px] bg-slate-950 shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/5 lg:block'>
        <div className='relative min-h-[560px]'>
          <AppImage
            alt='NestQuest property preview'
            className='absolute inset-0 h-full w-full object-cover opacity-75'
            width={960}
            height={1120}
            fallback='property'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/5' />
          <div className='absolute inset-x-0 bottom-0 p-8 text-white'>
            <span className='rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]'>
              Estate
            </span>
            <h2 className='mt-5 text-4xl font-semibold'>NestQuest</h2>
            <p className='mt-3 text-sm font-medium uppercase tracking-[0.24em] text-slate-200'>
              Real Estate
            </p>
          </div>
        </div>
      </aside>

      <section className='flex items-center'>
        <div className='w-full rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-8 lg:p-10'>
          <div className='mb-7'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700'>
              Account
            </p>
            <h1 className='mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl'>
              {title}
            </h1>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
