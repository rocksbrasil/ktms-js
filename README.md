# ktms-js | BIBLIOTECA PERMANÊNCIA DE UTMS

A biblioteca KTMS-JS oferece uma solução simples para rastrear e manter os parâmetros de UTMs (Urchin Tracking Module) em um website. Com esta biblioteca, você pode salvar os parâmetros de UTMs presentes nas URLs dos visitantes e adicioná-los automaticamente aos links internos do seu site.

## Instalação
Para começar a usar a biblioteca KTMS-JS, siga estas etapas simples:
    <ul>
        <li>Baixe o arquivo 'ktms.js' e adicione ao diretório do seu projeto ou utilize a URL para importar o arquivo direto do GitHub 'https://rocksbrasil.github.io/ktms-js/ktms.js'</li>
        <li>Inclua o script 'ktms.js' nas suas páginas HTML:  ```<script src="caminho_para_o_seu_diretorio/ktms.js"></script>```</li>
        <li>A biblioteca será automaticamente carregada e inicializada em todas as páginas do seu site</li>
    </ul>

## Como usar
Adicione a classe <b>"utm-params"</b> aos hyperlinks que você deseja que tenham os paramêtros UTMs salvos automaticamente.  
Por exemplo:
```<a href="pagina.html" class="utm-params">Link com UTMs</a>```

## Métodos disponíveis
Você também pode utilizar os métodos da biblioteca para o que desejar, segue os métodos disponíveis
    <ul>
        <li>Obter Parâmetros de UTMs: Você pode obter os parâmetros de UTMs salvos usando o método getUtm(paramName). Por exemplo, para obter o valor do parâmetro utm_source, você pode fazer o seguinte: ```<script> var utmSource = ktms.getUtm('utm_source'); </script>```</li>
        <li>Carregar após a Inicialização: Se você precisar executar alguma ação após a inicialização da biblioteca, você pode usar o método load(completeFunc). <br> Por exemplo: ```<script> ktms.load(function(){ // código a ser executado após a inicialização da biblioteca }); </script>```</li>
        <li>A biblioteca será automaticamente carregada e inicializada em todas as páginas do seu site</li>
    </ul>
    
## Requisitos
A biblioteca KTMS-JS requer um navegador com suporte para JavaScript habilitado. Não há outras dependências.
