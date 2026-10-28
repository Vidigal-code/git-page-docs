# Acessibilidade e narração

Os controles de acessibilidade incluem narração nativa do navegador para o documento Markdown atual. A narração usa a Web Speech API (`speechSynthesis`); não exige chave de API nem serviço externo de voz do GitPageDocs.

## Configuração

Mescle estas opções em `gitpagedocs/config.json`:

```json
{
  "site": {
    "accessibility": {
      "enabled": true,
      "narration": {
        "enabled": true,
        "defaultRate": 1,
        "defaultVolume": 1
      }
    },
    "mediaExclusivePlayback": true
  }
}
```

- `site.accessibility.enabled`: habilita a interface de acessibilidade.
- `site.accessibility.narration.enabled`: habilita a narração do documento.
- `defaultRate`: velocidade inicial de `0.5` a `2`, em passos de `0.25`; o padrão é `1`.
- `defaultVolume`: volume inicial de `0` (silencioso) a `1` (máximo), em passos de `0.1`; o padrão é `1`.
- Todos os controles de habilitação têm padrão `true`; opções ausentes usam os padrões distribuídos.

## Ler um documento em voz alta

1. Abra uma página Markdown e os controles de acessibilidade/narração.
2. Escolha voz e idioma entre os disponibilizados pelo navegador; ajuste velocidade e volume.
3. Inicie a leitura. Pause temporariamente, continue a fala pausada ou encerre a sessão.
4. Para alterar opções de leitura de forma previsível, pare, ajuste os controles e inicie novamente.

A narração começa somente após sua ação; não há reprodução automática. A seleção automática de voz acompanha o idioma do documento; escolher uma voz explicitamente utiliza o idioma dessa voz. A narração não traduz o documento.

A fala usa texto legível extraído do Markdown renderizado. Scripts, estilos, conteúdo SVG e elementos ocultos para tecnologias assistivas são excluídos. O conteúdo visível longo é lido por inteiro em blocos sucessivos. Trocar documento ou idioma, desabilitar a narração ou sair da página cancela a fala anterior.

No modo foco, a narração usa somente a seção exibida. Trocar seção ou documento, entrar ou sair do modo foco interrompe a leitura anterior. Inicie novamente para ler o conteúdo que passou a estar visível. Com `site.focusMode.sectionNavigationEnabled: false`, o documento inteiro fica visível e pode ser narrado. Essas transições preservam a voz, a velocidade e o volume selecionados.

A visualização comum e o modo foco compartilham preferências de voz, velocidade e volume enquanto a página permanece montada. As preferências não são salvas entre recarregamentos. Valores não numéricos de velocidade ou volume usam `1`; valores numéricos fora das faixas suportadas são limitados ao extremo mais próximo.

## Um áudio por vez

Com `site.mediaExclusivePlayback: true` (padrão), iniciar ou continuar a narração pausa rádio, faixas de áudio e vídeos de rota. Iniciar essas mídias encerra a narração. Vídeos sem som ficam fora dessa regra. Use `false` quando a reprodução simultânea for intencional.

Essa configuração é compartilhada com a reprodução de mídia existente; não há uma segunda flag de exclusividade para narração. A página continua legível quando a narração está desabilitada.

## Disponibilidade de navegador e vozes

O suporte a fala e as vozes dependem do navegador, do sistema operacional e das vozes instaladas ou fornecidas remotamente. A lista pode chegar depois de a página carregar. Navegadores e dispositivos diferentes podem oferecer idiomas diferentes.

Ausência de suporte e erros de reprodução são informados na interface. Verifique se há uma voz disponível, se o áudio do sistema está ativo e se houve interação do usuário com a página. Lista de vozes vazia não significa falha ao carregar o documento.

Não presuma que toda voz funciona offline: as vozes podem ser locais ou remotas. O recurso fala texto; não grava o microfone. A narração complementa a navegação por teclado e leitores de tela, sem substituí-los.

Consulte a [referência da Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) para o comportamento do navegador.

> Versão: 0.0.16
