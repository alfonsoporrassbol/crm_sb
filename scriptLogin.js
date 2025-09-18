<script>
  $(document).ready(function() {
        let isLoading = false;
        function initializeApp() {
            setupEventListeners();
            setupFormValidation();
            setupAnimations();
        }

        // Configurar event listeners
        function setupEventListeners() {
            $('#button_Autenticar').on('click', handleAuthentication);
            $('#button_Login').on('click', handleLogin);

            $('#User').on('input blur', validateUser).on('focus', () => clearFeedback('User'));
            $('#Contraseña').on('input blur', validatePassword).on('focus', () => clearFeedback('Contraseña'));

            $('#Forgot_Password').on('click', handleForgotPassword);
            $('.signup-btn').on('click', handleSignup);
            $('.password-toggle').on('click', togglePassword);
        }

        // Manejar autenticación
        function handleAuthentication() {
            const userInput = $('#User');
            const userValue = userInput.val().trim();
            if (!userValue) {
                showInputFeedback('User', 'Por favor ingrese su usuario o email', 'error');
                userInput.focus();
                return;
            }
            if (!validateUserFormat(userValue)) {
                showInputFeedback('User', 'Formato de usuario o email inválido', 'error');
                return;
            }
            setButtonLoading('button_Autenticar', true);
            google.script.run.withFailureHandler().withSuccessHandler(function(response){
              setButtonLoading('button_Autenticar', false);
              showPasswordField();
              userInput.prop("disabled",true);
              showSuccessMessage();
              showInputFeedback('User', 'Usuario verificado correctamente', 'success');
              setTimeout(() => $('#Contraseña').focus(), 300);
            }).getAuthTableUser(userValue);
            
        }

        // Manejar login
        function handleLogin() {
            let overlay = $('#segurosBolivarModernOverlay');
            const userInput = $('#User');
            userInput.prop('disabled',false);
            const userValue = userInput.val().trim();
            const passwordInput = $('#Contraseña');
            const passwordValue = passwordInput.val().trim();

            if (!passwordValue) {
                showInputFeedback('Contraseña', 'Por favor ingrese su contraseña', 'error');
                passwordInput.focus();
                return;
            }

            setButtonLoading('button_Login', true);
            google.script.run.withFailureHandler().withSuccessHandler(function (data){
              let sectionAside = $("#sidenav-main"); 
              let sectionMain = $(".main-content");
              let sectionLogin = $("#Seccion_Login");
              sectionMain.prop('hidden',false);
              sectionAside.prop('hidden',false);
              sectionLogin.prop('hidden',true);
              overlay.removeClass('is-visible');
              createPrimaryTable(data[1]);
              showModernToast('success', '¡Bienvenido!', 'Todo listo para comenzar la gestión.','toast-bottom-right');
              setButtonLoading('button_Login', false);
            }).validateCode(passwordValue,userValue);
            
        }

        // Validar usuario
        function validateUser() {
            const userValue = $(this).val().trim();
            if (!userValue) {
                clearFeedback('User');
                return false;
            }
            if (validateUserFormat(userValue)) {
                showInputFeedback('User', 'Formato válido', 'success');
                return true;
            } else {
                showInputFeedback('User', 'Formato de usuario o email inválido', 'error');
                return false;
            }
        }

        // Validar formato de usuario
        function validateUserFormat(user) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            return emailRegex.test(user) || usernameRegex.test(user);
        }

        // Validar contraseña
        function validatePassword() {
            const passwordValue = $(this).val();
            if (!passwordValue) {
                clearFeedback('Contraseña');
                updatePasswordStrength(0);
                return false;
            }
            const strength = calculatePasswordStrength(passwordValue);
            updatePasswordStrength(strength);

            if (strength >= 60) {
                showInputFeedback('Contraseña', 'Código seguro', 'success');
                return true;
            }  else {
                showInputFeedback('Contraseña', 'Código débil', 'error');
                return false;
            }
        }

        // Calcular fortaleza de contraseña
        function calculatePasswordStrength(password) {
            let strength = 0;
            if (password.length >= 6) strength += 25;
            if (password.length >= 12) strength += 15;
            if (/[A-Z]/.test(password)) strength += 20;
            if (/[a-z]/.test(password)) strength += 20;
            if (/[0-9]/.test(password)) strength += 20;
            if (/[^A-Za-z0-9]/.test(password)) strength += 20;
            return Math.min(strength, 100);
        }

        // Actualizar indicador de fortaleza
        function updatePasswordStrength(strength) {
            const strengthFill = $('.strength-fill');
            const strengthText = $('.strength-text');
            
            strengthFill.css('width', strength + '%');
            
            if (strength === 0) {
                strengthText.text('');
                strengthFill.css('background', '#e9ecef');
            } else if (strength < 30) {
                strengthText.text('Débil');
                strengthFill.css('background', '#dc3545');
            } else if (strength < 60) {
                strengthText.text('Moderada');
                strengthFill.css('background', '#ffc107');
            } else {
                strengthText.text('Segura');
                strengthFill.css('background', '#28a745');
            }
        }

        // Mostrar campo de contraseña
        function showPasswordField() {
            $('#Div_Input_Contraseña').fadeIn();
            $('#form-options').delay(100).fadeIn();
            $('#Div_button_Login').delay(200).fadeIn();
            $('#Div_button_Autenticar').hide();
            $('#Forgot_Password').show();
        }

        // Mostrar feedback en inputs
        function showInputFeedback(inputId, message, type) {
            const input = $('#' + inputId);
            const container = input.closest('.form-group-modern');
            let feedback = container.find('.input-feedback');
            
            if (feedback.length === 0) {
                feedback = $('<div class="input-feedback"></div>').appendTo(container);
            }

            feedback.text(message).removeClass('success error warning').addClass(type);
            input.removeClass('is-valid is-invalid is-warning');

            if (type === 'success') input.addClass('is-valid');
            else if (type === 'error') input.addClass('is-invalid');
            else if (type === 'warning') input.addClass('is-warning');
        }

        // Limpiar feedback
        function clearFeedback(inputId) {
            const input = $('#' + inputId);
            const container = input.closest('.form-group-modern');
            container.find('.input-feedback').text('').removeClass('success error warning');
            input.removeClass('is-valid is-invalid is-warning');
        }

        // Configurar estado de carga del botón
        function setButtonLoading(buttonId, loading) {
            const button = $('#' + buttonId);
            isLoading = loading;
            button.prop('disabled', loading);
            if (loading) {
                button.addClass('loading');
            } else {
                button.removeClass('loading');
            }
        }

        // Manejar olvido de contraseña
        function handleForgotPassword(e) {
            e.preventDefault();
            console.log('🔑 Recuperación de contraseña solicitada');
            alert('Funcionalidad de recuperación de contraseña en desarrollo');
        }

        // Manejar registro
        function handleSignup(e) {
            e.preventDefault();
            console.log('📝 Registro de nuevo usuario solicitado');
            alert('Funcionalidad de registro en desarrollo');
        }

        // Toggle de contraseña
        function togglePassword() {
            const passwordInput = $('#Contraseña');
            const icon = $(this).find('i');
            
            if (passwordInput.attr('type') === 'password') {
                passwordInput.attr('type', 'text');
                icon.removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                passwordInput.attr('type', 'password');
                icon.removeClass('fa-eye-slash').addClass('fa-eye');
            }
        }

        // Configurar validación del formulario
        function setupFormValidation() {
            $('.login-form').on('submit', e => e.preventDefault());
        }

        // Configurar animaciones
        function setupAnimations() {
            const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        $(entry.target).css('animation-play-state', 'running');
                    }
                });
            }, observerOptions);

            $('[style*="animation"]').each(function() {
                if ($(this).css('animation-name') !== 'none') {
                    $(this).css('animation-play-state', 'paused');
                    observer.observe(this);
                }
            });
        }

        // Mostrar mensaje de éxito
        function showSuccessMessage() {
            const overlay = $('<div>').css({
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(1, 138, 70, 0.95)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 9999
            }).hide().appendTo('body').fadeIn(500);

            const successContent = $('<div>').css({
                textAlign: 'center', color: 'white'
            }).html(`
                <div style="font-size: 4rem; margin-bottom: 1rem;"><i class="fas fa-check-circle"></i></div>
                <h2 style="font-family: 'Poppins', sans-serif; font-weight: 600; margin-bottom: 0.5rem;">¡Código OTP enviado!</h2>
                <p style="font-size: 1.1rem; opacity: 0.9;">Hemos enviado el código de verificación a tu correo electrónico. Revisa tu bandeja de entrada.</p>
            `).css({opacity: 0, transform: 'translateY(30px)'}).appendTo(overlay)
              .animate({opacity: 1, transform: 'translateY(0)'}, 600);

            setTimeout(() => {
                overlay.fadeOut(500, () => overlay.remove());
            }, 2500);
        }

        // Inyectar estilos dinámicos para feedback
        const dynamicStyles = `
            .form-control-modern.is-valid { border-color: #28a745; box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1); }
            .form-control-modern.is-invalid { border-color: #dc3545; box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1); }
            .form-control-modern.is-warning { border-color: #ffc107; box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1); }
            .input-feedback.warning { color: #ffc107; }
        `;
        $('<style>').text(dynamicStyles).appendTo('head');

        // Inicializar la aplicación
        initializeApp();
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