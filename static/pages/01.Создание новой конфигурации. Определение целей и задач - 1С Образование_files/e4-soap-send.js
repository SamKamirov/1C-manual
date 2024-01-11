var URL_SCHOOL_COLLECTION = "http://school-collection.edu.ru/";

var ContentLoader2 = function () {
};

ContentLoader2.prototype = {
    XMLHttp: null,
    userhandler: null,
    aditinalparams: null,
    urlToCall: '',
    sBody: '',

    getHttpRequest: function() {
        var xmlHttp = null;
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP")
        }
        catch(e) {
            try {
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP")
            }
            catch(oc) {
                xmlHttp = null
            }
        }
        if (!xmlHttp && typeof XMLHttpRequest != "undefined")
            xmlHttp = new XMLHttpRequest();
        return xmlHttp
    },

    loadContent: function(urlToCall, requestHandlerPointer, sBody, params) {
        this.urlToCall = urlToCall;
        this.sBody = sBody;
        this.aditinalparams = params;
        this.userhandler = requestHandlerPointer;
        var self = this;
        try {
            if (this.XMLHttp && this.XMLHttp.readyState != 0) {
                this.XMLHttp.abort();
            }
            this.XMLHttp = this.getHttpRequest();

            if (this.XMLHttp) {
                if (sBody) {
                    this.XMLHttp.open("POST", urlToCall, true);
                    this.XMLHttp.setRequestHeader('Content-Type', 'text/xml');
                    //this.XMLHttp.setRequestHeader('encoding','UTF-8');
                }
                else
                    this.XMLHttp.open("GET", urlToCall, true);

                if (typeof(requestHandlerPointer) == 'function') {
                    this.XMLHttp.onreadystatechange = function() {
                        self.stateChangeCallbackHttp(self);
                    }
                }
                this.XMLHttp.send(sBody ? sBody : null)
            }
            else {
                alert("err ContentLoader: Не удалось инициализировать объект HttpRequest")
            }
        }
        catch (e) {
            alert('err ContentLoader2: ' + (e.description ? e.description : e.toString()));
        }
    },

    stateChangeCallbackHttp: function() {
        if (this.XMLHttp.readyState == 4) {
            if (this.XMLHttp.status == 200) {
                if (typeof(this.userhandler) == 'function')
                    this.userhandler(this.XMLHttp.responseText, this.aditinalparams);
            }
            else if (this.XMLHttp.status == 0) {
            }
            else {
                alert("err ContentLoader.stateChangeCallbackHttp: Ошибка соединения " + this.XMLHttp.status + "\nresponseText:\n" + this.XMLHttp.responseText);
            }
        }
    }
};

/** Сформировать отчет для отправки на сайт Единой коллекции ЦОР */
function getDlrReport(guid, commentId, commentType, commentMark, comment, user, school, city, appId, appSn, replyTo, date) {
    var dlrReport = "";
    if (comment && user && school && city && appId && appSn && replyTo) {
        dlrReport = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                    "<dlrReport date=\"" + date + "\">" +
                    "<sender appId=\"" + appId + "\" appSerNumber=\"" + appSn + "\">" +
                    "<organization>" + school + "</organization>" +
                    "<city>" + city + "</city>" +
                    "<replyTo>" + replyTo + "</replyTo>" + "</sender>" +
                    "<dlrComments guid=\"" + guid + "\">" + "<comment id=\"" +
                    commentId + "\" " + "type=\"" +
                    commentType + "\" " +
                    "estimation=\"" + commentMark + "\" " +
                    "author=\"" + user + "\" " +
                    "date=\"" + date + "\">" +
                    decodeURIComponent(comment) + "</comment>" + "</dlrComments>" + "</dlrReport>";
    }
    
    return dlrReport;
}

function sendSoapMsg(guid, commentId, commentType, commentMark, comment, user, school, city, appId, appSn, replyTo, date) {
    var dlrReport = getDlrReport(guid, commentId, commentType, commentMark, comment, user, school, city, appId, appSn, replyTo, date);
    var soapEnv = getSoapEnv(dlrReport);
    sendSoapEnv(soapEnv);
}


/** Упаковать отчет в SOAP-конверт */
function getSoapEnv(dlrReport) {
    // Обрабатываем спецсимволы XML (требование программы обработки на стороне Информики)
    var escapedDlrReport = dlrReport ? dlrReport.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : "";
    // Создаем конверт
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
            "<SOAP-ENV:Envelope" + " xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\"" +
            " xmlns:SOAP-ENC=\"http://schemas.xmlsoap.org/soap/encoding/\"" +
            " SOAP-ENV:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"" +
            " xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"" +
            " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" +
            " xmlns:ns4=\"urn:SOAP_DlrReport\">" + "<SOAP-ENV:Body>" +
            "<ns4:processReportXml>" + "<reportXml xsi:type=\"xsd:string\">" +
            escapedDlrReport + "</reportXml>" + "</ns4:processReportXml>" +
            "</SOAP-ENV:Body>" + "</SOAP-ENV:Envelope>" + "";
}


/** Отправить SOAP-конверт */
function sendSoapEnv(soap) {
    var cl2 = new ContentLoader2();
    cl2.loadContent(URL_SCHOOL_COLLECTION + "reportProcess.php", function(response) {
        if(response == null)
            alert("Ошибка произошла при отправке комментария на сервер " + URL_SCHOOL_COLLECTION + ".");
    }, soap, null);
}


