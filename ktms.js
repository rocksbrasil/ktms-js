/** 
 * BIBLIOTECA PERMANÊNCIA DE UTMS NO WEBSITE  
 */
(function(window){
    function ktmsLib(){
        var ktmsLibFuncs = {};

        //função de inicialização
        ktmsLibFuncs.init = function(){
            console.log('[KTMS] Initializing...');
            ktmsLibFuncs.saveUtms();
            ktmsLibFuncs.addUtmsHref();
        };

        // salvar os parametros
        ktmsLibFuncs.saveUtms = function(){
            try {
                if(typeof(window.saveUtms) == 'boolean' && window.saveUtms) { return false; } //trigger do método
                const params = new URLSearchParams(window.location.search); //busca a URL do usuário
                const chavesUtm = [];

                // Salvar os parâmetros
                for (const [key, value] of params.entries()) { 
                    if(key.includes('utm')) {
                        this.saveCookie(key, value);
                        this.saveLocal(key, value);
                        this.saveSession(key, value);   
                        chavesUtm.push(key); //salva todas as chaves em um array
                    }     
                }     

                // Salva os nomes das chaves nos cookies, session e local, para serem buscadas dps
                if(chavesUtm.length > 0) {
                    this.saveCookie('utmKey', chavesUtm);
                    this.saveLocal('utmKey', chavesUtm);
                    this.saveSession('utmKey', chavesUtm);   
                }

                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar paramêtros de marketing', error);
                return false;
            }
        };

        //buscar todas as UTMS
        ktmsLibFuncs.addUtmsHref = function(){
            try {
                if(typeof(window.addUtmsHref) == 'boolean' && window.addUtmsHref) { return false; } //trigger do método
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
                    var href = link.getAttribute('href') || '';
                    href += href.includes('?') ? '&' : '?'; // adiciona '&' se já existirem parâmetros na URL
                    href += utmString; // Adiciona a string de parâmetros 'utm'
                    link.setAttribute('href', href); // Atualiza o href
                }); 

                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao buscar e adicionar parâmetros de marketing aos links:', error);
                return false;
            }
        };        

        // buscar uma única utm
        ktmsLibFuncs.getUtm = function(paramName) {
            try {
                const cookieValue = this.getCookie(paramName);
                const localStorageValue = this.getLocalStorage(paramName);
                const sessionStorageValue = this.getSessionStorage(paramName);
                return cookieValue || localStorageValue || sessionStorageValue || '';
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
        ktmsLibFuncs.getLocalStorage = function(paramName) {
            try {
                const localStorageValue = localStorage.getItem(paramName);
                return localStorageValue ? localStorageValue : false;
            } catch (error) {
                return false;
            }
        };
        ktmsLibFuncs.getSessionStorage = function(paramName) {
            try {
                const sessionStorageValue = sessionStorage.getItem(paramName);
                return sessionStorageValue ? sessionStorageValue : false;
            } catch (error) {
                return false;
            }
        };

        // salva as UTMs nos cookies, localStorage e sessionStorage
        ktmsLibFuncs.saveCookie = function(paramName, value) {
            try {                
                document.cookie = paramName + "=" + value + ";"; // Salvar nos cookies
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar paramêtros nos cookies');
                return false;
            }
        }
        ktmsLibFuncs.saveLocal = function(paramName, value) {
            try {                
                localStorage.setItem(paramName, value); // Salvar no localStorage
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar paramêtros no localStorage');
                return false;
            }
        }
        ktmsLibFuncs.saveSession = function(paramName, value) {
            try {                
                sessionStorage.setItem(paramName, value); // Salvar no sessionStorage
                return true;
            } catch (error) {
                console.error('[KTMS] Erro ao salvar paramêtros no SessionStorage');
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