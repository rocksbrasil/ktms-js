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

        // salvar os parametros UTMS
        ktmsLibFuncs.saveUtms = function(){
            try {
                if(typeof(window.saveUtms) == 'boolean' && window.saveUtms) { return false; } //trigger do método
                window.saveUtms = true; //adiciona o trigger do método
                const params = new URLSearchParams(window.location.search); //busca a URL do usuário
                const chavesUtm = [];
                const chaves = [];

                // Salvar os parâmetros
                for (const [key, value] of params.entries()) { 
                    const paramName = prefix + key;
                    if(ktmsUtmTagsToPass.includes(key)) {
                        this.saveCookie(paramName, value);
                        this.saveLocal(paramName, value);
                        this.saveSession(paramName, value);   
                        chavesUtm.push(key); //salva todas as chaves em um array
                    } else {
                        this.saveCookie(paramName, value);
                        this.saveLocal(paramName, value);
                        this.saveSession(paramName, value);   
                        chaves.push(key); //salva todas as chaves em um array
                    }
                }     

                // Salva os nomes das chaves nos cookies, session e local, para serem buscadas depois
                if(chavesUtm.length > 0) {
                    const joined = chavesUtm.join(',');
                    this.saveCookie(prefix + 'utmKey', joined);
                    this.saveLocal(prefix + 'utmKey', joined);
                    this.saveSession(prefix + 'utmKey', joined);   
                }

                // salva os outros parâmetros
                if(chaves.length > 0) {
                    const joined = chaves.join(',');
                    this.saveCookie(prefix + 'hrefKeys', joined);
                    this.saveLocal(prefix + 'hrefKeys', joined);
                    this.saveSession(prefix + 'hrefKeys', joined);   
                }

                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar paramêtros de marketing', error);
                return false;
            }
        };

        //buscar todas as UTMS e adicionar em links e formulários
        ktmsLibFuncs.addUtmsHref = function(){
            try {
                if(typeof(window.addUtmsHref) == 'boolean' && window.addUtmsHref) { return false; } //trigger do método
                window.addUtmsHref = true; //adiciona o trigger ao método
                var utmKeys = this.getUtm('utmKey'); // Busca as chaves das UTMs
        
                // Verifica se retornou uma string
                if (typeof utmKeys !== 'string') {
                    console.error('[KTMS] UTMs não encontradas');
                    return false;
                }
        
                utmKeys = utmKeys.split(','); // Monta o array de chaves

                // Cria a string de parâmetros 'utm'
                var utmString = utmKeys.map(utm => {
                    var utmValue = this.getUtm(utm);
                    if (utmValue) {
                        return encodeURIComponent(utm) + '=' + encodeURIComponent(utmValue);
                    }
                    return null;
                }).filter(Boolean).join('&'); // remove os valores nulos (filter) e junta os parâmetros 'utm' separados por '&'

                // Atualiza o atributo href dos elementos com a classe '.utm-params'
                var utmLinks = document.querySelectorAll('.utm-params');
                utmLinks.forEach(link => {
                    if (link.tagName === 'FORM') {
                        var action = link.getAttribute('action') || '';
                        action += action.includes('?') ? '&' : '?';
                        action += utmString;
                        link.setAttribute('action', action);
                    } else {
                        var href = link.getAttribute('href') || '';
                        href += href.includes('?') ? '&' : '?'; // adiciona '&' se já existirem parâmetros na URL
                        href += utmString; // Adiciona a string de parâmetros 'utm'
                        link.setAttribute('href', href); // Atualiza o href
                    }
                }); 

                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao buscar e adicionar parâmetros de marketing aos links/forms:', error);
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
                const existing = this.getCookie(paramName);
                if (existing === value) return false; // evita sobrescrever valores idênticos

                var expires = "expires=Fri, 31 Dec 2038 23:59:59 GMT"; // Cookie persistente
                var domain = window.location.hostname !== 'localhost' ? ";domain=." + window.location.hostname.replace(/^www\./, "") : "";

                document.cookie = paramName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/" + domain; // Salvar nos cookies
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar paramêtros nos cookies');
                return false;
            }
        }

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
