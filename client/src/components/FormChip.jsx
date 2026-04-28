export default function FormChip({
  id,
  name,
  type = 'radio',
  checked,
  onChange,
  label,
  description,
}) {
  return (
    <label htmlFor={id} className='block cursor-pointer'>
      <input
        id={id}
        name={name}
        type={type}
        checked={checked}
        onChange={onChange}
        className='peer sr-only'
      />
      <span className='flex min-h-16 flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-checked:text-white peer-focus-visible:border-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-200'>
        <span className='font-semibold'>{label}</span>
        {description && (
          <span className='mt-1 text-xs text-slate-500 peer-checked:text-slate-300'>
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
