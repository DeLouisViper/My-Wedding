export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-fadeIn rounded-2xl bg-white p-6 shadow-2xl dark:bg-violet-950">
        <h3 className="mb-2 font-display text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
        <p className="mb-5 text-sm text-gray-600 dark:text-purple-300">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-purple-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-200 dark:hover:bg-violet-900"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}
