function doGet(e) {
  let template = HtmlService.createTemplateFromFile("index").evaluate().addMetaTag('viewport', 'width=device-width, initial-scale=1').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setTitle('CRM Mercadeo Bolívar').setFaviconUrl('https://d9b6rardqz97a.cloudfront.net/wp-content/uploads/2019/11/31104435/icon-bolivar-conmigo.png');
  return template
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

const warehouseLeads = SpreadsheetApp.openById("1KOHa58xAl9jcrq8ic8zObGx-5CuS-MbUHvqmQ_dySaQ");
const sheetLeadsSalud = warehouseLeads.getSheetByName("leads_salud");
const sheetLeadsAutos = warehouseLeads.getSheetByName("leads_autos");
const tabledataReferidos = warehouseLeads.getSheetByName("data_referidos_autos");
const sheetActiveUsers = warehouseLeads.getSheetByName("table_active_users");
const sheetPiezas = warehouseLeads.getSheetByName("Piezas");
let activeUser = Session.getActiveUser().getEmail();
// let activeUser = "";

const holidays = [
  '2025-01-01',
  '2025-01-06',
  '2025-03-24',
  '2025-04-17',
  '2025-04-18',
  '2025-05-01',
  '2025-06-02',
  '2025-06-23',
  '2025-06-30',
  '2025-07-20',
  '2025-08-07',
  '2025-08-18',
  '2025-10-13',
  '2025-11-03',
  '2025-12-08',
  '2025-12-25'
];

function getDataUser() {
  let responseRequest;
  let userRol;
  let businessRol;
  if (!activeUser) {
    responseRequest = ["externalUser"];
  } else {
    let rowPosition = sheetActiveUsers.getRange("A:A").createTextFinder(activeUser).ignoreDiacritics(true).matchEntireCell(true).findPrevious().getRow();
    userRol = sheetActiveUsers.getRange("C"+rowPosition).getDisplayValue();
    businessRol = sheetActiveUsers.getRange("D"+rowPosition).getDisplayValue();
    responseRequest = userDataExtraction();
  }
  return [activeUser, responseRequest, userRol, businessRol];
}

function getDataCommercialIntent() {
  let dataRange = sheetLeadsAutos.getRange("A:X").getDisplayValues();
  dataRange = dataRange.filter(row => {
    return row[15] === activeUser && row[14] === "Intención Comercial";
  });
  if (dataRange.length > 0) {
    dataRange = dataRange.map(row => {
      const dateAppend = new Date(row[0]);
      const now = new Date();
      const totalHours = getBusinessHours(dateAppend, now, holidays);
      let dataCalculate = "Baja";
      if (totalHours > 8 || /referidos/i.test(row[1])) {
        dataCalculate = "Alta";
      } else if (totalHours > 4 && (totalHours === 8 || totalHours < 8)) {
        dataCalculate = "Media";
      }
      return [row[0], dataCalculate, row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[13],row[10], row[14], row[16], row[17], row[19], row[21], row[18], row[22],row[23], ""];
    });
    dataRange = dataRange.sort((a, b) => {
      const order = { "Alta": 0, "Media": 1, "Baja": 2 };
      return order[a[0]] - order[b[0]];
    });
    let dataLengthTotalPremium360 = 0;
    let dataLengthTotalPremium = 0;
    let dataLengthTotalEstandar = 0;
    let dataLengthTotalClasico = 0;
    let dataLengthTotalLigero = 0;
    let dataLengthTotalVerde = 0;


    let dataPenddings = dataRange.filter(row => {
      if (row[2] === "PREMIUM+360") {
        dataLengthTotalPremium360 = dataLengthTotalPremium360 + 1
      } else if (row[2] === "PREMIUM") {
        dataLengthTotalPremium = dataLengthTotalPremium + 1
      } else if (row[2] === "ESTANDAR") {
        dataLengthTotalEstandar = dataLengthTotalEstandar + 1
      } else if (row[2] === "CLASICO") {
        dataLengthTotalClasico = dataLengthTotalClasico + 1
      } else if (row[2] === "LIGERO") {
        dataLengthTotalLigero = dataLengthTotalLigero + 1
      } else if (row[2] === "VERDE") {
        dataLengthTotalVerde = dataLengthTotalVerde + 1
      }
      return row[11] === "Intención Comercial";
    });
    let dataLengthTotalPenddigs = dataLengthTotalPremium360 + dataLengthTotalPremium + dataLengthTotalEstandar + dataLengthTotalClasico + dataLengthTotalLigero + dataLengthTotalVerde;
    let arrayDataPenddings = [dataPenddings, dataLengthTotalPenddigs, dataLengthTotalPremium360, dataLengthTotalPremium, dataLengthTotalEstandar,dataLengthTotalClasico,dataLengthTotalLigero,dataLengthTotalVerde];
    return arrayDataPenddings;
  } else {
    let arrayDataPenddings = [[], 0, 0, 0, 0, 0, 0, 0];
    return arrayDataPenddings;
  }
}

function getDataFollowUp() {
  let dataRange = sheetLeadsAutos.getRange("A:X").getDisplayValues();
  dataRange = dataRange.filter(row => {
    return row[15] === activeUser && (row[14] === "Contacto No Exitoso" || row[14] === "Gestión de Contacto");
  });
  if (dataRange.length > 0) {
    dataRange = dataRange.map(row => {
      const dateAppend = new Date(row[0]);
      const now = new Date();
      const totalHours = getBusinessHours(dateAppend, now, holidays);
      let dataCalculate = "Baja";
      if (totalHours > 8 || /referidos/i.test(row[1])) {
        dataCalculate = "Alta";
      } else if (totalHours > 4 && (totalHours === 8 || totalHours < 8)) {
        dataCalculate = "Media";
      }
      return [row[0], dataCalculate, row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[13],row[10], row[14], row[16], row[17], row[19], row[21], row[18], row[22],row[23], ""];
    });
    dataRange = dataRange.sort((a, b) => {
      const order = { "Alta": 0, "Media": 1, "Baja": 2 };
      return order[a[0]] - order[b[0]];
    });

    let dataLengthTotalPremium360 = 0;
    let dataLengthTotalPremium = 0;
    let dataLengthTotalEstandar = 0;
    let dataLengthTotalClasico = 0;
    let dataLengthTotalLigero = 0;
    let dataLengthTotalVerde = 0;


    let dataPenddings = dataRange.filter(row => {
      if (row[2] === "PREMIUM+360") {
        dataLengthTotalPremium360 = dataLengthTotalPremium360 + 1
      } else if (row[2] === "PREMIUM") {
        dataLengthTotalPremium = dataLengthTotalPremium + 1
      } else if (row[2] === "ESTANDAR") {
        dataLengthTotalEstandar = dataLengthTotalEstandar + 1
      } else if (row[2] === "CLASICO") {
        dataLengthTotalClasico = dataLengthTotalClasico + 1
      } else if (row[2] === "LIGERO") {
        dataLengthTotalLigero = dataLengthTotalLigero + 1
      } else if (row[2] === "VERDE") {
        dataLengthTotalVerde = dataLengthTotalVerde + 1
      }
      return row[11] === "Contacto No Exitoso" || row[11] === "Gestión de Contacto";
    });
    let dataLengthTotalPenddigs = dataLengthTotalPremium360 + dataLengthTotalPremium + dataLengthTotalEstandar + dataLengthTotalClasico + dataLengthTotalLigero + dataLengthTotalVerde;
    let arrayDataPenddings = [dataPenddings, dataLengthTotalPenddigs, dataLengthTotalPremium360, dataLengthTotalPremium, dataLengthTotalEstandar,dataLengthTotalClasico,dataLengthTotalLigero,dataLengthTotalVerde];
    return arrayDataPenddings;
  } else {
    let arrayDataPenddings = [[], 0, 0, 0, 0, 0, 0, 0];
    return arrayDataPenddings;
  }
}

function getDataGivenUp() {
  let dataRange = sheetLeadsAutos.getRange("A:X").getDisplayValues();
  dataRange = dataRange.filter(row => {
    return row[15] === activeUser && row[14] === "Desistido";
  });
  if (dataRange.length > 0) {
    dataRange = dataRange.map(row => {
      return [row[0], "DESISTIDO", row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[13],row[10], row[14], row[16], row[17], row[19], row[21], row[18], row[22],row[23], ""];
    });
    let dataLengthTotalPremium360 = 0;
    let dataLengthTotalPremium = 0;
    let dataLengthTotalEstandar = 0;
    let dataLengthTotalClasico = 0;
    let dataLengthTotalLigero = 0;
    let dataLengthTotalVerde = 0;


    let dataPenddings = dataRange.filter(row => {
      if (row[2] === "PREMIUM+360") {
        dataLengthTotalPremium360 = dataLengthTotalPremium360 + 1
      } else if (row[2] === "PREMIUM") {
        dataLengthTotalPremium = dataLengthTotalPremium + 1
      } else if (row[2] === "ESTANDAR") {
        dataLengthTotalEstandar = dataLengthTotalEstandar + 1
      } else if (row[2] === "CLASICO") {
        dataLengthTotalClasico = dataLengthTotalClasico + 1
      } else if (row[2] === "LIGERO") {
        dataLengthTotalLigero = dataLengthTotalLigero + 1
      } else if (row[2] === "VERDE") {
        dataLengthTotalVerde = dataLengthTotalVerde + 1
      }
      return row[11] === "Desistido";
    });
    let dataLengthTotalPenddigs = dataLengthTotalPremium360 + dataLengthTotalPremium + dataLengthTotalEstandar + dataLengthTotalClasico + dataLengthTotalLigero + dataLengthTotalVerde;
    let arrayDataPenddings = [dataPenddings, dataLengthTotalPenddigs, dataLengthTotalPremium360, dataLengthTotalPremium, dataLengthTotalEstandar,dataLengthTotalClasico,dataLengthTotalLigero,dataLengthTotalVerde];
    return arrayDataPenddings;
  } else {
    let arrayDataPenddings = [[], 0, 0, 0, 0, 0, 0, 0];
    return arrayDataPenddings;
  }
}


function getAuthTableUser(data) {
  console.log(data)
  let Rows = sheetActiveUsers.getRange("A:A").createTextFinder(data).matchEntireCell(true).ignoreDiacritics(true).findAll();
  let Result;
  if (Rows.length > 0) {
    const otp = generateOTP();
    guardarOTP(data, otp);
    enviarCodigoOTP(data, otp)
    Result = "Codigo Generado";
  } else {
    Result = "No Existe";
  }
  return Result;
}

function guardarOTP(usuario, codigoOTP) {
  const cache = CacheService.getScriptCache();
  const key = `otp_${usuario}`;
  const tiempoDeExpiracion = 60000;
  cache.put(key, codigoOTP, tiempoDeExpiracion);
}

function enviarCodigoOTP(email, otpGenerado) {
  console.log(otpGenerado)
  let pieza = HtmlService.createHtmlOutputFromFile("template_mail_OTP").getContent();
  console.log(otpGenerado[0])
  pieza = pieza.replaceAll('$$number1$$', otpGenerado[0]);
  pieza = pieza.replaceAll('$$number2$$', otpGenerado[1]);
  pieza = pieza.replaceAll('$$number3$$', otpGenerado[2]);
  pieza = pieza.replaceAll('$$number4$$', otpGenerado[3]);
  pieza = pieza.replaceAll('$$number5$$', otpGenerado[4]);
  pieza = pieza.replaceAll('$$number6$$', otpGenerado[5]);
  GmailApp.sendEmail(email, "Código de Verificación", "", {
    noReply: true,
    htmlBody: pieza
  });
}

function validateCode(code, user) {
  const cache = CacheService.getScriptCache();
  const key = `otp_${user}`;
  const codigoGuardado = cache.get(key);
  let userData;
  let response = {
    status: false,
    idUser: '',
    userArea: '',
    email: user
  }
  if (codigoGuardado === code) {
    activeUser = user;
    cache.remove(key);
    userData = userDataExtraction(user);
  }
  console.log(userData)
  return [response, userData];
}

function userDataExtraction(user) {
  if (activeUser === undefined) {
    activeUser = user;
  }
  let dataRange = sheetLeadsAutos.getRange("A:X").getDisplayValues();
  dataRange = dataRange.filter(row => {
    return row[15] === activeUser;
  });
  dataRange = dataRange.map(row => {
    const baseOrigin = row[1];
    const dateAppend = new Date(row[0]);
    const now = new Date();
    const totalHours = getBusinessHours(dateAppend, now, holidays);
    let dataCalculate = "Baja";
    if(baseOrigin.includes('CLICS')||baseOrigin.includes('REGIONALES')){
      dataCalculate = "Baja";
    }else{
      if (totalHours > 8 || /referidos/i.test(row[1])) {
        dataCalculate = "Alta";
      } else if (totalHours > 4 && (totalHours === 8 || totalHours < 8)) {
        dataCalculate = "Media";
      }
    }
    return [row[0], dataCalculate, row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[13],row[10], row[14], row[16], row[17], row[19], row[21], row[18], row[22],row[23], ""];
  });
  dataRange = dataRange.sort((a, b) => {
    const order = { "Alta": 0, "Media": 1, "Baja": 2 };
    return order[a[0]] - order[b[0]];
  });
  let dataLengthTotalPremium360 = 0;
    let dataLengthTotalPremium = 0;
    let dataLengthTotalEstandar = 0;
    let dataLengthTotalClasico = 0;
    let dataLengthTotalLigero = 0;
    let dataLengthTotalVerde = 0;


    let dataPenddings = dataRange.filter(row => {
      if (row[2] === "PREMIUM+360") {
        dataLengthTotalPremium360 = dataLengthTotalPremium360 + 1
      } else if (row[2] === "PREMIUM") {
        dataLengthTotalPremium = dataLengthTotalPremium + 1
      } else if (row[2] === "ESTANDAR") {
        dataLengthTotalEstandar = dataLengthTotalEstandar + 1
      } else if (row[2] === "CLASICO") {
        dataLengthTotalClasico = dataLengthTotalClasico + 1
      } else if (row[2] === "LIGERO") {
        dataLengthTotalLigero = dataLengthTotalLigero + 1
      } else if (row[2] === "VERDE") {
        dataLengthTotalVerde = dataLengthTotalVerde + 1
      }
      return row[11] === "Pendiente Gestión";
    });
    let dataLengthTotalPenddigs = dataLengthTotalPremium360 + dataLengthTotalPremium + dataLengthTotalEstandar + dataLengthTotalClasico + dataLengthTotalLigero + dataLengthTotalVerde;
    let arrayDataPenddings = [dataPenddings, dataLengthTotalPenddigs, dataLengthTotalPremium360, dataLengthTotalPremium, dataLengthTotalEstandar,dataLengthTotalClasico,dataLengthTotalLigero,dataLengthTotalVerde];
    return arrayDataPenddings;
  
  
}

function getBusinessHours(startDate, endDate, holidays = []) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let totalHours = 0;
  let current = new Date(start);
  const holidayDates = holidays.map(h => new Date(h).toISOString().split('T')[0]);
  while (current < end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      current.setDate(current.getDate() + 1);
      current.setHours(8, 0, 0, 0);
      continue;
    }
    const dateStr = current.toISOString().split('T')[0];
    if (holidayDates.includes(dateStr)) {
      current.setDate(current.getDate() + 1);
      current.setHours(8, 0, 0, 0);
      continue;
    }
    let dayStart = new Date(current);
    dayStart.setHours(8, 0, 0, 0);
    let dayEnd = new Date(current);
    dayEnd.setHours(17, 0, 0, 0);
    if (current < dayStart) current = dayStart;
    if (current >= dayEnd) {
      current.setDate(current.getDate() + 1);
      current.setHours(8, 0, 0, 0);
      continue;
    }
    let effectiveEnd = end > dayEnd ? dayEnd : end;
    let diffMs = effectiveEnd - current;
    if (diffMs > 0) {
      totalHours += diffMs / (1000 * 60 * 60);
    }
    current = new Date(effectiveEnd);
    if (effectiveEnd >= dayEnd) {
      current.setDate(current.getDate() + 1);
      current.setHours(8, 0, 0, 0);
    }
  }
  return totalHours;
}
let activeMail = Session.getActiveUser().getEmail();
function createEventForUser(dateValue, clientName, phoneClient, idUnique) {
  const startDate = new Date(dateValue);
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 15);

  const event = {
    summary: "Recordatorio Contactar Lead",
    description: "Ha llegado la hora, recuerda llamar al cliente " + clientName + ", el número de contacto es " + phoneClient,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "America/Bogota"
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "America/Bogota"
    },
    attendees: [{ email: activeMail }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 10 },
        { method: 'popup', minutes: 5 },
      ],
    },
  };
  Calendar.Events.insert(event, "campanasasistidas@segurosbolivar.com");
  let rowWareHouse = sheetLeadsAutos.getRange("D:D").createTextFinder(idUnique).matchEntireCell(true).ignoreDiacritics(true).findPrevious().getRow();
  let dataTimeLine = sheetLeadsAutos.getRange("Q" + rowWareHouse).getValue();
  dataTimeLine = JSON.parse(dataTimeLine);
  let dateCreateRecordatory = formateDateRecordatorys(new Date());
  let dateRecordatory = formateDateRecordatorys(startDate);
  let newObjectTimeLine = new Object({
    "TimeLine": "Recordatorio",
    "date": dateCreateRecordatory,
    "commentary": "El usuario " + activeMail + " creó un recordatorio para el día " + dateRecordatory + "."
  });
  dataTimeLine.push(newObjectTimeLine);
  dataTimeLine = JSON.stringify(dataTimeLine);
  sheetLeadsAutos.getRange("Q" + rowWareHouse).setValue(dataTimeLine);
  return [200, 'success', dateRecordatory, dataTimeLine];
}

function saveDataManagment(clientInfoData, decisionTreeData, idUnique, sectionSelected) {
  let dateManaged = new Date();
  let dateCreateRequest = formateDateRecordatorys(dateManaged);
  let typeManagement = decisionTreeData['¿Cliente contactado?'];
  let requestStatus;
  let commentaryTimeLine;
  let subStatus;
  if (typeManagement === "no") {
    let resultContact = decisionTreeData['Motivo de no contacto'];
    console.log(resultContact)
    if (resultContact === "No conocen al cliente") {
      requestStatus = 'Desistido';
    } else {
      requestStatus = 'Contacto No Exitoso';
    }
    commentaryTimeLine = '<b>Contacto no exitoso, ' + decisionTreeData['Motivo de no contacto'] + '</b>';
    subStatus = decisionTreeData['Motivo de no contacto'];
  } else {
    let resultContact = decisionTreeData['Resultado del contacto'];
    if (resultContact === "Volver a Contactar") {
      requestStatus = 'Gestión de Contacto';
      commentaryTimeLine = '<b>Contacto exitoso, el cliente desea ser recontactado, ' + decisionTreeData['Gestión de contacto'] + '</b>';
      subStatus = decisionTreeData['Gestión de contacto'];
    } else if (resultContact === "No Acepta") {
      requestStatus = 'Desistido';
      let requestReason = decisionTreeData['Motivo de no aceptación'];
      let finalyRequestReason;
      if (['No escucha propuesta', 'Muy costoso', 'No le interesa'].includes(requestReason)) {
        finalyRequestReason = decisionTreeData['Motivo de no aceptación'] + " - " + decisionTreeData['Detalle del motivo de rechazo']
      } else {
        finalyRequestReason = requestReason;
      }
      commentaryTimeLine = '<b>Contacto no exitoso, el cliente desiste del proceso, ' + finalyRequestReason + '</b>';
      subStatus = finalyRequestReason;
    } else if (resultContact === "Acepta") {
      requestStatus = 'Intención Comercial';
      commentaryTimeLine = '<b>Posible cliente 🎉, asesor marca opción: ' + decisionTreeData['Estado de la gestión'] + '</b>';
      subStatus = decisionTreeData['Estado de la gestión'];
    }
  }
  let detailsPoliza = new Object({
    'poliza_type': clientInfoData['typePoliza'],
    'product_type': clientInfoData['detailsPlanPoliza']
  });
  let historyObservations = new Object({
    'userTypeObservation': 'asesor',
    'userName': activeMail,
    "date": dateCreateRequest,
    'observation': decisionTreeData['Observaciones']
  });
  let newObjectTimeLine = new Object({
    "TimeLine": "Gestión Lead",
    "date": dateCreateRequest,
    "commentary": "El usuario " + activeMail + " realizó gestión del lead con resultado: " + commentaryTimeLine + "."
  });
  let rowWareHouse = sheetLeadsAutos.getRange("D:D").createTextFinder(idUnique).matchEntireCell(true).ignoreDiacritics(true).findPrevious().getRow();

  let dataTimeLine = sheetLeadsAutos.getRange("Q" + rowWareHouse).getValue();
  dataTimeLine = JSON.parse(dataTimeLine);
  dataTimeLine.push(newObjectTimeLine);
  dataTimeLine = JSON.stringify(dataTimeLine);
  sheetLeadsAutos.getRange("Q" + rowWareHouse).setValue(dataTimeLine);

  let dataHistoryObservations = sheetLeadsAutos.getRange("R" + rowWareHouse).getValue();
  if (dataHistoryObservations === "") {
    historyObservations = JSON.stringify([historyObservations]);
    sheetLeadsAutos.getRange("R" + rowWareHouse).setValue(historyObservations);
  } else {
    dataHistoryObservations = JSON.parse(dataHistoryObservations);
    dataHistoryObservations.push(historyObservations);
    historyObservations = JSON.stringify(dataHistoryObservations);
    sheetLeadsAutos.getRange("R" + rowWareHouse).setValue(historyObservations);
  }
  detailsPoliza = JSON.stringify(detailsPoliza);
  sheetLeadsAutos.getRange("V" + rowWareHouse).setValue(detailsPoliza);
  let timesManaged = sheetLeadsAutos.getRange("T" + rowWareHouse).getValue();
  if (timesManaged === "") {
    sheetLeadsAutos.getRange("T" + rowWareHouse).setValue(1);
  } else {
    timesManaged = parseInt(String(timesManaged)) + 1
    sheetLeadsAutos.getRange("T" + rowWareHouse).setValue(timesManaged);
  }
  if (clientInfoData['data_valores_poliza'] != null) {
    if (clientInfoData['data_valores_poliza'][0].length > 0) {
      let newObjectDataPolizas = [];
      for (let i = 0; i < clientInfoData['data_valores_poliza'][0].length; i++) {
        let dataIterada = new Object({
          "numberPoliza": clientInfoData['data_valores_poliza'][0][i][0],
          "amountPoliza": clientInfoData['data_valores_poliza'][0][i][1],
        })
        newObjectDataPolizas.push(dataIterada)
      }
      sheetLeadsAutos.getRange("W" + rowWareHouse).setValue(JSON.stringify(newObjectDataPolizas));
    }
  }

  sheetLeadsAutos.getRange("O" + rowWareHouse).setValue(requestStatus);
  sheetLeadsAutos.getRange("S" + rowWareHouse).setValue(subStatus);
  sheetLeadsAutos.getRange("U" + rowWareHouse).setValue(dateManaged);
  let dataUpdate;
  if (sectionSelected === "Pendientes Gestión") {
    dataUpdate = userDataExtraction();
  } else if (sectionSelected === "Seguimiento Leads") {
    dataUpdate = getDataFollowUp();
  } else if (sectionSelected === "Intención Comercial") {
    dataUpdate = getDataCommercialIntent();
  } else if (sectionSelected === "Desistidos") {
    dataUpdate = getDataGivenUp();
  }
  return ['200', dataUpdate]
}

function formateDateRecordatorys(dateCreateRecordatory) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'America/Bogota',
    hour12: true
  };
  const formatter = new Intl.DateTimeFormat('es-CO', options);
  const requestDate = formatter.format(dateCreateRecordatory);
  return requestDate;
}

function createNewClient(formData) {
  let parameterCode = "REFE-";
  let requestCode = generateIdUnique(parameterCode)
  let dateManaged = new Date();
  let dateFormat = formateDateRecordatorys(dateManaged);
  let dateWarehouse = Utilities.formatDate(dateManaged, "America/Bogota", "yyyy-MM-dd HH:mm:ss");
  let objectInfoReferido;
  let objectText = new Object({
    "TimeLine": "Asignación",
    "date": dateFormat,
    "commentary": "Sistema asigna caso a " + activeUser
  });

  if (formData["modalReferidosFuenteReferido"] != "REFERIDO PROPIO") {
    objectInfoReferido = new Object({
      "Nombre": formData["modalReferidosNombreRadicador"],
      "Cédula": formData["modalReferidosNumeroDocumentoRadicador"]
    })
    objectInfoReferido = JSON.stringify([objectInfoReferido])
    tabledataReferidos.appendRow([dateWarehouse, requestCode, objectInfoReferido])
  }
  objectText = JSON.stringify([objectText])
  sheetLeadsAutos.appendRow([dateWarehouse, formData["modalReferidosFuenteReferido"], formData["modalReferidosTipoProducto"], requestCode, formData["modalReferidosNombreCliente"].toUpperCase(), "57" + formData["modalReferidosNumeroCelular"], formData["modalReferidosCorreoElectronico"], formData["modalReferidosTipoDocumento"], formData["modalReferidosNumeroDocumento"], "Sí autorizo.",formData["modalReferidosPlaca"], "", "","",  "Pendiente Gestión", activeUser, objectText, "", "", 0]);
  let userDataRange = userDataExtraction(activeUser)
  return userDataRange;
}

function saveManagmentLeadEPS(clientInfoData, idUnique) {
  let dateManaged = new Date();
  let dateCreateRequest = formateDateRecordatorys(dateManaged);
  let detailsPoliza = new Object({
    'poliza_type': clientInfoData['typePoliza'],
    'car_product': clientInfoData['detailsPoliza']
  });
  let historyObservations = new Object({
    'userTypeObservation': 'system',
    'userName': 'Sistema',
    "date": dateCreateRequest,
    'observation': 'Se desiste el caso automáticamente debido a que el cliente no tiene EPS.'
  });
  let newObjectTimeLine = new Object({
    "TimeLine": "Gestión Lead",
    "date": dateCreateRequest,
    "commentary": "El sistema desistió el caso automáticamente debido a que el cliente no tiene EPS."
  });
  let rowWareHouse = sheetLeadsAutos.getRange("D:D").createTextFinder(idUnique).matchEntireCell(true).ignoreDiacritics(true).findPrevious().getRow();

  let dataTimeLine = sheetLeadsAutos.getRange("Q" + rowWareHouse).getValue();
  dataTimeLine = JSON.parse(dataTimeLine);
  dataTimeLine.push(newObjectTimeLine);
  dataTimeLine = JSON.stringify(dataTimeLine);
  sheetLeadsAutos.getRange("Q" + rowWareHouse).setValue(dataTimeLine);

  let dataHistoryObservations = sheetLeadsAutos.getRange("R" + rowWareHouse).getValue();
  if (dataHistoryObservations === "") {
    historyObservations = JSON.stringify([historyObservations]);
    sheetLeadsAutos.getRange("R" + rowWareHouse).setValue(historyObservations);
  } else {
    dataHistoryObservations = JSON.parse(dataHistoryObservations);
    dataHistoryObservations.push(historyObservations);
    historyObservations = JSON.stringify(dataHistoryObservations);
    sheetLeadsAutos.getRange("R" + rowWareHouse).setValue(historyObservations);
  }
  sheetLeadsAutos.getRange("O" + rowWareHouse).setValue('Desistido');
  sheetLeadsAutos.getRange("S" + rowWareHouse).setValue('No cumple políticas - Sin EPS');
  sheetLeadsAutos.getRange("U" + rowWareHouse).setValue(dateManaged);
  let dataUpdate = userDataExtraction();
  return ['200', dataUpdate]
}

function generateIdUnique(segment) {
  let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"];
  let random1 = Math.floor(Math.random() * 10),
    random2 = Math.floor(Math.random() * letters.length),
    random3 = Math.floor(Math.random() * 10),
    random4 = Math.floor(Math.random() * 10),
    random5 = Math.floor(Math.random() * 10),
    random6 = Math.floor(Math.random() * 10),
    random7 = Math.floor(Math.random() * letters.length),
    random8 = Math.floor(Math.random() * 10),
    random9 = Math.floor(Math.random() * letters.length);
  let letter1 = letters[random2],
    letter2 = letters[random7],
    letter3 = letters[random9];
  let uniqueCode = segment + random1 + letter1 + random3 + random4 + random5 + random6 + letter2 + random8 + letter3;
  return uniqueCode;
}

function generateOTP() {
  let letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  let random1 = Math.floor(Math.random() * letters.length);
  let random2 = Math.floor(Math.random() * 10);
  let random3 = Math.floor(Math.random() * 10);
  let random4 = Math.floor(Math.random() * letters.length);
  let random5 = Math.floor(Math.random() * 10);
  let random6 = Math.floor(Math.random() * letters.length);
  let letter1 = letters[random1];
  let letter2 = letters[random4];
  let letter3 = letters[random6];
  return letter1 + random2 + random3 + letter2 + random5 + letter3;
}

function obtenerPiezasHTML() {
  const ultimafila = sheetPiezas.getLastRow();
  const data = sheetPiezas.getRange("A2:B" + ultimafila).getDisplayValues();
  const dataFinal = data.map(item => {
    const idDocumento = item[1];
    const file = DriveApp.getFileById(idDocumento);
    const htmlContent = file.getBlob().getDataAsString('UTF-8');
    return {
      previsual: item[0],
      html: htmlContent,
      id: idDocumento
    };
  });
  return dataFinal
}

function generarPieza(modifiedHtml, selectedFormat, name) {
  const folderId = "1mtuBeJ4Wn4tjq_etE6fNxM-HpDIvKAZA";
  if (selectedFormat == "html") {
    const folder = DriveApp.getFolderById(folderId);
    const htmlFile = folder.createFile(name+".html", modifiedHtml, MimeType.HTML);
    const fileBytes = htmlFile.getBlob().getBytes();
    const nameFinal = htmlFile.getName();
    const base64Html = Utilities.base64Encode(fileBytes);
    return {base64 : base64Html,name: nameFinal};
  }else if(selectedFormat == "pdf"){
    const idPdf = generarPDF(modifiedHtml, name);
     const fileBytes = DriveApp.getFileById(idPdf).getBlob().getBytes();
      const nameFinal = DriveApp.getFileById(idPdf).getName();
      const base64Pdf = Utilities.base64Encode(fileBytes);
      return {base64 : base64Pdf,name: nameFinal};
  }
}

function generarPDF(htmlContent, nombreArchivo) {
  const cloudFunctionUrl = PropertiesService.getScriptProperties().getProperty("urlCloudFunction");
  try {
    const token = ScriptApp.getIdentityToken();
    const payload = JSON.stringify({
      html: htmlContent
    });

    const options = {
      method: "post",
      contentType: "application/json",
      payload: payload,
      headers: {
        "Authorization": "Bearer " + token
      },
      muteHttpExceptions: true
    };

    Logger.log("Llamando a la Cloud Function...");
    const respuesta = UrlFetchApp.fetch(cloudFunctionUrl, options);
    const codigoRespuesta = respuesta.getResponseCode();

    if (codigoRespuesta === 200) {
      const blobPdf = respuesta.getBlob();
      const nombrePdf = nombreArchivo.replace(/\.(html|htm)$/, "") + ".pdf";
      const folder = DriveApp.getFolderById("1mtuBeJ4Wn4tjq_etE6fNxM-HpDIvKAZA");
      const archivoCreado = folder.createFile(blobPdf.setName(nombrePdf));
      return archivoCreado.getId();

    } else {
      Logger.log(`❌ Error al llamar a la Cloud Function. Código: ${codigoRespuesta}`);
      Logger.log(`Respuesta del servidor: ${respuesta.getContentText()}`);
    }

  } catch (e) {
    Logger.log(`❌ Error fatal en Apps Script: ${e.toString()}`);
  }
}


