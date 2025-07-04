/** 
 * BIBLIOTECA PERMANÊNCIA DE UTMS NO WEBSITE  
 */
(function(window){
    function ktmsLib(){
        var ktmsLibFuncs = {};
        var ktmsUtmTagsToPass = ['utm_campaign', 'utm_source', 'utm_content', 'utm_medium', 'gclid', 'fbp', 'fbc', 'fbclid'];
        var prefix = 'ktms_'; // prefixo personalizado para identificação dos parâmetros salvos
        ktmsLibFuncs.tempUtms = {}; // Armazena valores vindos da URL atual

        // função de inicialização
        ktmsLibFuncs.init = function(){
            console.log('[KTMS] Initializing...');
            ktmsLibFuncs.saveUtms();
            ktmsLibFuncs.addUtmsHref();
            return true;
        };

        // salvar os parametros UTMS
        ktmsLibFuncs.saveUtms = function(){
            try {
                if (typeof(window.saveUtms) === 'boolean' && window.saveUtms) return false;
                window.saveUtms = true;

                var params = new URLSearchParams(window.location.search);
                if (params.toString() === '') {
                    console.log('[KTMS] Nenhum parâmetro na URL. Nada será atualizado.');
                    return false;
                }

                var utmKeyStr = this.getUtm('utmKey') || '';
                var hrefKeyStr = this.getUtm('hrefKeys') || '';
                var existingUtmKeys = utmKeyStr ? utmKeyStr.split(',') : [];
                var existingHrefKeys = hrefKeyStr ? hrefKeyStr.split(',') : [];

                var chavesUtm = existingUtmKeys.slice();
                var chaves = existingHrefKeys.slice();

                for (var pair of params.entries()) {
                    var key = pair[0];
                    var value = pair[1];
                    var paramName = prefix + key;

                    this.tempUtms[key] = value; // salva temporariamente para uso imediato
                    this.deleteCookieByName(paramName); // limpa duplicatas de domínio/subdomínio

                    this.saveCookie(paramName, value);
                    this.saveLocal(paramName, value);
                    this.saveSession(paramName, value);

                    if (ktmsUtmTagsToPass.indexOf(key) !== -1) {
                        if (chavesUtm.indexOf(key) === -1) chavesUtm.push(key);
                    } else {
                        if (chaves.indexOf(key) === -1) chaves.push(key);
                    }
                }

                if (chavesUtm.length > 0) {
                    var joined = chavesUtm.join(',');
                    this.saveCookie(prefix + 'utmKey', joined);
                    this.saveLocal(prefix + 'utmKey', joined);
                    this.saveSession(prefix + 'utmKey', joined);
                }

                if (chaves.length > 0) {
                    var joined = chaves.join(',');
                    this.saveCookie(prefix + 'hrefKeys', joined);
                    this.saveLocal(prefix + 'hrefKeys', joined);
                    this.saveSession(prefix + 'hrefKeys', joined);
                }

                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar parâmetros de marketing', error);
                return false;
            }
        };

        // adicionar UTMs aos links/forms
        ktmsLibFuncs.addUtmsHref = function () {
            try {
                if (typeof(window.addUtmsHref) === 'boolean' && window.addUtmsHref) return false;
                window.addUtmsHref = true;

                var utmKeysStr = this.getUtm('utmKey');
                if (!utmKeysStr || typeof utmKeysStr !== 'string') {
                    console.warn('[KTMS] Nenhuma UTM encontrada para adicionar.');
                    return false;
                }

                var utmKeys = utmKeysStr.split(',');
                var utmParams = {};

                for (var i = 0; i < utmKeys.length; i++) {
                    var key = utmKeys[i];
                    var value = this.getUtm(key);
                    if (value) utmParams[key] = value;
                }

                var utmLinks = document.querySelectorAll('.utm-params');
                for (var j = 0; j < utmLinks.length; j++) {
                    var link = utmLinks[j];
                    var attr = link.tagName === 'FORM' ? 'action' : 'href';
                    var original = link.getAttribute(attr) || '';

                    if (original.indexOf('?') === -1 && original.indexOf('&') !== -1) {
                        var split = original.split('&');
                        var base = split.shift();
                        original = base + '?' + split.join('&');
                    }

                    var parts = original.split('?');
                    var baseUrl = parts[0];
                    var queryString = parts[1] || '';
                    var newParams = [];

                    if (queryString) {
                        var existing = queryString.split('&');
                        for (var k = 0; k < existing.length; k++) {
                            var pair = existing[k].split('=');
                            var paramKey = decodeURIComponent(pair[0]);
                            if (!(paramKey in utmParams)) {
                                newParams.push(existing[k]);
                            }
                        }
                    }

                    for (var utmKey in utmParams) {
                        var encoded = encodeURIComponent(utmKey) + '=' + encodeURIComponent(utmParams[utmKey]);
                        newParams.push(encoded);
                    }

                    var finalUrl = baseUrl + (newParams.length > 0 ? '?' + newParams.join('&') : '');
                    link.setAttribute(attr, finalUrl);
                }

                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao adicionar UTMs aos links/formulários:', error);
                return false;
            }
        };

        // getUtm com prioridade para os dados mais recentes da URL
        ktmsLibFuncs.getUtm = function(paramName) {
            try {
                if (this.tempUtms && this.tempUtms[paramName]) {
                    return this.tempUtms[paramName];
                }

                var fullParamName = prefix + paramName;
                return this.getCookie(fullParamName) ||
                       this.getLocalStorage(fullParamName) ||
                       this.getSessionStorage(fullParamName) ||
                       false;
            } catch (error) {
                console.error('[KTMS] Erro ao buscar parâmetro de marketing:', error);
                return false;
            }
        };

        // buscar cookies
        ktmsLibFuncs.getCookie = function(cookieName) {
            try {
                var cookies = this.getAllCookies();
                return cookies[cookieName] || false;
            } catch (error) {
                return false;
            }
        };

        ktmsLibFuncs.getAllCookies = function() {
            var cookies = {};
            var all = document.cookie.split(';');
            for (var i = 0; i < all.length; i++) {
                var parts = all[i].split('=');
                if (parts.length === 2) {
                    cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
                }
            }
            return cookies;
        };

        ktmsLibFuncs.getLocalStorage = function(paramName) {
            try {
                var value = localStorage.getItem(paramName);
                return value ? decodeURIComponent(value) : false;
            } catch (error) {
                return false;
            }
        };

        ktmsLibFuncs.getSessionStorage = function(paramName) {
            try {
                var value = sessionStorage.getItem(paramName);
                return value ? decodeURIComponent(value) : false;
            } catch (error) {
                return false;
            }
        };

        // salvar cookies no domínio raiz
        ktmsLibFuncs.saveCookie = function(paramName, value) {
            try {
                var existing = this.getCookie(paramName);
                if (existing === value) return false;

                var expires = "expires=Fri, 31 Dec 2038 23:59:59 GMT";
                var parts = window.location.hostname.split('.');
                var baseDomain = parts.slice(-2).join('.');
                var domain = ";domain=." + baseDomain;

                document.cookie = paramName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/" + domain;
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar parâmetros nos cookies');
                return false;
            }
        };

        ktmsLibFuncs.saveLocal = function(paramName, value) {
            try {
                var existing = this.getLocalStorage(paramName);
                if (existing === value) return false;
                localStorage.setItem(paramName, encodeURIComponent(value));
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar parâmetros no localStorage');
                return false;
            }
        };

        ktmsLibFuncs.saveSession = function(paramName, value) {
            try {
                var existing = this.getSessionStorage(paramName);
                if (existing === value) return false;
                sessionStorage.setItem(paramName, encodeURIComponent(value));
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar parâmetros no sessionStorage');
                return false;
            }
        };

        // limpa duplicatas de cookies
        ktmsLibFuncs.deleteCookieByName = function(name) {
            try {
                var path = ";path=/";
                var expires = ";expires=Thu, 01 Jan 1970 00:00:01 GMT";

                document.cookie = name + "=" + expires + path;

                var parts = window.location.hostname.split('.');
                if (parts.length >= 2) {
                    var root = '.' + parts.slice(-2).join('.');
                    document.cookie = name + "=" + expires + path + ";domain=" + root;
                }

                if (parts.length >= 3) {
                    var full = '.' + parts.slice(-3).join('.');
                    document.cookie = name + "=" + expires + path + ";domain=" + full;
                }
            } catch (e) {
                console.warn('[KTMS] Não foi possível limpar cookie duplicado:', name);
            }
        };

        ktmsLibFuncs.load = function(callback) {
            try {
                if (typeof(callback) === 'function') {
                    if (this.init()) {
                        callback();
                    } else {
                        console.error('[KTMS] Erro ao inicializar a biblioteca');
                    }
                }
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao carregar a biblioteca:', error);
                return false;
            }
        };

        return ktmsLibFuncs;
    }

    if (typeof(window.ktms) === 'undefined') {
        window.ktms = ktmsLib();
    }
}(window));

// Inicialização automática
window.addEventListener("load", function() {
    window.ktms.init();
});
