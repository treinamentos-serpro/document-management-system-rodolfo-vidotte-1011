# Especificação - Document Management System

## 1. Objetivo

Entregar uma aplicação web para enviar, listar e baixar documentos armazenados localmente, associando cada documento a um usuário.

## 2. Escopo

### Dentro do escopo

- Envio de um documento por requisição.
- Listagem dos documentos associados ao usuário atual.
- Download de um documento pelo identificador.
- Associação de cada documento a um usuário.
- Persistência dos arquivos no filesystem local em `backend/storage`.
- Persistência dos metadados em memória durante a execução do backend.
- Interface web para as operações de envio, listagem e download.

### Fora do escopo

- Armazenamento em nuvem ou em serviços externos.
- Versionamento de documentos.
- Persistência durável dos metadados.
- Cadastro, autenticação e autorização de usuários.
- Compartilhamento de documentos entre usuários.
- Edição ou remoção de documentos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar um arquivo enviado pelo usuário em uma requisição `multipart/form-data`. |
| RF-02 | O sistema deve gravar o arquivo recebido no filesystem local, usando `multer` com `diskStorage`, sob `backend/storage`. |
| RF-03 | O sistema deve gerar um identificador único para cada documento e registrar seus metadados em memória. |
| RF-04 | O sistema deve associar o documento ao usuário atual no momento do envio. |
| RF-05 | O sistema deve retornar os metadados do documento criado após um envio bem-sucedido. |
| RF-06 | O sistema deve listar os metadados dos documentos associados ao usuário atual. |
| RF-07 | O sistema deve permitir baixar um documento pelo identificador, desde que pertença ao usuário atual. |
| RF-08 | O sistema deve responder com erro apropriado quando o arquivo não for enviado, o documento não existir ou o documento não estiver associado ao usuário atual. |
| RF-09 | A interface deve permitir selecionar e enviar um arquivo, consultar a lista de documentos e iniciar o download de um documento. |
| RF-10 | A interface deve apresentar estados de carregamento e mensagens de erro para operações que falharem. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser armazenados exclusivamente no filesystem local, por meio de `multer` configurado com `diskStorage`. |
| RNF-02 | Os metadados devem permanecer em memória; reiniciar o backend pode torná-los indisponíveis. |
| RNF-03 | Configurações operacionais, como porta, diretório de armazenamento e limite de tamanho, devem ser fornecidas por variáveis de ambiente. |
| RNF-04 | O nome original do arquivo não deve ser usado como caminho de armazenamento; o arquivo deve ser gravado com nome interno controlado pela aplicação. |
| RNF-05 | O backend deve tratar erros de entrada, gravação e leitura de arquivos nos limites HTTP, sem expor caminhos internos ao cliente. |
| RNF-06 | O projeto deve manter backend em Node.js e Express com CommonJS, frontend em React e Vite com ESM e testes backend com `node:test`. |
| RNF-07 | A implementação deve respeitar as dependências existentes e a separação de responsabilidades definida para o projeto. |

## 5. Modelo de dados

### Metadados do documento

| Campo | Tipo | Exposição | Descrição |
| --- | --- | --- | --- |
| `id` | string | API | Identificador único gerado pelo sistema. |
| `originalName` | string | API | Nome original fornecido no envio. |
| `size` | number | API | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | API | Data e hora do envio em formato ISO 8601. |
| `owner` | string | API | Identificador do usuário associado ao documento. |
| `storageName` | string | Interno | Nome controlado usado para localizar o arquivo no diretório local; não deve ser retornado pela API. |

O valor de `owner` deve vir do contexto de usuário disponibilizado ao backend. Como autenticação está fora do escopo, a origem desse contexto deve ser definida antes da implementação; o sistema não deve tratar um identificador informado livremente pelo cliente como prova de identidade.

## 6. Contratos de API

As rotas públicas são expostas sob o prefixo `/api`, conforme a configuração de proxy do frontend. Os exemplos de sucesso mostram o corpo da resposta.

### `POST /api/upload`

Envia um documento para o usuário atual.

- Entrada: `multipart/form-data`, com o arquivo no campo `file`.
- Sucesso: `201 Created`, corpo com os metadados públicos do documento.
- Erros esperados:
  - `400 Bad Request`: arquivo ausente ou requisição inválida.
  - `413 Payload Too Large`: arquivo acima do limite configurado.
  - `500 Internal Server Error`: falha ao gravar o arquivo ou registrar os metadados.

### `GET /api/documents`

Lista documentos associados ao usuário atual.

- Entrada: sem corpo.
- Sucesso: `200 OK`, corpo como array de metadados públicos; lista vazia quando não houver documentos.
- Erro esperado:
  - `500 Internal Server Error`: falha ao consultar o repositório em memória.

### `GET /api/documents/:id/download`

Baixa o conteúdo de um documento associado ao usuário atual.

- Entrada: identificador do documento no parâmetro `id`.
- Sucesso: `200 OK`, conteúdo binário do arquivo, com cabeçalho de download e nome original.
- Erros esperados:
  - `404 Not Found`: documento inexistente ou não associado ao usuário atual.
  - `500 Internal Server Error`: falha ao ler o arquivo local.

### Formato das respostas de erro

As respostas de erro devem conter uma mensagem objetiva, sem caminhos locais ou detalhes internos. A forma exata do objeto de erro deve ser padronizada antes da implementação e aplicada aos três endpoints.

## 7. Decisões arquiteturais

- Backend organizado em `routes`, `controllers`, `services` e `repositories`, com dependências no sentido `routes -> controllers -> services -> repositories`.
- `routes` registram endpoints e encaminham requisições.
- `controllers` validam a entrada HTTP e convertem resultados em respostas HTTP.
- `services` implementam as regras de envio, associação ao usuário, listagem e download.
- `repositories` encapsulam o acesso ao filesystem local e aos metadados em memória.
- `multer` com `diskStorage` grava arquivos exclusivamente em `backend/storage`.
- O nome interno do arquivo é gerado pela aplicação; o nome original é mantido somente como metadado.
- O frontend utiliza componentes React e `fetch` para chamar os endpoints sob `/api`.
- A implementação não deve introduzir autenticação, banco de dados ou armazenamento externo nesta fase.
- A identidade do usuário atual e o limite máximo de arquivo são decisões pendentes que devem ser fechadas antes do início da implementação.

## 8. Plano de execução

1. **Consolidar esta especificação**
   - Arquivo: `docs/specs/dms-spec.md`.
   - Atividades: validar escopo, requisitos, modelo de dados, contratos e decisões pendentes com as instruções do projeto.
   - Critério de aceite: o documento descreve os três endpoints, os metadados, as restrições de armazenamento local e os limites de escopo sem prescrever implementação de arquivos de backend ou frontend.

2. **Revisar consistência e critérios de aceite**
   - Arquivo: `docs/specs/dms-spec.md`.
   - Atividades: verificar IDs únicos, alinhamento entre requisitos e contratos, respostas de erro, isolamento por usuário e clareza das decisões pendentes.
   - Critério de aceite: cada requisito funcional pode ser relacionado a um contrato ou comportamento observável, e as decisões necessárias antes da implementação estão explícitas.

3. **Encerrar a etapa de planejamento**
   - Arquivo: `docs/specs/dms-spec.md`.
   - Atividades: registrar a especificação aprovada como referência para uma etapa futura de implementação.
   - Critério de aceite: esta etapa altera somente o documento de especificação; nenhum arquivo de backend ou frontend é criado ou modificado.