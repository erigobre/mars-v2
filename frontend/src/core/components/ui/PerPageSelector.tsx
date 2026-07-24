export function PerPageSelector({
  value,
  onChange,
  options = [12, 24, 36, 48],
}: {
  value: number;
  onChange: (val: number) => void;
  options?: number[];
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white font-medium">Mostrar:</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-white bg-transparent
          text-white text-sm font-bold rounded-xl focus:ring-2 focus:ring-white focus:border-theme-secondary 
          block py-2.5 pl-4 pr-10 outline-none cursor-pointer transition-colors hover:bg-white/20 appearance-none 
          bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
          bg-size-[1.2em_1.2em] bg-no-repeat bg-position-[right_0.6rem_center]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-theme-text-dark">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
