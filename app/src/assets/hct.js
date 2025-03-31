(function () {
  let HcTracker = function() {
    // url de l'application encodée
    let app_token         = "aHR0cHM6Ly9oY3QubmV0LWhlbGl1bS5mcg=="
    // Code de tracking de l'application
    let tracking_code     = null;
    // Durée de validité du cookie (en jours)
    let cookieExpiration  = 395;
    // Durée de validité de la session (en minutes)
    let sessionExpiration = 30;
    // Paramètres de tracking (identification de la source)
    let tracking_keys     = [ "utm_source", "utm_medium", "utm_campaign" , "utm_term", "utm_content",  "url", "pk_campaign", "pk_kwd", "pk_source", "pk_medium", "pk_content", "utm_id", "gad_source", "gclid" ];
    // Paramètres de tracking (données personnelles)
    let contact_keys      = [ "hct_e", "hct_p", "hc_id", "hct_id_1", "hct_id_2", "hct_id_3", "hct_id_4", "hct_id_5", 'email', 'mail', 'e_mail', 'phone', 'phone_number', 'phonenumber', 'mobile', 'telephone' ];
    // Noms des cookies externes qui seront récupérés et envoyés au serveur
    let externalCookies   = null;
    // Token de la session
    let sessionToken      = null;
    // Token du navigateur
    let browserToken      = null;
    // Gestion du consentement (désactivé si la librairie n'est chargée que quand l'utilisateur a donné son consentement)
    let withConsent       = true;

    let initTokens = function() {
      var queryString = parseQueryString();
      let cookie = getCookie();
      cookie     = cookie || {};
      let register   = false;

      if (sessionToken == null) {
        if (queryString.hct_session) {
          sessionToken = queryString.hct_session;
          register     = true;

          cookie['browser_registered']      = false; // On force le réenregistrement du navigateur au changement de session
          cookie['htms']                    = {};
          cookie['htms'][sessionToken]      = {};
          cookie['contact']                 = {};
          cookie['contact'][sessionToken]   = {};
        }
        else if (cookie != null && cookie['session_token'] != null && cookie['session_expired_at'] > Date.now()) {
          sessionToken = cookie['session_token'];
        }
        else {
          sessionToken = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
          register     = true;

          cookie['browser_registered']      = false; // On force le réenregistrement du navigateur au changement de session
          cookie['htms']                    = {};
          cookie['htms'][sessionToken]      = {};
          cookie['contact']                 = {};
          cookie['contact'][sessionToken]   = {};
        }
      } else if (queryString.hct_session && queryString.hct_session != sessionToken) {
        sessionToken = queryString.hct_session;
      }

      if (Object.keys(cookie).indexOf('anonym') < 0)     { cookie['anonym']     = true; }
      if (Object.keys(cookie).indexOf('consent_at') < 0) { cookie['consent_at'] = null; }
      if (Object.keys(cookie).indexOf('expired_at') < 0) { cookie['expired_at'] = null; }

      for ( const attr in queryString ) {
        if ( tracking_keys.indexOf(attr) >= 0 ) {
          cookie['htms'][sessionToken][attr]    = queryString[attr];
        }
        else if ( contact_keys.indexOf(attr) >= 0 ) {
          cookie['contact'][sessionToken][attr] = queryString[attr];
        }
      }

      // Prolongation de la session
      cookie['session_token']      = sessionToken;
      cookie['session_expired_at'] = (Date.now() + (sessionExpiration * 60 * 1000));

      if (browserToken == null) {
        if (queryString.hct_browser) {
          browserToken = queryString.hct_browser;
        }
        else if (cookie != null && cookie['token'] != null) {
          browserToken = cookie['token'];
        }
        else {
          browserToken = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
          cookie['browser_registered'] = false;
        }
      } else if (queryString.hct_browser && queryString.hct_browser != browserToken) {
        browserToken = queryString.hct_browser;
      }

      cookie['token'] = browserToken;
      setCookie(cookie);

      if (register) {
        sendDatas('/register', { token: browserToken, session_token: sessionToken, navigator: window.navigator, anonym: anonymize() });
      }

      window.dispatchEvent(new Event("hct.tokensUpdate"));
    }

    let localStorageAvailable = function() {
      try {
        if (localStorage) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }

    let getCookie = function(cookie_name = 'hct') {
      if (localStorageAvailable()) {
        if (localStorage.getItem(cookie_name)) {
          var cookie = localStorage.getItem(cookie_name);

          if (cookie != null && !cookie.match(/^\{/)) {
            cookie = window.atob(cookie);
          }

          var name = cookie_name + "=";
          var decodedCookie = decodeURIComponent(document.cookie);
          var ca = decodedCookie.split(';');

          return JSON.parse(cookie);
        }
      } else {
        var name = cookie_name + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');

        for(var i = 0; i <ca.length; i++) {
          var c = ca[i];

          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }

          if (c.indexOf(name) == 0) {
            var cookie = c.substring(name.length, c.length);

            if (cookie != null && !cookie.match(/^\{/)) {
              cookie = window.atob(cookie);
            }

            return JSON.parse(cookie);
          }
        }
      }

      return null;
    }

    let setCookie = function(cookie, cookie_name = 'hct') {
      if(!doNotTrack()) {
        if(localStorageAvailable()) {
          localStorage.setItem(cookie_name, window.btoa(JSON.stringify(cookie)));
        } else {
          var d = new Date();
          d.setTime(d.getTime() + (cookieExpiration * 24 * 60 * 60 * 1000));
          var expires = "expires="+ d.toUTCString();
          document.cookie = cookie_name + "=" + window.btoa(JSON.stringify(cookie)) + ";" + expires + ";domain=.net-helium.dev;path=/";
        }
      }
    }

    // [ Méthode privée ] Permet de savoir si les données doivent être anonymisées (aucune information personnelle, aucune information sur le navigateur)
    let anonymize = function() {
      if (!withConsent) { return false; }

      let cookie = getCookie();

      if (cookie != null && Object.keys(cookie).indexOf('anonym') >= 0) {
        if(cookie['anonym']) {
          return true;
        }
        else {
          return cookie['expired_at'] <= Date.now();
        }
      }
      else if (cookie != null && cookie['expired_at'] > Date.now()) {
        return false;
      }
      else {
        return true;
      }
    }

    // [ Méthode privée ] Merge de 2 hash (le 2er hash est prioritaire)
    let merge = function(obj1, obj2) {
      let obj = {};
      for (var attrname in obj1) { obj[attrname] = obj1[attrname]; }
      for (var attrname in obj2) { obj[attrname] = obj2[attrname]; }
      return obj;
    }

    // [ Méthode privée ] Récupération des informations de taille de l'écran (utilisées pour l'identification du type de navigateur)
    let screenResolution = function() {
      var width  = 0;
      var height = 0;
      var datas  = {};

      if ( window.screen != null ) {
        datas["screen_width"]  = window.screen.width;
        datas["screen_height"] = window.screen.height;
      }

      datas["device_pixel_ratio"] = window.devicePixelRatio;

      if ( window.document != null && window.document.documentElement != null ) {
        datas["client_width"]  = window.document.documentElement.clientWidth;
        datas["client_height"] = window.document.documentElement.clientHeight;
      }

      return datas;
    }

    // [ Méthode privée ] Récupération des cookies externes
    let getExternalCookies = function() {
      var cookies = {};

      if (externalCookies != null && externalCookies != "") {
        var cookie_names = window.atob(externalCookies).split(',');

        if(document.cookie != null && document.cookie != "") {
          var decoded_cookies = document.cookie.split(";");

          for(var i = 0; i < decoded_cookies.length; i++) {
            var name  = decoded_cookies[i].replace(/^([^=]*)=(.*)$/, '$1');
            var value = decoded_cookies[i].replace(/^([^=]*)=(.*)$/, '$2');

            if (name.match(/^ (.*)$/)) {
              name = name.replace(/^ (.*)$/, '$1');
            }

            if (cookie_names.indexOf(name) >= 0) {
              cookies[name] = value;
            }
          }
        }
      }

      return cookies;
    }

    // [ Méthode privée ] Génération de la query string
    let jsonToQueryString = function(json, parent, array) {
      parent = parent || "";
      array  = array || false;

      return Object.keys(json).map(function(key) {
        let k = encodeURIComponent(key)

        if (parent !== "") {
          k = "[" + k + "]"
        }

        if (array) {
          k = "[]" + k
        }

        let v = ""

        if (json[key] != null) {
          var cstname = json[key].constructor.name;

          if (cstname == undefined) {
            cstname = json[key].toString().replace(/^\[object (.*)\]$/gi, '$1');
          }

          switch (cstname) {
            case 'Array':
            case 'PluginArray':
              var _arr = []
              if (json[key].length > 0) {
                for(var idx = 0; idx < json[key].length; idx++) {
                  _arr.push(json[key][idx]);
                }
              }
              return jsonToQueryString(_arr, parent + k);
            case 'Object':
              return jsonToQueryString(json[key], parent + k);
            case 'Navigator':
            case 'Geolocation':
            case 'MediaCapabilities':
            case 'NetworkInformation':
            case 'MimeType':
            case 'MimeTypeArray':
            case 'UserActivation':
            case 'MediaSession':
            case 'Keyboard':
            case 'LockManager':
            case 'Presentation':
            case 'Bluetooth':
            case 'USB':
            case 'XRSystem':
            case 'WakeLock':
            case 'Plugin':
            case 'DeprecatedStorageQuota':
            case 'Promise':
            case 'Permissions':
            case 'GamepadList':
            case 'MediaDevices':
            case 'ServiceWorkerContainer':
            case 'CredentialsContainer':
            case 'Clipboard':
            case 'StorageManager':
              var _navigator = {};

              for (var i in json[key]) {
                if (i == 'enabledPlugin') { continue; }

                if (typeof json[key][i] === 'function') {
                  _navigator[i] = 'undefined';
                } else {
                  _navigator[i] = json[key][i];
                }
                if (_navigator[i] == 'undefined'){
                    delete _navigator[i];
                }
              }

              return jsonToQueryString(_navigator, parent + k);
            default:
              v = encodeURIComponent(json[key]);
              return parent + k + '=' + v;
          }
        }
      }).filter(function(el){
        return (el != null && el != undefined && el != "")
      }).join('&');
    }

    // [ Méthode privée ] Parsing de la Query String pour récupérer extraite les informations de tracking (association)
    let parseQueryString = function() {
      let query      = window.location.search.replace(/^\?/, '');
      let attributes = {};

      for (var i = 0; i < query.split("&").length; i++) {
        let attr  = query.split("&")[i];
        let key   = attr.replace(/^(.*)=(.*)$/, '$1');
        let value = attr.replace(/^(.*)=(.*)$/, '$2');

        attributes[key] = value;
      }

      return attributes;
    }

    // [ Méthode privée ] Appel de l'API
    let sendDatas    = function(path, datas) {
      if (!doNotTrack()) {
        if ( typeof(datas) == 'undefined' || datas == null ) { datas = {}; }

        let contact = {};
        let cookie  = getCookie() || {};
        let cDatas  = {}

        cookie['contact']                 = {};
        cookie['contact'][sessionToken]   = {};

        if (datas.hasOwnProperty('contact') && typeof(datas['contact']) != 'undefined' && datas['contact'] != null) { cDatas = datas['contact']; }
        cDatas = merge(cookie['contact'][sessionToken], cDatas);

        for (var attrname in cDatas) {
          switch (attrname) {
            case 'id':
              contact['hct_id_1'] = cDatas[attrname];
            case 'hc_id':
            case 'hct_id_1':
            case 'hct_id_2':
            case 'hct_id_3':
            case 'hct_id_4':
            case 'hct_id_5':
              contact[attrname] = cDatas[attrname];
              break;
            case 'email':
            case 'e_mail':
            case 'mail':
              contact['hct_e'] = cDatas[attrname];
              break;
            case 'phone':
            case 'phonenumber':
            case 'phone_number':
            case 'mobile':
            case 'telephone':
              contact['hct_p'] = contact['hct_p'] || []
              contact['hct_p'].push(cDatas[attrname]);
              break;
            default:
              contact[attrname] = cDatas[attrname];
              break;
          }
        }

        cookie['contact'][sessionToken] = contact;
        setCookie(cookie);

        // On retire les informations du contact si les données doivent être anonymisées
        if (!anonymize()) { datas['contact'] = contact; } else { datas['contact'] = null; }

        if (tracking_code != null) {
          path = path + '/' + tracking_code;

          // Les informations du navigateurs ne sont pas transmises en mode anonyme
          if(!anonymize()) { datas['external_cookies'] = getExternalCookies(); }

          datas['token']              = browserToken;
          datas['session_token']      = sessionToken;
          datas['url']                = window.location.origin + window.location.pathname;
          datas['query']              = window.location.search;
          datas['title']              = window.document.title;
          datas['referrer']           = encodeURI(window.document.referrer);
          datas['scr_resolution']     = screenResolution();
          datas['anonym']             = anonymize();
          datas['htms']               = cookie['htms'][sessionToken];

          var qs_datas = jsonToQueryString(datas);

          let xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function() {};
          xhr.open('POST', window.atob(app_token) + path, true);
          xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          xhr.send("q=" + encodeURIComponent(window.btoa(encodeURI(qs_datas))));
        }
      }
    }

    // [ Méthode privée ] Vérification de l'activation du tracking
    // - Vérification de l'option "doNotTrack" du navigateur
    // - Vérification de l'activation des cookies du navigateur
    let doNotTrack = function() {
      return false;

      let dnt = (this.navigator.doNotTrack || this.doNotTrack || this.navigator.msDoNotTrack || "");

      if ( ["1", "true", "yes"].indexOf(dnt.toString()) >= 0 || !this.navigator.cookieEnabled) {
        return true;
      }

      return false;
    }

    // Création des informations en localStorage
    let createCookie = function(type, consent_at, expire_at) {
      if (!doNotTrack()) {
        let cookie          = getCookie();
        let anonym          = anonymize();
        let consent_at      = (typeof(consent_at) == 'undefined' || consent_at == null ? cookie['consent_at'] : consent_at );
        let expire_at       = (typeof(expire_at) == 'undefined' || expire_at == null ? cookie['expired_at'] : expire_at );
        var trigger_consent = true;

        switch(type) {
          // case 'create':
          //   if (cookie != null && Object.keys(cookie).indexOf('anonym') >= 0) {
          //     anonym = cookie['anonym'];
          //   }
          // 
          //   if (cookie != null && Object.keys(cookie).indexOf('consent_at') >= 0 && !anonym) {
          //     consent_at = cookie['consent_at'];
          //     expire_at  = (consent_at + (cookieExpiration * 24 * 60 * 60 * 1000));
          //   }
          // 
          //   if (cookie != null && Object.keys(cookie).indexOf('expired_at') >= 0 && !anonym) {
          //     expire_at = cookie['expired_at'];
          //   }
          // 
          //   break;
          case 'activate':
            anonym     = false;
            consent_at = (typeof(consent_at) == 'undefined' ? null : consent_at ) || (typeof(cookie) == 'undefined' || cookie == null || typeof(cookie['consent_at']) == 'undefined' ? null : cookie['consent_at']) || Date.now();
            expire_at  = (typeof(expire_at) == 'undefined' ? null : expire_at ) || (typeof(cookie) == 'undefined' || cookie == null || typeof(cookie['expire_at']) == 'undefined' ? null : cookie['expire_at']) || (consent_at + (cookieExpiration * 24 * 60 * 60 * 1000));

            if (cookie != null && cookie['consent_at'] != null && cookie['consent_at'] == consent_at) {
              trigger_consent = false;
            }

            break;
        }

        if (cookie != null) {
          cookie['anonym']     = anonym;
          cookie['consent_at'] = consent_at;
          cookie['expired_at'] = expire_at;

          if (!cookie['htms']) { cookie['htms'] = {}; }

          if (cookie['htms'] && Object.keys(cookie['htms']).length > 0 && Object.keys(cookie['htms']).indexOf(sessionToken) < 0) {
            cookie['htms'][sessionToken] = parseQueryString();
          }
        } else {
          htms               = {}
          htms[sessionToken] = parseQueryString();

          cookie = {
            anonym:     anonym,
            consent_at: consent_at,
            expired_at: expire_at,
            htms:       htms
          }
        }

        setCookie(cookie);

        if (type == 'activate' && trigger_consent) {
          var htms = {}

          if (cookie['htms'] && cookie['htms'][sessionToken]) {
            htms = cookie['htms'][sessionToken];
          }

          sendDatas('/consent', { token: browserToken, session_token: sessionToken, type: type, htms: htms, expired_at: cookie['expired_at'] });
        }

        // L'association a été faite avant le consentement / On déclenche l'association après consentement
        if (Object.keys(cookie).indexOf('association_type') >= 0 && !anonym) {
          cookie['associate'] = sessionToken;
          sendDatas('/associate', { association_type: cookie['association_type'], contact: cookie['association_datas'] } );

          delete cookie['association_type'];
          delete cookie['association_datas'];
        }

        setCookie(cookie);
      }
    }

    let deactivateCookie = function() {
      let cookie = getCookie();

      // Mise à jour de la date d'expiration du cookie si on n'est pas en mode anonyme
      if (cookie != null && !cookie['anonym']) {
        cookie['anonym']     = true;
        cookie['expired_at'] = Date.now();

        delete cookie['consent_at'];

        setCookie(cookie);
        sendDatas('/consent', { token: browserToken, session_token: sessionToken, type: 'deactivate', expired_at: cookie['expired_at'] });
      }
    }

    // Définition des infos spécifiques pour les tests unitaires
    let init_hct_ut = function() {
      var hct_ut = getCookie('_hct_ut');

      if (hct_ut != null) {
        var keys = Object.keys(hct_ut);

        for (var i = 0; i < keys.length; i++) {
          if (typeof(keys[i]) != "undefined") {
            eval(keys[i] + "=" + "'" + hct_ut[keys[i]] + "'");
          }
        }
      }

      let query  = window.location.search.replace(/^\?/, '');

      for (var i = 0; i < query.split("&").length; i++) {
        let attr  = query.split("&")[i];

        if (attr.match(/^hct_ut\[(.*)\]=/)) {
          if (hct_ut == null) {
            hct_ut   = {};
          }

          let key    = attr.replace(/^hct_ut\[(.*)\]=(.*)$/, '$1');
          let value  = attr.replace(/^hct_ut\[(.*)\]=(.*)$/, '$2');

          if (typeof(key) != "undefined") {
            eval(key + "=" + "'" + value + "'");
            hct_ut[key] = value;
          }
        }
      }

      setCookie(hct_ut, '_hct_ut');
    }

    let processForm = function(e) {
      if (e.target.querySelector("input[type='password']") != null) { return true; }

      var formData = new FormData(e.target);
      var datas    = {};

      for (var entry of formData.entries()) {
        datas[entry[0]] = entry[1];
      }

      sendDatas('/event', { event_name: 'form_submit', datas: datas } );
      return true;
    }

    this.create = function(code, options) {
      tracking_code        = code;
      options              = options || {};
      let disable_page_view    = options['disable_page_view'] || false;
      let enable_form_tracking = options['enable_form_tracking'] || false;
      let trigger_htms         = options['trigger_htms'] || false;

      if(Object.keys(options).indexOf('cookie_expiration') >= 0) {
        cookieExpiration  = options['cookie_expiration'];
      }

      if(Object.keys(options).indexOf('session_expiration') >= 0) {
        sessionExpiration  = options['session_expiration'];
      }

      if(Object.keys(options).indexOf('token') >= 0) {
        app_token  = options['token'];
      }

      if(Object.keys(options).indexOf('cookies') >= 0) {
        externalCookies  = options['cookies'];
      }

      if(Object.keys(options).indexOf('with_consent') >= 0) {
        withConsent = options['with_consent'];
      }

      if (enable_form_tracking) {
        if (document.readyState == "complete") {
          var forms = document.getElementsByTagName("form");

          for ( var i = 0; i < forms.length; i++ ) {
            if (forms[i].attachEvent) {
              forms[i].attachEvent("submit", processForm);
            } else {
              forms[i].addEventListener("submit", processForm);
            }
          }
        }
        else {
          document.onreadystatechange = function () {
            if (document.readyState == "complete") {
              var forms = document.getElementsByTagName("form");

              for ( var i = 0; i < forms.length; i++ ) {
                if (forms[i].attachEvent) {
                  forms[i].attachEvent("submit", processForm);
                } else {
                  forms[i].addEventListener("submit", processForm);
                }
              }
            }
          }
        }
      }

      initTokens();
      init_hct_ut();

      if (!disable_page_view) { sendDatas('/event', { event_name: 'page_view' } ); }

      if (trigger_htms) {
        var trigger     = false;
        var queryString = parseQueryString();

        for ( const attr in queryString ) {
          if ( tracking_keys.indexOf(attr) >= 0 ) { trigger = true; }
        }

        if (trigger) { sendDatas('/htms'); }
      }

      window.onbeforeunload = function (e) {
        var origin = e.target.baseURI.replace(/^(https?:\/\/)([^\/]*)\/.*$/gi, '$1$2/');

        if (!(document.activeElement != null && document.activeElement.href != null && document.activeElement.href.startsWith(origin))) {
          sendDatas('/leave');
        }
      };
    }

    this.activate = function(consent_at, expire_at) {
      if (!withConsent) { return; }

      initTokens();
      let cookie = getCookie();
      let trigger_consent = true;

      if (typeof(consent_at) != 'undefined' && consent_at != null) {
        switch (consent_at.constructor.name) {
          case 'String':
            consent_at = new Date(parseInt(consent_at)).getTime();
            break;
          case 'Number':
            consent_at = new Date(consent_at).getTime();
            break;
          case 'Date':
            consent_at = consent_at.getTime();
            break;
          default:
            consent_at = null;
            break;
        }
      }

      if (cookie['consent_at'] != null && cookie['consent_at'] == consent_at) { trigger_consent = false; }

      if (typeof(expire_at) != 'undefined' && expire_at != null) {
        switch (expire_at.constructor.name) {
          case 'String':
            expire_at = new Date(parseInt(expire_at)).getTime();
            break;
          case 'Number':
            expire_at = new Date(expire_at).getTime();
            break;
          case 'Date':
            expire_at = expire_at.getTime();
            break;
          default:
            expire_at = null;
            break;
        }
      }

      if (expire_at == null ) { expire_at = (consent_at + (cookieExpiration * 24 * 60 * 60 * 1000)) }

      cookie['anonym']     = false;
      cookie['consent_at'] = consent_at;
      cookie['expired_at'] = expire_at;
      setCookie(cookie);

      if (trigger_consent) {
        sendDatas('/consent', { token: browserToken, session_token: sessionToken, type: 'activate', htms: cookie['htms'][sessionToken], consent_at: cookie['consent_at'], expired_at: cookie['expired_at'] });

        if (Object.keys(cookie).indexOf('association_type') >= 0) {
          cookie['associate'] = sessionToken;
          sendDatas('/associate', { association_type: cookie['association_type'], contact: cookie['association_datas'] } );

          delete cookie['association_type'];
          delete cookie['association_datas'];
        }
      }
      setCookie(cookie);
      // createCookie('activate', consent_at, expire_at);
    }

    this.deactivate = function() {
      if (!withConsent) { return; }

      initTokens();
      let cookie = getCookie();

      // Mise à jour de la date d'expiration du cookie si on n'est pas en mode anonyme
      if (cookie != null && !cookie['anonym']) {
        cookie['anonym']     = true;
        cookie['expired_at'] = Date.now();

        delete cookie['consent_at'];

        setCookie(cookie);
        sendDatas('/consent', { token: browserToken, session_token: sessionToken, type: 'deactivate', expired_at: cookie['expired_at'] });
      }
    }

    this.send_event = function(evt_name, datas, track_changes) {
      initTokens();

      datas         = datas || {};
      track_changes = track_changes || false;
      track         = true;

      if (track_changes) {
        let cookie        = getCookie();
        let changes       = cookie['changes'];
        var session_token = sessionToken;

        // Réinitialisation des infos si la session a changé
        if (changes == null || Object.keys(changes).indexOf(session_token) < 0) {
          changes = {};
          changes[session_token] = {};
        }

        if (Object.keys(changes[session_token]).indexOf(evt_name) >= 0) {
          if(JSON.stringify(datas) == changes[session_token][evt_name]) {
            track = false;
          }
          else {
            changes[session_token][evt_name] = JSON.stringify(datas);
          }
        }
        else {
          changes[session_token][evt_name] = JSON.stringify(datas);
        }

        cookie["changes"] = changes;
        setCookie(cookie);
      }

      if (track && tracking_code != null) {
        sendDatas('/event', { event_name: evt_name, datas: datas } );
      }
    }

    this.associate = function(association_type, datas) {
      initTokens();

      datas = datas || {};

      if (tracking_code != null) {
        let cookie  = getCookie();

        var trigger_association = true;

        // On ne redéclenche pas l'association si déjà déclenchée pour la session
        if (Object.keys(cookie).indexOf('associate') >= 0 && cookie['associate'] == sessionToken) { trigger_association = false; }

        if ( trigger_association ) {
          if(anonymize()) {
            cookie['association_type']  = association_type;
            cookie['association_datas'] = datas;

            setCookie(cookie);
          }
          else {
            cookie['associate'] = sessionToken;
            setCookie(cookie);
            sendDatas('/associate', { association_type: association_type, contact: datas } );
          }
        }
      }
    }

    this.is_associate = function() {
      initTokens();

      let cookie  = getCookie();

      if (Object.keys(cookie).indexOf('associate') >= 0 && cookie['associate'] == sessionToken) {
        return true;
      }
      else {
        return false;
      }
    }

    this.consent_granted = function() {
      return !anonymize();
    }

    this.session_token = function() {
      return sessionToken;
    }

    this.browser_token = function() {
      return browserToken;
    }
  };

  this.hct = new HcTracker();
}).call(window);

export {}
