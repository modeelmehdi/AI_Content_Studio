interface InputProps {
  label: string;
  type?: string;
  placeholder?: string;
}

export default function Input({
  label,
  type = "text",
  placeholder,
}: InputProps) {
  return (
    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}