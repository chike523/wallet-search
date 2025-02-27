const WithdrawalButton = ({ coin, status, onClick }) => {
  if (status === 'pending') {
    return (
      <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 rounded-lg">
        Pending
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30 rounded-lg">
        Approved
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30 rounded-lg">
        Rejected
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
    >
      Withdraw
    </button>
  );
};

export default WithdrawalButton;