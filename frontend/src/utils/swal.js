import Swal from 'sweetalert2';

// Common Toast positioned at top-right (top-end)
export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (toastEl) => {
    toastEl.onmouseenter = Swal.stopTimer;
    toastEl.onmouseleave = Swal.resumeTimer;
  }
});

/**
 * Common Top-Right Success Alert
 */
export const showSuccess = (title, text = '') => {
  return toast.fire({
    icon: 'success',
    title: title,
    ...(text ? { text } : {})
  });
};

/**
 * Common Top-Right Error Alert
 */
export const showError = (title, text = '') => {
  return toast.fire({
    icon: 'error',
    title: typeof title === 'string' ? title : (title?.message || 'Operation failed'),
    ...(text ? { text } : {})
  });
};

/**
 * Common Top-Right Warning Alert
 */
export const showWarning = (title, text = '') => {
  return toast.fire({
    icon: 'warning',
    title: title,
    ...(text ? { text } : {})
  });
};

/**
 * Common Top-Right Info Alert
 */
export const showInfo = (title, text = '') => {
  return toast.fire({
    icon: 'info',
    title: title,
    ...(text ? { text } : {})
  });
};

/**
 * Confirmation dialog using SweetAlert2
 */
export const showConfirm = async (title, text = '', confirmButtonText = 'Yes, Proceed') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true
  });
  return result.isConfirmed;
};

export default {
  toast,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  fire: (...args) => Swal.fire(...args)
};
