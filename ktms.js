/** 
 * BIBLIOTECA PERMANÊNCIA DE UTMS NO WEBSITE  
 */
(function(window){
    function ktmsLib(){
        var ktmsLibFuncs = {};
        var ktmsUtmTagsToPass = ['utm_campaign', 'utm_source', 'utm_content', 'utm_medium', 'gclid', 'fbp', 'fbc', 'fbclid'];
        var prefix = 'ktms_'; // prefixo personalizado para identificação dos parâmetros salvos

        //função de inicialização
        ktmsLibFuncs.init = function(){
            console.log('[KTMS] Initializing...');
            ktmsLibFuncs.saveUtms();
            ktmsLibFuncs.addUtmsHref();
            return true;
        };

        //salvar os parametros UTMS
        ktmsLibFuncs.saveUtms = function(){
            try {
                if (typeof(window.saveUtms) === 'boolean' && window.saveUtms) return false;
                window.saveUtms = true;

                var params = new URLSearchParams(window.location.search);
                if (params.toString() === '') {
                    console.log('[KTMS] Nenhum parâmetro na URL. Nada será atualizado.');
                    return false;
                }

                // Recupera as chaves já salvas
                var utmKeyStr = this.getUtm('utmKey') || '';
                var hrefKeyStr = this.getUtm('hrefKeys') || '';
                var existingUtmKeys = utmKeyStr ? utmKeyStr.split(',') : [];
                var existingHrefKeys = hrefKeyStr ? hrefKeyStr.split(',') : [];

                var chavesUtm = existingUtmKeys.slice(); // cópias
                var chaves = existingHrefKeys.slice();

                for (var pair of params.entries()) {
                    var key = pair[0];
                    var value = pair[1];
                    var paramName = prefix + key;

                    // remove cookies com esse nome de possíveis escopos
                    this.deleteCookieByName(paramName);

                    // sobrescreve com valor da URL
                    this.saveCookie(paramName, value);
                    this.saveLocal(paramName, value);
                    this.saveSession(paramName, value);

                    if (ktmsUtmTagsToPass.indexOf(key) !== -1) {
                        if (chavesUtm.indexOf(key) === -1) chavesUtm.push(key);
                    } else {
                        if (chaves.indexOf(key) === -1) chaves.push(key);
                    }
                }

                // Atualiza as listas com novas chaves (sem apagar antigas)
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


        //buscar todas as UTMS e adicionar em links e formulários
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

                // Monta objeto com valores persistidos
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

                    // Corrige caso de & sem ?
                    if (original.indexOf('?') === -1 && original.indexOf('&') !== -1) {
                        var parts = original.split('&');
                        var base = parts.shift();
                        original = base + '?' + parts.join('&');
                    }

                    // Divide a URL entre base e query
                    var parts = original.split('?');
                    var baseUrl = parts[0];
                    var queryString = parts[1] || '';
                    var newParams = [];

                    // Copia os parâmetros existentes, exceto os que serão substituídos
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

                    // Adiciona os novos UTMs
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

        // buscar uma única utm
        ktmsLibFuncs.getUtm = function(paramName) {
            try {
                const fullParamName = prefix + paramName;
                const cookieValue = this.getCookie(fullParamName);
                const localStorageValue = this.getLocalStorage(fullParamName);
                const sessionStorageValue = this.getSessionStorage(fullParamName);
                return cookieValue || localStorageValue || sessionStorageValue || false;
            } catch (error) {
                console.error('[KTMS] Erro ao buscar paramêtros de marketing');
                return false;
            }
        }
        
        // buscas as UTMs nos cookies, localStorage e sessionStorage
        ktmsLibFuncs.getCookie = function(cookieName) {
            try {
                const cookieValue = this.getAllCookies()[cookieName];
                return cookieValue ? cookieValue : false;
            } catch (error) {
                return false;
            }
        }

        ktmsLibFuncs.getAllCookies = function() {
            return document.cookie.split(';').reduce((acc, cookie) => {
                const [name, val] = cookie.split('=');
                if (name && val) {
                    acc[name.trim()] = decodeURIComponent(val.trim());
                }
                return acc;
            }, {});
        };

        ktmsLibFuncs.getLocalStorage = function(paramName) {
            try {
                const localStorageValue = localStorage.getItem(paramName);
                return localStorageValue ? decodeURIComponent(localStorageValue) : false;
            } catch (error) {
                return false;
            }
        };

        ktmsLibFuncs.getSessionStorage = function(paramName) {
            try {
                const sessionStorageValue = sessionStorage.getItem(paramName);
                return sessionStorageValue ? decodeURIComponent(sessionStorageValue) : false;
            } catch (error) {
                return false;
            }
        };

        // salva as UTMs nos cookies, localStorage e sessionStorage
        ktmsLibFuncs.saveCookie = function(paramName, value) {
            try {
                var existing = this.getCookie(paramName);
                if (existing === value) return false;

                var expires = "expires=Fri, 31 Dec 2038 23:59:59 GMT";

                // Extrai o domínio raiz (ex: .astronmembers.com.br)
                var parts = window.location.hostname.split('.');
                var baseDomain = parts.length > 2
                    ? parts.slice(parts.length - 2).join('.')
                    : window.location.hostname;

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
                const existing = this.getLocalStorage(paramName);
                if (existing === value) return false; // evita sobrescrever valores idênticos

                localStorage.setItem(paramName, encodeURIComponent(value)); // Salvar no localStorage
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar paramêtros no localStorage');
                return false;
            }
        }

        ktmsLibFuncs.saveSession = function(paramName, value) {
            try {    
                const existing = this.getSessionStorage(paramName);
                if (existing === value) return false; // evita sobrescrever valores idênticos

                sessionStorage.setItem(paramName, encodeURIComponent(value)); // Salvar no sessionStorage
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar paramêtros no SessionStorage');
                return false;
            }
        }

        ktmsLibFuncs.deleteCookieByName = function(name) {
            try {
                var path = ";path=/";
                var expires = ";expires=Thu, 01 Jan 1970 00:00:01 GMT";

                // remove no domínio atual
                document.cookie = name + "=" + expires + path;

                // remove no domínio raiz
                var parts = window.location.hostname.split('.');
                if (parts.length >= 2) {
                    var rootDomain = '.' + parts.slice(parts.length - 2).join('.');
                    document.cookie = name + "=" + expires + path + ";domain=" + rootDomain;
                }

                // remove no domínio com subdomínio direto (ex: central.astronmembers.com.br)
                if (parts.length >= 3) {
                    var fullDomain = '.' + parts.slice(parts.length - 3).join('.');
                    document.cookie = name + "=" + expires + path + ";domain=" + fullDomain;
                }
            } catch (e) {
                console.warn('[KTMS] Não foi possível limpar cookie duplicado:', name);
            }
        };

        ktmsLibFuncs.load = function(completeFunc) {
            try {
                if (typeof(completeFunc) === 'function') {
                    if (this.init()) {
                        completeFunc();
                    } else {
                        console.error('[KTMS] Erro ao inicializar a biblioteca');
                    }
                } else {
                    console.error('[KTMS] Função de conclusão inválida');
                }
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao carregar a biblioteca:', error);
                return false;
            }
        }

        return ktmsLibFuncs;
    }

    // carrega a biblioteca pro dom
    if(typeof(window.ktms) === 'undefined'){
        window.ktms = ktmsLib();
    }
}(window));

// window on load
window.addEventListener("load", function(e){
    window.ktms.init();
});
