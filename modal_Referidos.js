<script>
  $(document).ready(function () {
    lucide.createIcons();
    let isSubmitting = false;
    $("#create_New_Client").on('click',function(){
      $('#modalReferidosOverlay').addClass('modal-referidos-active');
      $('body').css('overflow', 'hidden');
      setTimeout(() => {
        $('#modalReferidosTipoDocumento').focus();
      }, 100);
    });

    $(".modal-referidos-close").on('click',function(){
      $('#modalReferidosOverlay').removeClass('modal-referidos-active');
      $('body').css('overflow', '');
      resetForm();
    })


    setupValidation();
    setupFormatting();

    function setupValidation() {
      $('#modalReferidosClientForm input, #modalReferidosClientForm select').each(function () {
        $(this).on('blur', function () {
          validateField($(this));
        });
        $(this).on('input', function () {
          clearError($(this));
        });
      });
    }

    function setupFormatting() {
      const numericInputs = ['modalReferidosNumeroDocumento', 'modalReferidosNumeroCelular'];
      numericInputs.forEach(id => {
          $('#' + id).on('input', function (e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
          });
      });
      $('#modalReferidosNombreCliente').on('input', function (e) {
          const words = $(this).val().split(' ');
          const capitalizedWords = words.map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          );
          $(this).val(capitalizedWords.join(' '));
      });
    }

    function validateField(field) {
      const value = field.val().trim();
      const fieldName = field.attr('name');
      let isValid = true;
      let errorMessage = '';

      switch (fieldName) {
        case 'modalReferidosTipoDocumento':
          if (!value) {
            isValid = false;
            errorMessage = 'Por favor selecciona un tipo de documento';
          }
        break;
        case 'modalReferidosNumeroDocumento':
          if (!value) {
            isValid = false;
            errorMessage = 'El número de documento es obligatorio';
          } else if (!/^[0-9]{6,12}$/.test(value)) {
            isValid = false;
            errorMessage = 'El documento debe tener entre 6 y 12 dígitos';
          }
        break;
        case 'modalReferidosNombreCliente':
          if (!value) {
            isValid = false;
            errorMessage = 'El nombre es obligatorio';
          } else if (value.length < 3) {
            isValid = false;
            errorMessage = 'El nombre debe tener al menos 3 caracteres';
          } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            isValid = false;
            errorMessage = 'El nombre solo puede contener letras y espacios.';
          }
          break;
        case 'modalReferidosNumeroCelular':
          if (!value) {
            isValid = false;
            errorMessage = 'El número de celular es obligatorio';
          } else if (!/^[0-9]{10}$/.test(value)) {
            isValid = false;
            errorMessage = 'El celular debe tener exactamente 10 dígitos.';
          }
        break;
        case 'modalReferidosCorreoElectronico':
          if (!value) {
            isValid = false;
            errorMessage = 'El correo electrónico es obligatorio';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            errorMessage = 'Por favor ingresa un correo electrónico válido.';
          }
        break;
        case 'modalReferidosTipoProducto':
          if (!value) {
            isValid = false;
            errorMessage = 'Por favor selecciona un tipo de producto.';
          }
        break;
        case 'modalReferidosFuenteReferido':
          if (!value) {
            isValid = false;
            errorMessage = 'Por favor selecciona la fuente del referido.';
          }
        break;
      }
      showError(field, isValid, errorMessage);
      return isValid;
    }

    $("#modalReferidosFuenteReferido").on('change',function(){
      let valueSelected = $(this).val();
      if (valueSelected === "REFERIDO CLIENTE" || valueSelected === "REFERIDO TERCERO") {
        $(".additionalOptions").each(function() {
          $(this).prop('hidden', false);
          $(this).find("input[name='modalReferidosNombreRadicador']").prop('required', true);
        });
      } else {
        $(".additionalOptions").prop('hidden', true);
        $(this).find("input[name='modalReferidosNombreRadicador']").prop('required', false);
      }
    })

    function showError(field, isValid, errorMessage) {
      const errorElement = $('#modal-referidos-error-' + field.attr('name'));
      if (isValid) {
        field.removeClass('modal-referidos-error');
        errorElement.text('').removeClass('modal-referidos-show');
      } else {
        field.addClass('modal-referidos-error');
        errorElement.text(errorMessage).addClass('modal-referidos-show');
      }
    }

    function clearError(field) {
      field.removeClass('modal-referidos-error');
      const errorElement = $('#modal-referidos-error-' + field.attr('name'));
      errorElement.text('').removeClass('modal-referidos-show');
    }

    function validateForm() {
      let isFormValid = true;
      $('#modalReferidosClientForm input, #modalReferidosClientForm select').each(function () {
        if (!validateField($(this))) {
          isFormValid = false;
        }
      });
      return isFormValid;
    }

    $("#modalReferidosClientForm").on('submit',function(e){
      e.preventDefault();
      if (isSubmitting) return;
      if (!validateForm()) {
        const firstError = $('#modalReferidosClientForm .modal-referidos-error').first();
        if (firstError.length > 0) {
          firstError.focus();
        }
        return;
      }
      isSubmitting = true;
      const modalReferidosSubmitBtn = $('#modalReferidosSubmitBtn');
      modalReferidosSubmitBtn.addClass('modal-referidos-btn-loading').prop('disabled', true);
      google.script.run.withFailureHandler(function(e){
        if(String(e).includes("NetworkError")){
          Swal.fire({
            title: 'Error de Conexión 🛜',
            icon: 'error',
            html: 'Verifica la conexión a internet.',
            showCancelButton: false,
            confirmButtonText: `Cerrar&nbsp;<i class="bi bi-x-circle-fill"></i>`,
            customClass: {
              confirmButton: 'Style_Button_Swal_Green2'
            }
          });
        }else{
          Swal.fire({
            title: 'Error de Ejecución',
            icon: 'error',
            html: 'Presentamos fallas en este momento, estamos trabajando para solucionarlo lo más prontoposible.<br> Error: <b>'+e+'</b>',
            showCancelButton: false,
            confirmButtonText: `Cerrar&nbsp;<i class="bi bi-x-circle-fill"></i>`,
            customClass: {
              confirmButton: 'Style_Button_Swal_Green2'
            }
          });
        }
      }).withSuccessHandler(function(data){
        $('#authorsTable').DataTable().destroy();
        createPrimaryTable(data)
        isSubmitting = false;
        resetForm();
        $(".additionalOptions").each(function() {
          $(this).prop('hidden', true);
          $(this).find("input[name='modalReferidosNombreRadicador']").prop('required', false);
        });
        $('#modalReferidosOverlay').removeClass('modal-referidos-active');
        $('.navbar-nav .nav-link').removeClass('active');
        $('#section_Pendientes').addClass('active');
        $("#title_card_totals").html('Total Pendientes');
        $('body').css('overflow', '');
        showModernToast('success', '¡Lead Radicado Correctamente!', 'Todo listo para comenzar la gestión.','toast-bottom-right');
      }).createNewClient(this);
    }) 

    function showSuccess() {
      $('.modal-referidos-client-form').hide();
      $('#modalReferidosFooter').hide();
      $('#modalReferidosSuccessState').addClass('modal-referidos-show');
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }

    function resetForm() {
      $('#modalReferidosClientForm')[0].reset();
      $('#modalReferidosClientForm input, #modalReferidosClientForm select').each(function () {
        clearError($(this));
      });
      $('.modal-referidos-client-form').show();
      $('#modalReferidosFooter').show();
      $('#modalReferidosSuccessState').removeClass('modal-referidos-show');
      isSubmitting = false;
      const modalReferidosSubmitBtn = $('#modalReferidosSubmitBtn');
      modalReferidosSubmitBtn.removeClass('modal-referidos-btn-loading').prop('disabled', false);
    }

    $(document).on('keydown', function (event) {
      if (event.key === 'Escape' && $('#modalReferidosOverlay').hasClass('modal-referidos-active')) {
        closeModal();
      }
      if (event.key === 'Tab' && $('#modalReferidosOverlay').hasClass('modal-referidos-active')) {
        const focusableElements = $('#modalReferidosOverlay button, #modalReferidosOverlay input, #modalReferidosOverlay select, #modalReferidosOverlay textarea');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            $(lastElement).focus();
          }
        } else { 
          if (document.activeElement === lastElement) {
            event.preventDefault();
            $(firstElement).focus();
          }
        }
      }
    });

    function createPrimaryTable(data){
      $('#titleTotalMedida').text(data[2]);
      $('#titleTotalMedida').attr('data-target-number', data[2]);
      $('#titleTotalIntegral').text(data[3]);
      $('#titleTotalIntegral').attr('data-target-number', data[3]);
      $('#titleTotalBienestar').text(data[4]);
      $('#titleTotalBienestar').attr('data-target-number', data[4]);
      $('#titleTotalSalud').text(data[1]);
      $('#titleTotalSalud').attr('data-target-number', data[1]);
      numbersInitialAnimate();
      $('#authorsTable').DataTable({
        data: data[0],
        columns: [
          { title: "Fecha Radicado",
            className: "text-center",
            render: function(data, type, row) {
              return '<p class="text-xs font-weight-bold mb-0">' + data + '</p>';
            } 
          },
          { title: "Prioridad",
            className: "text-center",
            render: function(data, type, row) {
              if (data === "Alta") {
                return '<span class="badge badge-sm bg-cards-priority-high">' + data + '</span>';
              }else if (data === "Media") {
                return '<span class="badge badge-sm bg-cards-priority-medium">' + data + '</span>';
              }else if (data === "Baja") {
                return '<span class="badge badge-sm bg-cards-priority-low">' + data + '</span>';
              }
            } 
          },
          { title: "Segmento",
            className: "text-center",
            render: function(data, type, row) {
              return '<p class="text-xs font-weight-bold mb-0">' + data + '</p>';
            } 
          },
          { title: "Id Solicitud" },
          { title: "Nombre Cliente",
            className: "text-center",
            render: function(data, type, row) {
              return '<p class="text-xs font-weight-bold mb-0">' + data + '</p>';
            } 
          },
          { title: "Teléfono" },
          { title: "Correo" },
          { title: "Tipo Id Cliente" },
          { title: "Id Cliente" },
          { title: "Ciudad" },
          { title: "Estado",
            className: "text-center",
            render: function(data, type, row) {
              return '<p class="text-xs font-weight-bold mb-0">' + data + '</p>';
            } 
          },
          { title: "Línea de Tiempo" },
          { title: "Comentarios" },
          { title: "Veces Gestión" },
          { title: "Detalles Producto" },
          { title: "Subestado" },
          { title: "Detalle Poliza" },
          { title: "Acción",
            className: "text-center",
            render: function(data, type, row, meta) {
              if (data === "") {
                return `<button type="button" onclick="managementClient(${meta.row})" class="btn btn-black btn-rounded color-btn-cta-table"><span class="btn-label"><i class="fa-regular fa-hand-pointer px-2"></i></span>Gestionar</button>`;
              }
              return data;
            }
          }
        ],
        order: [],
        lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
        columnDefs: [
          { targets: [3,5,6,7,8,9,11,12,13,14,15,16], visible: false } 
        ],
        dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rt<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
        language: {
          search: "_INPUT_",
          searchPlaceholder: "Buscar...",
          lengthMenu: "Mostrar _MENU_ registros por página",
          info: "Mostrando _END_ registros de _TOTAL_",
          infoEmpty: "Mostrando registros del 0 al 0 de un total de 0",
          infoFiltered: "(filtrado de _MAX_ registros totales)",
          paginate: {
            first: "Primero",
            last: "Último",
            next: '<svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z"/></svg>',
            previous: '<svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z"/></svg>'
          }
        },
        responsive: true,
        pagingType: "simple_numbers",
        drawCallback: function(settings) {
          $('.dataTables_paginate .pagination').addClass('pagination-sm');
        }
      });
    }

    function numbersInitialAnimate(){
      gsap.from(".modern-card", {
        opacity: 0,          
        y: 0,                
        duration: 1,          
        delay: 0.5,      
        stagger: 0.2,         
        ease: "power3.out"
      });
      gsap.from(".icon-container i", {
        scale: 0.5,           
        opacity: 0,           
        duration: 0.6,        
        delay: 1,             
        stagger: 0.2,         
        ease: "back.out(1.7)"
      });
      gsap.from(".modern-card .numbers h5", {
        opacity: 0, 
        textContent: 0, 
        duration: 2,
        delay: 1.5,
        ease: "power1.out",
        snap: { textContent: 1 },
        stagger: 0.2,
        onUpdate: function() {
          this.targets()[0].textContent = Math.round(this.targets()[0].textContent);
        },
        onComplete: function() {
          const target = this.targets()[0];
          const targetNumber = target.getAttribute('data-target-number');
          target.textContent = targetNumber;
        }
      });
      gsap.to(".modern-card .numbers h5", {
        opacity: 1, 
        duration: 0.5, 
        delay: 1.5, 
        stagger: 0.2
      });
    }
  });
</script>