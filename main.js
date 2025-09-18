<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.datatables.net/v/bs5/dt-2.0.8/datatables.min.js"></script>
<script src="https://cdn.datatables.net/buttons/3.0.2/js/dataTables.buttons.min.js"></script>
<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.bootstrap5.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.html5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>


<!-- //Filtros por Prioridad - Filtro por Base de Datos Priorizada -->

<script>
  let dataRowSelected;
  let dateRecordatory;
  let dataPolizas;
  let sectionSelected = "Pendientes Gestión";
  $(document).ready(function() {
    const PRODUCTS_CONFIG = {
      "Autos": {
        types: ["Individual"],
        detailsByType: {
          "Individual": [
            { value: "PREMIUM+360", label: "Premium + 360" },
            { value: "PREMIUM", label: "Premium" },
            { value: "ESTANDAR", label: "Estándar" },
            { value: "CLASICO", label: "Clásico" },
            { value: "LIGERO", label: "Ligero" },
            { value: "VERDE", label: "Verde" }
          ]
        },
        plansByDetail: {},
        placaVisible: true
      },
      "Salud": {
        types: ["Colectiva", "Individual"],
        detailsByType: {
          "Colectiva": [
            { value: "Livianos", label: "Livianos" },
            { value: "Médica familiar", label: "Médica familiar" },
            { value: "Corporate", label: "Corporate" }
          ],
          "Individual": [
            { value: "Salud Internacional", label: "Salud Internacional" },
            { value: "Salud a su Medida", label: "Salud a su Medida" }
          ]
        },
        plansByDetail: {
          "Salud Internacional": ["ESSENTIAL", "SELECT", "PREMIER", "ELITE", "ULTIMATE"],
          "Livianos": ["Plan 1", "Plan 2", "Plan 3"],
          "Médica familiar": ["Plan Básico", "Plan Medio", "Plan Alto"],
          "Salud a su Medida": ["Plan S", "Plan S+", "Plan M", "Plan M+", "Plan L"]
        },
        placaVisible: false
      },
      "Vida": {
        types: ["Individual"],
        detailsByType: {
          "Individual": [
            { value: "Vida Individual", label: "Vida Individual" },
            { value: "Vida Grupo", label: "Vida Grupo" },
            { value: "Vida Deudores", label: "Vida Deudores" }
          ]
        },
        plansByDetail: {},
        placaVisible: false
      },
      "Crédito": {
        types: ["Individual"],
        detailsByType: {
          "Individual": [
            { value: "Protección Crédito", label: "Protección Crédito" },
            { value: "Crédito Hipotecario", label: "Crédito Hipotecario" }
          ]
        },
        plansByDetail: {},
        placaVisible: false
      }
    };

    function setSelectOptions($select, options, placeholderText) {
      $select.empty();
      if (placeholderText) {
        $select.append(`<option value="" selected disabled hidden>${placeholderText}</option>`);
      }
      options.forEach(function(opt) {
        if (typeof opt === 'string') {
          $select.append(`<option value="${opt}">${opt}</option>`);
        } else if (opt && typeof opt === 'object') {
          $select.append(`<option value="${opt.value}">${opt.label}</option>`);
        }
      });
    }

    function togglePlacaVisibility(lineaProducto) {
      const config = PRODUCTS_CONFIG[lineaProducto];
      if (!config) return;
      if (config.placaVisible) {
        $('#group_placa_client').show();
      } else {
        $('#group_placa_client').hide();
        $('#placa_client').val('');
      }
    }

    function refreshTypeOptions() {
      const linea = $('#productLine').val() || 'Autos';
      const config = PRODUCTS_CONFIG[linea];
      if (!config) return;
      setSelectOptions($('#typePoliza'), config.types, 'Seleccione');
      $('#typePoliza').val('').trigger('change');
      setSelectOptions($('#detailsPoliza'), [], '⚠️Seleccione Tipo');
      $('#detailsPlanPoliza').empty();
      $('#container_detailsPlanPoliza').prop('hidden', true);
      togglePlacaVisibility(linea);
    }

    function refreshDetailOptions() {
      const linea = $('#productLine').val() || 'Autos';
      const config = PRODUCTS_CONFIG[linea];
      const tipo = $('#typePoliza').val();
      const detailOptions = (config && config.detailsByType && config.detailsByType[tipo]) || [];
      setSelectOptions($('#detailsPoliza'), detailOptions, '⚠️Seleccione Tipo');
      $('#detailsPoliza').val('').trigger('change');
      $('#detailsPlanPoliza').empty();
      $('#container_detailsPlanPoliza').prop('hidden', true);
    }

    function refreshPlanOptions() {
      const linea = $('#productLine').val() || 'Autos';
      const config = PRODUCTS_CONFIG[linea];
      const detalle = $('#detailsPoliza').val();
      const plans = (config && config.plansByDetail && config.plansByDetail[detalle]) || [];
      if (plans.length > 0) {
        setSelectOptions($('#detailsPlanPoliza'), plans, 'Seleccione');
        $('#container_detailsPlanPoliza').prop('hidden', false);
      } else {
        $('#detailsPlanPoliza').empty();
        $('#container_detailsPlanPoliza').prop('hidden', true);
      }
    }
    function initSelect2(selector) {
      $(selector).each(function() {
        if ($(this).hasClass('select2-hidden-accessible')) {
          $(this).select2('destroy');
        }
        $(this).select2({
          width: '100%',
          placeholder: 'Seleccione',
          allowClear: true,
          dropdownParent: $('#clientModal')
        });
      });
    }

    $('.navbar-nav .nav-link').on('click', function (e) {
      e.preventDefault();
      $('.navbar-nav .nav-link').removeClass('active');
      $(this).addClass('active');
      sectionSelected = $(this).find('.nav-link-text').text().trim()
    });

    function initAllSelects() {
      initSelect2('.active_Select2');
      $('.select2-multiple').each(function() {
        if ($(this).hasClass('select2-hidden-accessible')) {
          $(this).select2('destroy');
        }
        $(this).select2({
          width: '100%',
          placeholder: 'Seleccione',
          allowClear: true,
          dropdownParent: $('#clientModal')
        });
      });
    }
    initAllSelects();
    $('#clientModal').on('shown.bs.modal', function() {
      initAllSelects();
    });

    let reminderCalendar = flatpickr("#reminderCalendar", {
      inline: true,
      locale: "es",
      dateFormat: "d/m/Y h:i K",
      enableTime: true,
      time_24hr: false,
      position: "auto center",
      disableMobile: true,
      minDate: "today",
      defaultDate: null,
      onChange: function(selectedDates) {
        dateRecordatory = selectedDates[0];
      }
    });

    $('#productLine').on('change', function() {
      refreshTypeOptions();
    });

    $("#typePoliza").on('change',function(){
      refreshDetailOptions();
    });

    $('#detailsPoliza').on('change', function(){
      refreshPlanOptions();
    });

    // Inicializar opciones en base a la línea por defecto
    refreshTypeOptions();

    $("#btn_create_event_user").on('click',function(){
      let overlay = $('#segurosBolivarModernOverlay');
      overlay.addClass('is-visible');
      let clientName = dataRowSelected[4]; 
      let clientPhone = dataRowSelected[5];
      let requestUniqueId = dataRowSelected[3];
      google.script.run.withFailureHandler((err)=>{
        Swal.fire({
          title: "Error!",
          html: "Algo salio mal al guardar el recordatorio <br> error: "+err.message,
          icon: "error",
          customClass: {
            container: 'Style_PopUp_Modal',
            popup: 'Style_PopUp_Modal'
          }
        })
      }).withSuccessHandler((response) =>{
        let dataTimeLine = JSON.parse(response[3]) 
        $("#requestTimeLine").empty();
        dataTimeLine.forEach(row =>{
          let itemTitle = row.TimeLine;
          let itemDate = row.date;
          let itemCommentary = row.commentary; 
          $("#requestTimeLine").append(`
            <div class="timeline-item">
              <div class="timeline-date">${itemDate}</div>
              <div class="timeline-title">${itemTitle}</div>
              <div class="timeline-content">${itemCommentary}</div>
            </div>
          `
          )
        });
        overlay.removeClass('is-visible');
        showModernToast('success', '¡Recordatorio Creado!', `Se agendo el recordatorio para la fecha <br> <b style='color:#009056;'>${response[2]}</b>`,'toast-top-center');
      }).createEventForUser(String(dateRecordatory),clientName,clientPhone,requestUniqueId);
    });

    $("#placa_client").on('change',function(){
      if($(this).val() === "No"){
        Swal.fire({
          icon: "question",
          title: 'CLIENTE SIN PLACA',
          html: 'El cliente no cuenta con placa por lo que se desistirá el caso automáticamente, ¿Desea continuar con el desistimiento?',
          showCancelButton: true,
          cancelButtonText: `Regresar&nbsp;<i class="fa-solid fa-rotate-left"></i>`,
          confirmButtonText: `Continuar&nbsp;<i class="fa-regular fa-circle-check"></i>`,
          reverseButtons: true,
          customClass: {
            cancelButton: 'style_return_button',
            confirmButton: 'Style_Button_Swal_Green2',
            popup: 'Style_PopUp_Modal'
          },
          allowOutsideClick: false,
          showCloseButton: false
        }).then((result) => {
          if (result.isConfirmed) {
            let requestUniqueId = dataRowSelected[3];
            const clientInfoData = {};
            $('#clientInfoView').find('input, select, textarea').each(function() {
              const field = $(this);
              const key = field.attr('name') || field.attr('id');
              if (key) {
                clientInfoData[key] = field.val();
              }
            });
            showLoadingProgress(10000, 'Guardando Gestión');
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
                  html: 'Presentamos fallas en este momento, estamos trabajando para solucionarlo lo más pronto posible.<br> Error: <b>'+e+'</b>',
                  showCancelButton: false,
                  confirmButtonText: `Cerrar&nbsp;<i class="bi bi-x-circle-fill"></i>`,
                  customClass: {
                    confirmButton: 'Style_Button_Swal_Green2'
                  }
                });
              }
              $("#overlay").hide();
            }).withSuccessHandler(function(data){
              $('#authorsTable').DataTable().destroy();
              createPrimaryTable(data[1])
              $('#clientInfoView').find('input[type="text"], input[type="number"], input[type="email"], textarea').val('');
              $('#clientInfoView').find('select').each(function() {
                const $select = $(this);
                if ($select.hasClass('select2-hidden-accessible')) {
                  $select.val(null).trigger('change'); 
                } else {
                  $select.prop('selectedIndex', 0);
                }
              });
              $('#container_detailsPlanPoliza').addClass('hidden');
              $('.decision-tree .tree-node').not('#node-contactado').addClass('hidden');
              $('.decision-tree').find('input, select, textarea').each(function() {
                const $field = $(this);
                if ($field.is('input') || $field.is('textarea')) {
                  $field.val('');
                } else if ($field.is('select')) {
                  if ($field.hasClass('select2-hidden-accessible')) {
                    $field.val(null).trigger('change');
                  } else {
                    $field.prop('selectedIndex', 0);
                  }
                }
              });
              $('#contactado').val(null).trigger('change');
              $('#clientModal').modal('hide');
              Swal.close();
              Swal.fire({
                icon: 'success',
                title: '¡Cliente Desistido!',
                customClass: { 
                  popup: 'modern-loading-popup',
                  confirmButton: 'style-confirm-relux'
                }
              });
            }).saveManagmentLeadEPS(clientInfoData,requestUniqueId);
          }else{
            $("#placa_client").val('')
          }
        })      
      }
    });

    $('#contactado').on('change', function () {
      const contactado = $(this).val();
      $('.tree-node:not(#node-contactado)').addClass('hidden');

      if (contactado === 'no') {
        $('#node-contacto-no-exitoso, #node-observaciones').removeClass('hidden');

      } else if (contactado === 'si') {
        $('#node-contacto-si').removeClass('hidden');
      }
    });

    // Paso 2: Resultado del contacto
    $('#resultado-contacto').on('change', function () {
      const resultado = $(this).val();
      $('.tree-node:not(#node-contactado, #node-contacto-si)').addClass('hidden');

      if (resultado === 'Volver a Contactar') {
        $('#node-callbacks').removeClass('hidden');
        $('#node-observaciones').removeClass('hidden');
      } else if (resultado === 'No Acepta') {
        $('#node-motivo-no-aceptacion').removeClass('hidden');
      } else if (resultado === 'Acepta') {
        $('#node-estado-gestion').removeClass('hidden');
      }
    });

    // Paso 3: Motivo de no aceptación
    $('#motivo-no-aceptacion').on('change', function () {
      const motivo = $(this).val();
      $('#node-motivo-detallado').addClass('hidden');
      $('#node-motivo-detallado select').empty();

      if (['No escucha propuesta', 'Muy costoso', 'No le interesa'].includes(motivo)) {
        $('#node-motivo-detallado select').append(`
          <option value="" selected disabled hidden>Seleccione una opción</option>
          <option value="Se va con otra compañía por precio">Se va con otra compañía por precio</option>
          <option value="Capacidad de pago">Capacidad de pago</option>
          <option value="Aumento en el valor de la renovación">Aumento en el valor de la renovación</option>
          <option value="Póliza con otra compañía">Póliza con otra compañía</option>
          <option value="Póliza con Bolívar">Póliza con Bolívar</option>
        `);
        $('#node-motivo-detallado').removeClass('hidden');
      }
      $('#node-observaciones').removeClass('hidden');
    });

    // Paso 3: Gestión de contacto (Callbacks)
    $('#gestion-contacto').on('change', function () {
      $('#node-observaciones').removeClass('hidden');
    });

    // Paso 3: Estado de la gestión
    $('#estado-gestion').on('change', function () {
      $('#node-plan-cotizado, #node-emision').addClass('hidden');
      $('#node-observaciones').removeClass('hidden');
    });

    // Paso 4: Plan cotizado
    $('#plan-cotizado').on('change', function () {
      $('#node-emision').removeClass('hidden');
    });

    // Paso 5: Emitió
    $('#emitio').on('change', function () {
      $('#node-observaciones').removeClass('hidden');
    });

    $("#estado-gestion").on('change', function(){
      if($(this).val() === "Venta / Emisión"){
        $("#policy-section").prop('hidden',false);
        addPolicyCard();
      }else{
        $("#policy-section").prop('hidden',true);
        $('#policy-list').empty();
      }
    });

    $('#btnHistory').click(function() {
      $('#clientInfoView').hide();
      $('#reminderView').hide();
      $('#historyView').show();
      $("#timeLineView").hide();
      $(".modal-left-column").css("overflow-y","hidden")
    });

    $('#btnReminder').click(function() {
      $('#clientInfoView').hide();
      $('#historyView').hide();
      $('#reminderView').show();
      $("#timeLineView").hide();
      $(".modal-left-column").css("overflow-y","hidden")
    });

    $('#btntimeLine').click(function() {
      $('#clientInfoView').hide();
      $('#historyView').hide();
      $('#reminderView').hide();
      $("#timeLineView").show();
      $(".modal-left-column").css("overflow-y","hidden")
    });

    $('#btnVolverHistorial, #btnVolverRecordatorio, #btnVolverLineaTiempo').click(function() {
      $('#historyView').hide();
      $('#reminderView').hide();
      $("#timeLineView").hide();
      $('#clientInfoView').show();
      $(".modal-left-column").css("overflow-y","auto")
    });

    let overlay = $('#segurosBolivarModernOverlay');
    let loadingContainer = $('.sb-loading-container', overlay);
    overlay.addClass('is-visible');
    createLoadingAnimation();
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
      let sectionAside = $("#sidenav-main"); 
      let sectionMain = $(".main-content");
      let sectionLogin = $("#Seccion_Login");
      if(data[1][0] != "externalUser"){
        createPrimaryTable(data[1]);
        sectionMain.prop('hidden',false);
        sectionAside.prop('hidden',false);
        sectionLogin.prop('hidden',true);
        $("#name_Active_User").html(data[0])
        overlay.removeClass('is-visible');
        showModernToast('success', '¡Bienvenido!', 'Todo listo para comenzar la gestión.','toast-bottom-right');
      }else{
        sectionLogin.prop('hidden',false);
        sectionMain.prop('hidden',true);
        sectionAside.prop('hidden',true);
        overlay.removeClass('is-visible');
      }
      if(data[2] === "Administrador" || data[2] === "Agentes AYA"){
        $("#nav-item-piezas").prop('hidden',false);
      }
      // let containerDataClient = $("#clientInfoView");
      // containerDataClient.empty(); 
      // if(data[3] === "Salud"){
      //   containerDataClient.append(`
          
      //     `)
      // }
      // else if(data[3] === "Autos"){
      //   containerDataClient.append(`
      //     <div style="display:flex">
      //       <h6 class="mb-3 text-muted" style="font-size: 0.8rem;">INFORMACIÓN DEL CLIENTE</h6>
      //       <button type="button" class="btn-header-action btn-reminder" id="btn_veces_gestion" style="margin-left: 20px;margin-top: -8px;border-radius: 25px;background-color: #B2EADC;color: #3d1212;height: 30px;">
      //         <i class="fa-solid fa-circle-exclamation"></i>
      //       </button>
      //     </div>
      //     <div class="row">
      //       <div class="col-md-4 col-12">
      //          <div class="info-field">
      //           <label class="info-field-label">Tipo de documento</label>
      //           <div class="info-field-icon-wrapper">
      //             <div class="info-field-icon bg-document">
      //               <i class="fas fa-id-card"></i>
      //             </div>
      //               </div>
      //               <select class="form-select" id="type_id_client" name="type_id_client">
      //                 <option selected disabled hidden>Seleccione</option>
      //                 <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
      //                 <option value="Cédula de Extranjería">Cédula de extranjería</option>
      //                 <option value="Tarjeta de Identidad">Tarjeta de identidad</option>
      //                 <option value="Pasaporte">Pasaporte</option>
      //                 <option value="NIT">NIT</option>
      //               </select>
      //             </div>
      //           </div>
      //           <!-- Número de documento - Input number -->
      //           <div class="col-md-4 col-12">
      //             <div class="info-field">
      //               <label class="info-field-label">Número de documento</label>
      //               <div class="info-field-icon-wrapper">
      //                 <div class="info-field-icon bg-document">
      //                   <i class="fas fa-hashtag"></i>
      //                 </div>
      //               </div>
      //               <input id="id_client" name="id_client" type="number" class="form-control" placeholder="Ingrese número de documento">
      //             </div>
      //           </div>
      //           <!-- Celular - Input number -->
      //           <div class="col-md-4 col-12">
      //             <div class="info-field">
      //               <label class="info-field-label">Número de celular</label>
      //               <div class="info-field-icon-wrapper">
      //                 <div class="info-field-icon bg-document">
      //                   <i class="fas fa-mobile-alt"></i>
      //                 </div>
      //               </div>
      //               <input id="phone_client" name="phone_client" type="number" class="form-control" placeholder="Ingrese número de celular">
      //             </div>
      //           </div>
      //           <!-- Nombre del cliente - Input text -->
      //           <div class="col-md-6 col-12">
      //             <div class="info-field">
      //               <label class="info-field-label">Nombre del cliente</label>
      //               <div class="info-field-icon-wrapper">
      //                 <div class="info-field-icon bg-document">
      //                   <i class="fas fa-user"></i>
      //                 </div>
      //               </div>
      //               <input id="name_client" name="name_client" type="text" class="form-control" placeholder="Ingrese nombre completo">
      //             </div>
      //           </div>
      //           <!-- Correo - Input mail -->
      //           <div class="col-md-6 col-12">
      //             <div class="info-field">
      //               <label class="info-field-label">Correo electrónico</label>
      //               <div class="info-field-icon-wrapper">
      //                 <div class="info-field-icon bg-document">
      //                   <i class="fas fa-envelope"></i>
      //                 </div>
      //               </div>
      //               <input id="email_client" name="email_client" type="email" class="form-control" placeholder="ejemplo@correo.com">
      //             </div>
      //           </div>
      //           <!-- Tipo de póliza - Select -->
      //           <div class="col-md-4 col-12">
      //             <div class="info-field">
      //               <label class="info-field-label">Tipo de póliza</label>
      //               <div class="info-field-icon-wrapper">
      //                 <div class="info-field-icon bg-document">
      //                   <i class="fas fa-file-contract"></i>
      //                 </div>
      //               </div>
      //               <select id="typePoliza" name="typePoliza" class="form-select">
      //                 <option value="" selected disabled hidden>Seleccione</option>
      //                 <option value="Autos">Autos1</option>
      //                 <option value="Autos2">Autos2</option>
      //               </select>
      //             </div>
      //           </div>
      //         </div>  
      //       </div>
      //     </div>  
      //   `)
      // }
    }).getDataUser();


    $("#section_Pendientes").on('click',function(){
      $("#container-principal").show();
      $("#container-cards").hide();
      $('#authorsTable').DataTable().destroy();
      overlay.addClass('is-visible');
      createLoadingAnimation();
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
        let sectionAside = $("#sidenav-main"); 
        let sectionMain = $(".main-content");
        let sectionLogin = $("#Seccion_Login");
        if(data[1][0] != "externalUser"){
          createPrimaryTable(data[1]);
          sectionMain.prop('hidden',false);
          sectionAside.prop('hidden',false);
          sectionLogin.prop('hidden',true);
          $("#name_Active_User").html(data[0])
          overlay.removeClass('is-visible');
          showModernToast('success', '¡Datos Actualizados!', 'Todo listo para comenzar la gestión.','toast-bottom-right');
        }else{
          sectionLogin.prop('hidden',false);
          sectionMain.prop('hidden',true);
          sectionAside.prop('hidden',true);
          overlay.removeClass('is-visible');
        }
        $("#title_card_totals").html('Total ');
      }).getDataUser();
    });

    $("#section_Seguimiento").on('click',function(){
      $("#container-principal").show();
      $("#container-cards").hide();
      $('#authorsTable').DataTable().destroy();
      overlay.addClass('is-visible');
      createLoadingAnimation();
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
        createSecundaryTable(data);
        overlay.removeClass('is-visible');
        $("#title_card_totals").html('Total');
        showModernToast('success', '¡Clientes en Seguimiento!', 'Todo listo para comenzar la gestión.','toast-bottom-right');
      }).getDataFollowUp();
    });

    $("#section_Commercial_Intent").on('click',function(){
      $("#container-principal").show();
      $("#container-cards").hide();
      $('#authorsTable').DataTable().destroy();
      overlay.addClass('is-visible');
      createLoadingAnimation();
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
        createQuaternaryTable(data);
        overlay.removeClass('is-visible');
        $("#title_card_totals").html('Total');
        showModernToast('success', '¡Clientes con Intención Comercial!', 'Todo listo para comenzar la gestión.','toast-bottom-right');
      }).getDataCommercialIntent();
    });

    $("#section_Desistidos").on('click',function(){
      $("#container-principal").show();
      $("#container-cards").hide();
      $('#authorsTable').DataTable().destroy();
      overlay.addClass('is-visible');
      createLoadingAnimation();
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
        createTercerityTable(data);
        overlay.removeClass('is-visible');
        $("#title_card_totals").html('Total')
        showModernToast('success', '¡Clientes Desistidos!', 'Si quieres recuperar a alguno solo da click en gestionar..','toast-bottom-right');
      }).getDataGivenUp();
    });

    let templateData;
    $("#section_Piezas").on('click',function(){
      $("#container-principal").hide();
      overlay.addClass('is-visible');
      createLoadingAnimation();
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
        $("#container-cards").show();
        overlay.removeClass('is-visible');
        templateData = data.map((item, index) => {
          return {
            "Nombre Pieza": `Plantilla ${index + 1}`,
            "Etiquetas": "General | HTML",
            "Formato": "HTML",
            "Vista Previa": item.previsual,
            "Contenido HTML": item.html,
            "ID": item.id
          };
        });
        const cardsContainer = $('#template-cards-container');
        cardsContainer.empty();
        $.each(templateData, function(index, card) {
          const actionIconHtml = card.Formato === 'HTML' ?
            `<span class="overlay-icon" data-action="edit" title="Editar"><i class="fas fa-pencil-alt"></i></span>` :
            `<span class="overlay-icon" data-action="preview" title="Solo Vista Previa"><i class="fas fa-eye"></i></span>`;
          cardsContainer.append(`
            <div class="col-lg-4 col-md-6 template-card-col" data-index="${index}">
              <div class="template-card">
                <div class="template-card-img-container">
                  <img src="${card['Vista Previa']}" alt="Vista previa de ${card['Nombre Pieza']}" class="template-card-img">
                  <div class="template-card-overlay">
                    <span class="overlay-icon" data-action="preview" title="Previsualizar"><i class="fas fa-eye"></i></span>
                    ${actionIconHtml}
                  </div>
                </div>
                <div class="template-card-body">
                  <h5 class="template-card-title">${card['Nombre Pieza']}</h5>
                  <p class="template-card-category">${card.Etiquetas}</p>
                </div>
               </div>
            </div>
          `);
        });
      }).obtenerPiezasHTML();
    });

    const lightbox = $('#lightbox');
    const lightboxImg = $('#lightbox-img');
        
    function closeLightbox() {
      lightbox.fadeOut();
      $('body').removeClass('modal-open');
    }

    $('.lightbox-close').on('click', closeLightbox);
    lightbox.on('click', function(e) {
      if (e.target.id === 'lightbox') closeLightbox();
    });

    const editorOverlay = $('#editor-overlay');
    const iframe = $('#html-preview-iframe')[0];

    function closeEditor() {
      editorOverlay.fadeOut();
      $('body').removeClass('modal-open');
      $('#logo-url-input, #logo-file-input').val('');
      $('#logo-preview').hide().attr('src', '');
      $('#logo-size-controls').hide();
    }

    $('#editor-close').on('click', closeEditor);

    $('#template-cards-container').on('click', '.overlay-icon', function(e) {
      e.stopPropagation();
      const action = $(this).data('action');
      const cardIndex = $(this).closest('.template-card-col').data('index');
      const cardData = templateData[cardIndex];

      if (action === 'preview') {
        lightboxImg.attr('src', cardData['Vista Previa']);
        lightbox.css('display', 'flex').hide().fadeIn();
        $('body').addClass('modal-open');
      } else if (action === 'edit') {
        if (cardData.Formato === 'HTML' && cardData['Contenido HTML']) {
          $('#editor-title').text(`Editando: ${cardData['Nombre Pieza']}`);
          iframe.srcdoc = cardData['Contenido HTML'];
          editorOverlay.css('display', 'flex').hide().fadeIn();
          $('body').addClass('modal-open');
        } else {
          Swal.fire('No Editable', 'La edición solo está disponible para plantillas HTML.', 'warning');
        }
      }
    });

    let originalLogoAspectRatio = 1;
    const logoUrlInput = $('#logo-url-input');
    const logoFileInput = $('#logo-file-input');
    const logoPreview = $('#logo-preview');
    const applyLogoBtn = $('#apply-logo-btn');

    logoUrlInput.on('input', function() {
      const url = $(this).val();
      if (url) {
        logoPreview.attr('src', url).show();
      } else {
        logoPreview.hide();
      }
    });

    logoFileInput.on('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          logoPreview.attr('src', event.target.result).show();
        }
        reader.readAsDataURL(file);
      }
    });

    applyLogoBtn.on('click', function() { 
      const aliadoLogoSrc = logoPreview.attr('src');
      if (!aliadoLogoSrc) {
        Swal.fire('Sin logo', 'Por favor, carga un logo de aliado.', 'warning');
        return;
      }

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const existingAliadoLogo = iframeDoc.getElementById('aliado-logo-in-iframe');

      const handleLogoLoad = (logoElement) => {
        originalLogoAspectRatio = logoElement.naturalWidth / logoElement.naturalHeight;
        const defaultWidth = logoElement.naturalWidth > 200 ? 200 : logoElement.naturalWidth;
        const defaultHeight = defaultWidth / originalLogoAspectRatio;

        $('#logo-width-slider').val(defaultWidth);
        $('#logo-height-slider').val(defaultHeight);
        $('#logo-width-value').text(`${defaultWidth}px`);
        $('#logo-height-value').text(`${Math.round(defaultHeight)}px`);
                    
        logoElement.style.width = `${defaultWidth}px`;
        logoElement.style.height = 'auto';

        $('#logo-size-controls').slideDown();
        Swal.fire({ icon: 'success', title: '¡Logo aplicado!', showConfirmButton: false, timer: 1500 });
      };

      if (existingAliadoLogo) {
        existingAliadoLogo.src = aliadoLogoSrc;
        if (existingAliadoLogo.complete) {
          handleLogoLoad(existingAliadoLogo);
        } else {
          existingAliadoLogo.onload = () => handleLogoLoad(existingAliadoLogo);
        }
      } else {
        const originalLogo = iframeDoc.querySelector('td[aria-label="social"] img');
        if (!originalLogo) {
          Swal.fire('Error', 'No se encontró la imagen del logo en la plantilla.', 'error');
          return;
        }
                  
        const parentTd = originalLogo.parentElement;
        const bolivarLogoUrl = `https://multimedia-jelpit-personas-prod.s3.amazonaws.com/public/hNHYne5iLlSVybHQxS0y8XCz6o6ci4WkZBm26vxz.png`;

        const newTableHTML = `
          <table cellspacing="0" cellpadding="0" role="presentation" style="border-collapse: collapse; margin: 0 auto;">
            <tbody>
              <tr>
                <td align="right" valign="middle" style="padding: 0;">
                  <img src="${bolivarLogoUrl}" alt="Seguros Bolívar" style="max-width: 200px; height: auto; display: block;">
                </td>
                <td align="left" valign="middle" style="padding: 0 0 0 10px;">
                  <img id="aliado-logo-in-iframe" src="${aliadoLogoSrc}" alt="Logo Aliado" style="max-width: 200px; height: auto; display: block;">
                </td>
              </tr>
            </tbody>
          </table>`;
                  
        parentTd.innerHTML = newTableHTML;

        const newAliadoLogo = iframeDoc.getElementById('aliado-logo-in-iframe');
        if (newAliadoLogo.complete) {
          handleLogoLoad(newAliadoLogo);
        } else {
          newAliadoLogo.onload = () => handleLogoLoad(newAliadoLogo);
        }
      }
    });

    $("#btnDescargarPieza").on('click', function() {
      Swal.fire({
        title: 'FORMATO DESCARGA',
        html: `
        <p>Selecciona el formato para descargar la pieza modificada.</p>
          <select id="format-select" class="swal2-select">
            <option value="html">HTML</option>
            <option value="pdf">PDF</option>
          </select>`,
        showCancelButton: true,
        customClass: {
					popup: 'mi-sweetalert'
				},
        confirmButtonText: 'Generar',
        confirmButtonColor: "#198754",
        cancelButtonText: 'Cancelar',
        cancelButtonColor: "#6e7881",
        preConfirm: () => {
        	return document.getElementById('format-select').value;
        }
      }).then((result) => {
        if (result.isConfirmed) {
        	const selectedFormat = result.value;
        	const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        	const modifiedHtml = iframeDoc.documentElement.outerHTML;
          const randomName = generarNombreAleatorio();
          Swal.fire({
            title: 'Generando pieza...',
            html: 'Procesando solicitud...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          google.script.run.withSuccessHandler((data)=>{
            Swal.close();
            downloadFromBase64(data.base64, data.name, selectedFormat)
          }).generarPieza(modifiedHtml, selectedFormat, randomName);
        }
      });
    });

    function generarNombreAleatorio() {
      const fecha = new Date();
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      const horas = String(fecha.getHours()).padStart(2, '0');
      const minutos = String(fecha.getMinutes()).padStart(2, '0');
      const segundos = String(fecha.getSeconds()).padStart(2, '0');
      const aleatorio = Math.floor(Math.random() * 1000);

      return `Pieza_${anio}${mes}${dia}_${horas}${minutos}${segundos}_${aleatorio}`;
    }

    function downloadFromBase64(base64String, filename, type) {
			const byteCharacters = atob(base64String);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], {
				type: type
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			URL.revokeObjectURL(url);
			document.body.removeChild(a);
		}

    function updateAliadoLogo() {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const targetLogo = iframeDoc.getElementById('aliado-logo-in-iframe');
      if (!targetLogo) return;

      const newWidth = $('#logo-width-slider').val();
      const newHeight = $('#logo-height-slider').val();

      targetLogo.style.width = `${newWidth}px`;
      $('#logo-width-value').text(`${newWidth}px`);

      if ($('#aspect-ratio-toggle').is(':checked')) {
        const calculatedHeight = newWidth / originalLogoAspectRatio;
        targetLogo.style.height = 'auto';
        $('#logo-height-slider').val(calculatedHeight);
        $('#logo-height-value').text(`${Math.round(calculatedHeight)}px`);
      } else {
        targetLogo.style.height = `${newHeight}px`;
        $('#logo-height-value').text(`${newHeight}px`);
      }
    }

    $('#logo-width-slider').on('input', updateAliadoLogo);
    $('#logo-height-slider').on('input', function() {
      if (!$('#aspect-ratio-toggle').is(':checked')) {
        updateAliadoLogo();
      }
    });
    $('#aspect-ratio-toggle').on('change', function() {
      if ($(this).is(':checked')) {
        updateAliadoLogo();
      }
    });

    $('#titleTotalPremium360').closest('.modern-card').on('click', function() {
        let tablePenddings = $('#authorsTable').DataTable();
        tablePenddings.column(2).search('PREMIUM+360').draw();
    });

    $('#titleTotalPremium').closest('.modern-card').on('click', function() {
        let tablePenddings = $('#authorsTable').DataTable();
        tablePenddings.column(2).search('PREMIUM').draw();
    });

    $('#titleTotalEstandar').closest('.modern-card').on('click', function() {
        let tablePenddings = $('#authorsTable').DataTable();
        tablePenddings.column(2).search('ESTANDAR').draw();
    });

    $('#titleTotalClasico').closest('.modern-card').on('click', function() {
        let tablePenddings = $('#authorsTable').DataTable();
        tablePenddings.column(2).search('CLASICO').draw();
    });

    $('#titleTotalLigero').closest('.modern-card').on('click', function() {
        let tablePenddings = $('#authorsTable').DataTable();
        tablePenddings.column(2).search('LIGERO').draw();
    });

    $('#titleTotalVerde').closest('.modern-card').on('click', function() {
        let tablePenddings = $('#authorsTable').DataTable();
        tablePenddings.column(2).search('VERDE').draw();
    });

    $('#titleTotalAutos').closest('.modern-card').on('click', function() {
        let tablePenddings = $('#authorsTable').DataTable();
        tablePenddings.column(2).search('').draw();
    });

    $('.modern-card').each(function () {
      const $card = $(this);
      const $icon = $card.find('.icon-container i');
      const $iconContainer = $card.find('.icon-container');

      // Guardamos el estado original de la sombra para restaurarla
      const originalShadow = $iconContainer.css('box-shadow');

      const tl = gsap.timeline({ paused: true });

      tl.to($card.get(0), {
          scale: 1.03,
          duration: 0.2,
          ease: "power1.inOut"
        })
        .to($iconContainer.get(0), {
          scale: 1.1,
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          duration: 0.3,
          ease: "back.out(1.7)",
          transformOrigin: "center center"
        }, "<")
        .to($icon.get(0), {
          rotate: 15,
          opacity: 1, // si parte de opacity-10 (0.1), animamos a 1
          duration: 0.3,
          ease: "back.out(1.7)"
        }, "<");

      // Al salir, volvemos a los valores originales
      $card.on('mouseenter', function () {
        if (!tl.isActive()) {
          tl.play(0);
        }
      });

      $card.on('mouseleave', function () {
        if (!tl.isActive()) {
          tl.reverse(0);
        }
      });

      // Opcional: limpiar transformaciones al final del reverse
      tl.eventCallback("onReverseComplete", () => {
        gsap.set($iconContainer.get(0), { clearProps: "scale, boxShadow" });
        gsap.set($icon.get(0), { clearProps: "rotate, opacity" });
      });
    });

    function createLoadingAnimation() {
      let numberOfCircles = 5;
      let baseSize = 280;
      let sizeIncrement = 25;
      gsap.killTweensOf(loadingContainer.children());
      loadingContainer.find('.loading-circle').remove();
      for (var i = 0; i < numberOfCircles; i++) {
        var circle = $('<div>').addClass('loading-circle');
        var size = baseSize + i * sizeIncrement;
        var opacity = 1 - i * (1 / numberOfCircles);
        circle.css({
          'position': 'absolute',
          'width': size + 'px',
          'height': size + 'px',
          'border': '4px solid transparent',
          'border-top-color': '#04C267',
          'border-radius': '50%',
          'opacity': opacity
        });
        loadingContainer.append(circle);
        gsap.to(circle[0], {
          rotate: 360,
          duration: 2 + i * 0.5,
          repeat: -1,
          ease: "linear"
        });
      }
    }

    $('.btn-save-gestion').on('click', function(e) {
      let isValid = true;
      let firstErrorField = null;
      let optionSelected = $('#contactado').val();
      let twoOptionSelected = $("#resultado-contacto").val();
      if(optionSelected === "si" && twoOptionSelected !== "Volver a Contactar"){
        $('#clientInfoView').find('input, select, textarea').each(function() {
          const $field = $(this);
          if ($field.hasClass('select2-search__field')) {
            return true;
          }
          let isRequired;
          if ($field.closest('#policy-list').length > 0) {
            isRequired = $('#policy-section').is(':visible');
          }else if ($field.attr('id') === 'detailsPlanPoliza') {
            isRequired = $('#container_detailsPlanPoliza').is(':visible');
          }else {
            isRequired = $field.is(':visible');
          }
          if (isRequired) {
            let value = $field.val();
            let isEmpty = false;
            if ($field.hasClass('select2-multiple')) {
              isEmpty = !value || value.length === 0;
            } else {
              isEmpty = !value || value.trim() === "" || value === 'Seleccione' || value === '⚠️Seleccione Tipo';
            }
            if (isEmpty) {
              isValid = false;
              firstErrorField = $field.closest('.info-field').find('.info-field-label').text().trim() || $field.attr('id');
              return false;
            }
          }
        });
      }

      if (!isValid) {
        showModernToast('warning', 'Campos Vacíos', `Por favor, diligencie el campo: <br><b>${firstErrorField}</b>`, 'toast-bottom-right');
        return;
      }

      $('.decision-tree-body').find('.tree-node:visible').find('input, select, textarea').each(function() {
        const $field = $(this);
        const value = $field.val();
        const isEmpty = !value || ($field.is('select') && $field.get(0).selectedIndex === 0);

        if (isEmpty) {
          isValid = false;
          const node = $field.closest('.tree-node');
          firstErrorField = node.find('.tree-node-title').clone().children().remove().end().text().trim();
          return false;
        }
      });

      if (!isValid) {
        showModernToast('warning', 'Campos Vacíos', `Por favor, complete el campo en el árbol de decisión: <br><b>${firstErrorField}</b>`, 'toast-bottom-right');
        return;
      }

      const clientInfoData = {};
      let arrayAmountPolizas = [];
      $('#clientInfoView').find('input, select, textarea').each(function() {
        const field = $(this);
        const key = field.attr('name') || field.attr('id');
        if (key && !key.includes('policy_')) {
          clientInfoData[key] = field.val();
        }
      });
      $('#policy-list .policy-card').each(function () {
        const $card = $(this);
        const numberInput = $card.find('input[id^="policy_number_"]');
        const valueInput = $card.find('input[id^="policy_value_"]');
        if (numberInput.length && valueInput.length) {
          const number = numberInput.val();
          const value = valueInput.val();

          if (number && value) {
            arrayAmountPolizas.push([number, value]);
          }
        }
      });
      if(arrayAmountPolizas.length > 0){
        clientInfoData['data_valores_poliza'] = [arrayAmountPolizas];
      }

      const decisionTreeData = {};
      $('.decision-tree-body .tree-node:visible').each(function() {
        const node = $(this);
        const field = node.find('input, select, textarea');
        const value = field.val();
        const key = node.find('.tree-node-title').clone().children().remove().end().text().trim();
        if (key && value) {
          decisionTreeData[key] = value;
        }
      });
      sendDataManagment(clientInfoData,decisionTreeData)
      // showModernToast('success', 'Validación Exitosa', 'Todos los campos han sido diligenciados.', 'toast-bottom-right');
    });

    let policyCounter = 0;

    function addPolicyCard() {
      if(!dataPolizas){
        policyCounter++;
        const policyCardHTML = `
          <div class="policy-card" id="policy-card-${policyCounter}">
            <button type="button" class="btn-remove-policy"><i class="fas fa-times"></i></button>
            <div class="row">
              <div class="col-md-6 col-12">
                <div class="info-field">
                  <label class="info-field-label">Número de Póliza</label>
                  <div class="info-field-icon-wrapper"><div class="info-field-icon bg-document"><i class="fas fa-hashtag"></i></div></div>
                  <input id="policy_number_${policyCounter}" name="policy_number_${policyCounter}" type="text" class="form-control" placeholder="Ej: 123456789">
                </div>
              </div>
              <div class="col-md-6 col-12">
                <div class="info-field">
                  <label class="info-field-label">Valor de la Póliza</label>
                  <div class="info-field-icon-wrapper"><div class="info-field-icon bg-document"><i class="fas fa-dollar-sign"></i></div></div>
                  <input id="policy_value_${policyCounter}" name="policy_value_${policyCounter}" type="text" class="form-control" placeholder="Ej: 1500000">
                </div>
              </div>
            </div>
          </div>
        `;
        $('#policy-list').append(policyCardHTML);
      }else{
        for(let i=0;i<dataPolizas.length;i++){
          policyCounter++;
          const policyCardHTML = `
            <div class="policy-card" id="policy-card-${policyCounter}">
              <button type="button" class="btn-remove-policy"><i class="fas fa-times"></i></button>
              <div class="row">
                <div class="col-md-6 col-12">
                  <div class="info-field">
                    <label class="info-field-label">Número de Póliza</label>
                    <div class="info-field-icon-wrapper"><div class="info-field-icon bg-document"><i class="fas fa-hashtag"></i></div></div>
                    <input id="policy_number_${policyCounter}" name="policy_number_${policyCounter}" type="text" value="${dataPolizas[i].numberPoliza}" class="form-control" placeholder="Ej: 123456789">
                  </div>
                </div>
                <div class="col-md-6 col-12">
                  <div class="info-field">
                    <label class="info-field-label">Valor de la Póliza</label>
                    <div class="info-field-icon-wrapper"><div class="info-field-icon bg-document"><i class="fas fa-dollar-sign"></i></div></div>
                    <input id="policy_value_${policyCounter}" name="policy_value_${policyCounter}" type="text" value="${dataPolizas[i].amountPoliza}" class="form-control" placeholder="Ej: 1500000">
                  </div>
                </div>
              </div>
            </div>
          `;
          $('#policy-list').append(policyCardHTML);
        }
      }
      
    }

    $('#add-policy-btn').on('click', function() {
        addPolicyCard();
    });

    $('#policy-list').on('click', '.btn-remove-policy', function() {
        $(this).closest('.policy-card').remove();
    });
    $('#clientModal').on('hide.bs.modal', function (e) {
      $('#clientInfoView').find('input[type="text"], input[type="number"], input[type="email"], textarea').val('');
      $('#clientInfoView').find('select').each(function() {
        const $select = $(this);
        if ($select.hasClass('select2-hidden-accessible')) {
          $select.val(null).trigger('change'); 
        } else {
          $select.prop('selectedIndex', 0);
        }
      });
      $('#container_detailsPlanPoliza').addClass('hidden');
      $('.decision-tree .tree-node').not('#node-contactado').addClass('hidden');
      $('.decision-tree').find('input, select, textarea').each(function() {
        const $field = $(this);
        if ($field.is('input') || $field.is('textarea')) {
          $field.val('');
        } else if ($field.is('select')) {
          if ($field.hasClass('select2-hidden-accessible')) {
            $field.val(null).trigger('change');
          } else {
            $field.prop('selectedIndex', 0);
          }
        }
      });
      $('#contactado').val(null).trigger('change');
    });
    const colombianFormatter = new Intl.NumberFormat('es-CO', {
      style: 'decimal',
      maximumFractionDigits: 0,
    });

    $(document).on('input', 'input[id^="policy_value_"]', function(e) {
      const $input = $(this);
      const inputElement = $input.get(0);
      const originalValue = $input.val();
      const cursorPosition = inputElement.selectionStart;
      const digits = originalValue.replace(/[^0-9]/g, '');

      if (digits === '') {
        $input.val('');
        return;
      }
      const formattedValue = colombianFormatter.format(Number(digits));
      if (originalValue === formattedValue) {
        return;
      }
      $input.val(formattedValue);
      const lengthDifference = formattedValue.length - originalValue.length;
      const newCursorPosition = cursorPosition + lengthDifference;
      
      if (newCursorPosition >= 0) {
        inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    });
  });

  function createPrimaryTable(data){
      $('#titleTotalPremium360').text(data[2]);
      $('#titleTotalPremium360').attr('data-target-number', data[2]);
      $('#titleTotalPremium').text(data[3]);
      $('#titleTotalPremium').attr('data-target-number', data[3]);
      $('#titleTotalEstandar').text(data[4]);
      $('#titleTotalEstandar').attr('data-target-number', data[4]);
      $('#titleTotalClasico').text(data[5]);
      $('#titleTotalClasico').attr('data-target-number', data[5]);
      $('#titleTotalLigero').text(data[6]);
      $('#titleTotalLigero').attr('data-target-number', data[6]);
      $('#titleTotalVerde').text(data[7]);
      $('#titleTotalVerde').attr('data-target-number', data[7]);
      $('#titleTotalAutos').text(data[1]);
      $('#titleTotalAutos').attr('data-target-number', data[1]);
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
          { title: "Placa" },
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
          { title: "Fuente" },
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
          { targets: [3,5,6,7,8,9,11,12,13,14,15,16,17], visible: false } 
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

  function createSecundaryTable(data){
      $('#titleTotalPremium360').text(data[2]);
      $('#titleTotalPremium360').attr('data-target-number', data[2]);
      $('#titleTotalPremium').text(data[3]);
      $('#titleTotalPremium').attr('data-target-number', data[3]);
      $('#titleTotalEstandar').text(data[4]);
      $('#titleTotalEstandar').attr('data-target-number', data[4]);
      $('#titleTotalClasico').text(data[5]);
      $('#titleTotalClasico').attr('data-target-number', data[5]);
      $('#titleTotalLigero').text(data[6]);
      $('#titleTotalLigero').attr('data-target-number', data[6]);
      $('#titleTotalVerde').text(data[7]);
      $('#titleTotalVerde').attr('data-target-number', data[7]);
      $('#titleTotalAutos').text(data[1]);
      $('#titleTotalAutos').attr('data-target-number', data[1]);
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
          { title: "Placa" },
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
          { title: "Fuente" },
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
          { targets: [3,5,6,7,8,9,11,12,13,14,15,16,17], visible: false } 
        ],
        dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rt<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
        language: {
          search: "_INPUT_",
          searchPlaceholder: "Buscar...",
          lengthMenu: "Mostrar _MENU_ registros por página",
          info: "Mostrando _END_ registros de _TOTAL_",
          infoEmpty: "Mostrando registros del 0 al 0 de un total de 0",
          emptyTable: "No hay registros disponibles",
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

  function createTercerityTable(data){
    $('#titleTotalPremium360').text(data[2]);
    $('#titleTotalPremium360').attr('data-target-number', data[2]);
    $('#titleTotalPremium').text(data[3]);
    $('#titleTotalPremium').attr('data-target-number', data[3]);
    $('#titleTotalEstandar').text(data[4]);
    $('#titleTotalEstandar').attr('data-target-number', data[4]);
    $('#titleTotalClasico').text(data[5]);
    $('#titleTotalClasico').attr('data-target-number', data[5]);
    $('#titleTotalLigero').text(data[6]);
    $('#titleTotalLigero').attr('data-target-number', data[6]);
    $('#titleTotalVerde').text(data[7]);
    $('#titleTotalVerde').attr('data-target-number', data[7]);
    $('#titleTotalAutos').text(data[1]);
    $('#titleTotalAutos').attr('data-target-number', data[1]);
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
          { title: "Placa" },
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
          { title: "Fuente" },
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
        { targets: [3,5,6,7,8,9,11,12,13,14,15,16,17], visible: false } 
      ],
      dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rt<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
      language: {
          search: "_INPUT_",
          searchPlaceholder: "Buscar...",
          lengthMenu: "Mostrar _MENU_ registros por página",
          info: "Mostrando _END_ registros de _TOTAL_",
          infoEmpty: "Mostrando registros del 0 al 0 de un total de 0",
          emptyTable: "No hay registros disponibles",
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
  function createQuaternaryTable(data){
    $('#titleTotalPremium360').text(data[2]);
      $('#titleTotalPremium360').attr('data-target-number', data[2]);
      $('#titleTotalPremium').text(data[3]);
      $('#titleTotalPremium').attr('data-target-number', data[3]);
      $('#titleTotalEstandar').text(data[4]);
      $('#titleTotalEstandar').attr('data-target-number', data[4]);
      $('#titleTotalClasico').text(data[5]);
      $('#titleTotalClasico').attr('data-target-number', data[5]);
      $('#titleTotalLigero').text(data[6]);
      $('#titleTotalLigero').attr('data-target-number', data[6]);
      $('#titleTotalVerde').text(data[7]);
      $('#titleTotalVerde').attr('data-target-number', data[7]);
      $('#titleTotalAutos').text(data[1]);
      $('#titleTotalAutos').attr('data-target-number', data[1]);
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
          { title: "Placa" },
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
          { title: "Fuente" },
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
          { targets: [3,5,6,7,8,9,11,12,13,14,15,16,17], visible: false } 
        ],
        dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rt<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
        language: {
          search: "_INPUT_",
          searchPlaceholder: "Buscar...",
          lengthMenu: "Mostrar _MENU_ registros por página",
          info: "Mostrando _END_ registros de _TOTAL_",
          infoEmpty: "Mostrando registros del 0 al 0 de un total de 0",
          emptyTable: "No hay registros disponibles",
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

  function sendDataManagment(clientInfoData,decisionTreeData){
    let requestUniqueId = dataRowSelected[3];
    showLoadingProgress(10000, 'Guardando Gestión');
    google.script.run.withFailureHandler().withSuccessHandler(function(data){
      $('#authorsTable').DataTable().destroy();
      if(sectionSelected === "Pendientes Gestión"){
        createPrimaryTable(data[1]);
      }else if(sectionSelected === "Seguimiento Leads"){
        createSecundaryTable(data[1]);
      }else if(sectionSelected === "Intención Comercial"){
        createQuaternaryTable(data[1]);
      }else if(sectionSelected === "Desistidos"){
        createTercerityTable(data[1])
      }
      $('#clientInfoView').find('input[type="text"], input[type="number"], input[type="email"], textarea').val('');
      $('#clientInfoView').find('select').each(function() {
        const $select = $(this);
        if ($select.hasClass('select2-hidden-accessible')) {
          $select.val(null).trigger('change'); 
        } else {
          $select.prop('selectedIndex', 0);
        }
      });
      $('#container_detailsPlanPoliza').addClass('hidden');
      $('.decision-tree .tree-node').not('#node-contactado').addClass('hidden');
      $('.decision-tree').find('input, select, textarea').each(function() {
        const $field = $(this);
        if ($field.is('input') || $field.is('textarea')) {
          $field.val('');
        } else if ($field.is('select')) {
          if ($field.hasClass('select2-hidden-accessible')) {
            $field.val(null).trigger('change');
          } else {
            $field.prop('selectedIndex', 0);
          }
        }
      });
      $('#contactado').val(null).trigger('change');
      $('#clientModal').modal('hide');
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: '¡Proceso Completado! 🎉',
        text: 'Los datos se han procesado exitosamente.',
        customClass: { 
          popup: 'modern-loading-popup',
          confirmButton: 'style-confirm-relux'
        }
      });
    }).saveDataManagment(clientInfoData,decisionTreeData,requestUniqueId,sectionSelected);
  }

  function showLoadingProgress(time, proceso) {
    Swal.fire({
      title: `${proceso} <i class="fa-solid fa-cloud-arrow-up"></i>`,
      html: `
        <div class="modern-loading-icon"></div>
        <p class="modern-loading-text">Por favor, espere mientras procesamos su solicitud.</p>
        <div class="modern-progress-container">
          <div id="modern-progress-bar" class="modern-progress-bar"></div>
        </div>
        <small class="modern-loading-subtext">Esto puede tardar unos segundos...</small>
      `,
      customClass: {
        popup: 'modern-loading-popup',
        title: 'modern-loading-title',
        htmlContainer: 'modern-loading-html'
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: (popup) => {
        const tl = gsap.timeline();
        tl.to(popup, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });
        tl.from(popup.querySelector('.swal2-title'), { y: -20, opacity: 0, duration: 0.4, ease: "power1.out" }, "-=0.2");
        tl.from(popup.querySelector('.modern-loading-icon'), { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(1.7)" }, "-=0.2");
        tl.from([
          popup.querySelector('.modern-loading-text'), 
          popup.querySelector('.modern-progress-container'), 
          popup.querySelector('.modern-loading-subtext')
        ], { 
          y: 20, 
          opacity: 0,
          duration: 0.4, 
          stagger: 0.1, 
          ease: "power1.out" 
        }, "-=0.3");
        simulateProgress(time);
      }
    });
  }

  function simulateProgress(time) {
    let progress = 0;
    const progressBar = document.getElementById('modern-progress-bar');
    const intervalTime = time / 100;
    const interval = setInterval(() => {
      progress++;
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      if (progress >= 99) {
        clearInterval(interval);
      }
    }, intervalTime);
  }

  
  function detectProductLineFromDataProduct(dataProduct) {
    try {
      const detail = dataProduct && (dataProduct.health_product || dataProduct.product_detail);
      if (!detail) return 'Autos';
      const inAutos = ["PREMIUM+360","PREMIUM","ESTANDAR","CLASICO","LIGERO","VERDE"].includes(String(detail).toUpperCase());
      if (inAutos) return 'Autos';
      const inSalud = ["Salud Internacional","Livianos","Médica familiar","Salud a su Medida"].includes(String(detail));
      if (inSalud) return 'Salud';
      const inVida = ["Vida Individual","Vida Grupo","Vida Deudores"].includes(String(detail));
      if (inVida) return 'Vida';
      const inCredito = ["Protección Crédito","Crédito Hipotecario"].includes(String(detail));
      if (inCredito) return 'Crédito';
      return 'Autos';
    } catch (e) { return 'Autos'; }
  }

  function managementClient(RowSelected){
    let table = $("#authorsTable").DataTable();
    let rowData = table.row(RowSelected).data();
    dataRowSelected = rowData
    $("#type_id_client").val(rowData[7]);
    $("#id_client").val(rowData[8]);
    $("#phone_client").val(rowData[5]);
    $("#name_client").val(rowData[4]);
    $("#email_client").val(rowData[6]);
    $("#btn_veces_gestion").html('Veces Gestionado: '+rowData[14])
    let dataTimeLine = JSON.parse(rowData[12]);
    if(rowData[17]){
      dataPolizas = JSON.parse(rowData[17])
    }
    $("#requestTimeLine").empty();
    if(rowData[15] != ''){
      let dataProduct = JSON.parse(rowData[15]);
      const inferredLine = detectProductLineFromDataProduct(dataProduct);
      $('#productLine').val(inferredLine).trigger('change');
      if (dataProduct.poliza_type !== null && typeof dataProduct.poliza_type !== 'undefined') {
        $('#typePoliza').val(dataProduct.poliza_type).trigger('change');
      }
      if (dataProduct.health_product !== null && typeof dataProduct.health_product !== 'undefined') {
        $('#detailsPoliza').val(dataProduct.health_product).trigger('change');
      }
      if (dataProduct.product_type !== null && typeof dataProduct.product_type !== 'undefined') {
        $('#detailsPlanPoliza').val(dataProduct.product_type);
        $('#container_detailsPlanPoliza').removeAttr('hidden');
      }
      if (dataProduct.got_EPS !== null && typeof dataProduct.got_EPS !== 'undefined') {
        $('#placa_client').val(dataProduct.got_EPS);
      }
      if (dataProduct.quoting_for !== null && typeof dataProduct.quoting_for !== 'undefined' && dataProduct.quoting_for.length > 0) {
        $('#ObjectMultiple').val(dataProduct.quoting_for).trigger('change');
      } else {
        $('#ObjectMultiple').val(null).trigger('change');
      }

    }
    
    dataTimeLine.forEach(row =>{
      let itemTitle = row.TimeLine;
      let itemDate = row.date;
      let itemCommentary = row.commentary; 
      $("#requestTimeLine").append(`
        <div class="timeline-item">
          <div class="timeline-date">${itemDate}</div>
          <div class="timeline-title">${itemTitle}</div>
          <div class="timeline-content">${itemCommentary}</div>
        </div>
      `
      )
    });
    if(rowData[12] != ""){
      let dataCommentary = JSON.parse(rowData[12]);
      $(".chat-container").empty();
      dataCommentary.forEach(row =>{
        let userType = row.userTypeObservation;
        let userName = row.userName;
        let observation = row.observation; 
        let dateCommentary = row.date;
        if(userType === 'asesor'){
          $(".chat-container").append(`
            <div class="chat-message outgoing">
              <div class="chat-avatar"><i class="fa-solid fa-user"></i></div>
              <div class="chat-bubble">
                <div class="chat-info">
                  <div class="chat-sender">${userName}</div>
                  <div class="chat-time">${dateCommentary}</div>
                </div>
                <div class="chat-content">
                  ${observation}
                </div>
              </div>
            </div>
          `)
        }else if(userType === 'system'){
          $(".chat-container").append(`
            <div class="chat-message">
              <div class="chat-avatar"><i class="fa-solid fa-robot"></i></div>
              <div class="chat-bubble">
                <div class="chat-info">
                  <div class="chat-sender">${userName}</div>
                  <div class="chat-time">${dateCommentary}</div>
                </div>
                <div class="chat-content">
                  ${observation}
                </div>
              </div>
            </div>
          `)
        }
      });
    }
    let status = rowData[11];
    let substatus = rowData[16];
    setDecisionTreeState(status, substatus)
    $('#clientModal').modal({
      backdrop: 'static',
      keyboard: false
    }).modal('show');
  }

  function setDecisionTreeState(status, substatus) {
    $('.tree-node:not(#node-contactado)').addClass('hidden');
    $('.decision-tree-body select').val('');
    $('#node-motivo-detallado select').empty().append('<option value="" selected disabled hidden>Seleccione una opción</option>');

    if (!substatus) {
      return;
    }

    const subestados = {
      noContacto: ["No contesta", "Fuera servicio", "Mensaje tercero", "Cliente cuelga", "No conocen al cliente", "Cliente fuera del país", "Volver llamar seguimiento", "Poliza recaudada", "Poliza anulada", "No gestionado"],
      volverAContactar: ["Llamar en la mañana", "Llamar en la tarde", "Regresar Llamada"],
      noAcepta: ["No escucha propuesta", "No aplica condiciones de producto", "Muy costoso", "No le interesa", "No es la persona que tomará el seguro"],
      acepta: ["Escuchó oferta", "Evaluando propuesta", "Cotizó", "Venta / Emisión"]
    };

    if (subestados.acepta.includes(substatus)) {
      $('#contactado').val('si').trigger('change');
      $('#resultado-contacto').val('Acepta').trigger('change');
      $('#estado-gestion').val(substatus).trigger('change');
      if(substatus === "Venta / Emisión"){
        $("#policy-section").prop('hidden',false);
      }

    } else if (subestados.noAcepta.includes(substatus)) {
      $('#contactado').val('si').trigger('change');
      $('#resultado-contacto').val('No Acepta').trigger('change');
      $('#motivo-no-aceptacion').val(substatus).trigger('change');

    } else if (subestados.volverAContactar.includes(substatus)) {
      $('#contactado').val('si').trigger('change');
      $('#resultado-contacto').val('Volver a Contactar').trigger('change');
      $('#gestion-contacto').val(substatus).trigger('change');
      
    } else if (subestados.noContacto.includes(substatus)) {
      $('#contactado').val('no').trigger('change');
      $('#motivo-no-contacto').val(substatus).trigger('change');
    }
  }

  
</script>