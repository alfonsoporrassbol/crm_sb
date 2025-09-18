<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js" defer></script>
<script>
  
  const icons = {
    success: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>',
    error: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>',
    info: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>',
    warning: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>'
  }; 

  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    "toastClass": "toast-modern",
    "escapeHtml": false,
    "messageClass": "toast-modern-message",
    "titleClass": "toast-modern-title",
  };

  toastr.options.iconClasses = {
    error: 'toast-modern toast-error',
    info: 'toast-modern toast-info',
    success: 'toast-modern toast-success',
    warning: 'toast-modern toast-warning'
  };

  function showModernToast(type, title, message, displayPosition) {
    const defaultOptions = {
        position: displayPosition,
        duration: 5000,
        showIcon: true,
        showProgress: true
    };
    const finalOptions = {...defaultOptions, ...options};
    
    toastr.options.positionClass = finalOptions.position;
    toastr.options.timeOut = finalOptions.duration;
    toastr.options.extendedTimeOut = finalOptions.duration / 5;
    toastr.options.progressBar = finalOptions.showProgress;
    
    let contentHtml = '';
            
    if (finalOptions.showIcon) {
        contentHtml += `<div class="toast-modern-icon">${icons[type] || icons.info}</div>`;
    }
    contentHtml += `<div class="toast-modern-text-wrapper"><div class="toast-modern-title">${title}</div><div class="toast-modern-message">${message}</div></div>`;
    const fullHtml = `<div class="toast-modern-content-wrapper">${contentHtml}</div>`;
    
    // Mostrar el toast y capturar el elemento
    const toast = toastr[type](fullHtml, "");
    
    // Animación con GSAP
    if (toast) {
      const toastElement = toast[0]; // toastr devuelve un jQuery object
      
      // Configuración inicial
      gsap.set(toastElement, {
        opacity: 0,
        y: 50,
        scale: 0.8
      });
      
      // Animación de entrada
      gsap.to(toastElement, {
        duration: 0.6,
        opacity: 1,
        y: 0,
        scale: 1,
        ease: "back.out(1.7)",
        onComplete: () => {
          // Pequeño efecto de "pulse" después de aparecer
          gsap.to(toastElement, {
            duration: 0.4,
            scale: 1.02,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut"
          });
        }
      });
      
      // Animación de salida (cuando se cierra)
      $(toastElement).on('click', function() {
        gsap.to(toastElement, {
          duration: 0.4,
          opacity: 0,
          y: -20,
          scale: 0.9,
          ease: "back.in(1.2)",
          onComplete: () => {
            toastr.clear(toast);
          }
        });
      });
    }
  }

</script>