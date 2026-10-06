# Especificação - Document Management System

## 1. Objetivo

Permitir que um usuário local envie, consulte e baixe documentos, mantendo os arquivos no filesystem da aplicação e os metadados em memória.

## 2. Escopo

### Dentro do escopo

- Enviar um arquivo e receber seus metadados.
- Listar os documentos associados ao usuário local configurado.
- Baixar um documento pelo identificador.
- Exibir estados de carregamento, sucesso e erro na interface.
- Armazenar arquivos localmente com `multer` e `diskStorage`.

### Fora do escopo

- Autenticação, autorização multiusuário ou gestão de contas.
- Armazenamento em nuvem, banco de dados ou persistência dos metadados entre reinicializações.
- Versionamento, edição, exclusão, busca, paginação ou compartilhamento de documentos.
- Pré-visualização ou conversão de arquivos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo pelo formulário de upload. |
| RF-02 | O sistema rejeita uploads sem arquivo ou acima do limite configurado. |
| RF-03 | Após um upload bem-sucedido, o sistema retorna os metadados públicos do documento criado. |
| RF-04 | O usuário pode listar os documentos do usuário local configurado, ordenados do mais recente para o mais antigo. |
| RF-05 | O usuário pode baixar um documento existente pelo seu identificador. |
| RF-06 | Um identificador inexistente retorna erro `404`, sem revelar caminhos internos. |
| RF-07 | A interface permite selecionar um arquivo, iniciar o envio, exibir o resultado e baixar itens listados. |
| RF-08 | A interface apresenta erros de rede e validação sem perder a lista já carregada. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos são gravados no filesystem local usando `multer` com `diskStorage`; provedores externos não são permitidos. |
| RNF-02 | O diretório padrão é `backend/storage`, configurável por `DMS_STORAGE_DIR`. |
| RNF-03 | Os metadados ficam em memória; reiniciar o processo os apaga. Arquivos que permanecerem no disco após reinício não são recuperáveis pela API nesta versão. |
| RNF-04 | O limite padrão por arquivo é 10 MiB, configurável por `DMS_MAX_FILE_SIZE_BYTES`. |
| RNF-05 | A porta é configurável por `PORT`, com padrão `3000`. |
| RNF-06 | O identificador do usuário local é configurável por `DMS_USER_ID`, com padrão `local-user`; o cliente não pode defini-lo por requisição. |
| RNF-07 | O nome físico do arquivo é gerado pelo sistema e não deriva do nome fornecido pelo cliente. |
| RNF-08 | A API não expõe caminho local, nome físico interno ou stack trace. |
| RNF-09 | A comunicação do frontend usa o prefixo `/api`; em desenvolvimento, o proxy do Vite encaminha as chamadas ao backend. |

## 5. Modelo de dados

### Metadados públicos do documento

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | UUID do documento. |
| `originalName` | string | Nome original informado pelo cliente, apenas para exibição. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload em ISO 8601 UTC. |
| `owner` | string | Identificador definido por `DMS_USER_ID`. |
| `mimeType` | string | Tipo MIME detectado/informado no upload; usar `application/octet-stream` se ausente. |

O repositório pode manter internamente `storageName` ou o caminho resolvido para localizar o arquivo. Esses dados nunca fazem parte da resposta pública. O `id` e o nome físico devem ser gerados pelo servidor.

## 6. Contratos de API

Todas as rotas abaixo são relativas ao backend. O frontend as consome via `/api`.

### Formato de erro

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "O arquivo excede o tamanho máximo permitido."
  }
}