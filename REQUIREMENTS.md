**CONEXÃO INFLUENCER**

Documento Técnico de Especificação

_Plataforma de Fidelização para Arquitetos Parceiros_

| Versão    | 1.0                                        |
| :-------- | :----------------------------------------- |
| **Data**  | 16/03/2026                                 |
| **Tipo**  | Especificação de Backend \+ Banco de Dados |
| **Stack** | Supabase (Auth \+ PostgreSQL \+ Storage)   |

# **1\. Visão Geral do Projeto**

O Conexão Influencer é uma plataforma de fidelização para uma loja de móveis de alto padrão. O objetivo é registrar, gerenciar e acumular pontos para arquitetos parceiros que realizam vendas pela loja, incentivando o engajamento através de um sistema de ranking.

## **1.1 Personas**

- Administrador (Admin): equipe da loja de móveis responsável por cadastros e lançamentos de pontuação.

- Arquiteto: profissional parceiro que pontua através de vendas e acompanha seu desempenho via portal dedicado.

## **1.2 Decisões de Arquitetura**

| O sistema utiliza o Supabase como backend principal, aproveitando três de seus serviços: • Supabase Auth — gerenciamento de identidade, OTP via e-mail, sessões JWT • Supabase PostgreSQL — banco de dados relacional com RLS (Row Level Security) • Supabase Storage — armazenamento de fotos de perfil dos arquitetos A autenticação é exclusivamente por OTP (One-Time Password). Não há senhas. |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

A separação entre identidade e dados de negócio é uma decisão central: a tabela user_profiles cuida apenas de identity/role, enquanto architects guarda os dados profissionais. Os dois registros são criados em momentos distintos e vinculados no primeiro login do arquiteto.

# **2\. Fluxo de Autenticação (Supabase OTP)**

Todo o gerenciamento de sessão, tokens JWT e envio de e-mails é delegado ao Supabase Auth. A aplicação não armazena tokens nem gerencia sessões diretamente.

## **2.1 Configuração no Supabase Dashboard**

- Habilitar "Email OTP" em Authentication \> Providers \> Email

- Desabilitar "Confirm email" e "Magic Link" para forçar fluxo exclusivo por OTP

- Configurar template do e-mail OTP em Authentication \> Email Templates

- Definir JWT expiry e refresh token conforme política de segurança do projeto

## **2.2 Fluxo — Arquiteto (primeiro login)**

1. Arquiteto informa e-mail na tela de login.

2. Backend verifica se o e-mail existe em architects. Se não existir, retorna 401\.

3. Backend chama supabase.auth.signInWithOtp({ email }) — Supabase envia o código ao e-mail.

4. Arquiteto insere o código OTP no site.

5. Backend chama supabase.auth.verifyOtp({ email, token, type: "email" }). Supabase retorna session \+ user.

6. Backend verifica se existe user_profile para o auth.uid() retornado.

7. Se não existir: cria user_profile { auth_user_id, role: "architect" } e vincula architects.user_id \= user_profile.id pelo e-mail.

8. Retorna JWT \+ role ao cliente. Frontend redireciona para /dashboard.

## **2.3 Fluxo — Admin (login recorrente)**

9. Admin informa e-mail. Backend verifica se existe user_profile com role \= "admin".

10. Backend chama supabase.auth.signInWithOtp({ email }).

11. Admin insere o código OTP.

12. Supabase valida e retorna session. Retorna JWT \+ role. Frontend redireciona para /admin.

| Nota sobre admins: o user_profile com role \= "admin" é inserido manualmente via SQL ou pelo painel do Supabase antes do primeiro acesso. Não existe endpoint de cadastro de admin. SQL de inserção: INSERT INTO user_profiles (auth_user_id, role) VALUES ('\<uuid\>', 'admin'); |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

# **3\. Modelo de Dados**

O banco de dados segue a seguinte separação de responsabilidades:

- user_profiles: identidade e role do usuário autenticado. Não contém dados de negócio.

- architects: cadastro profissional do arquiteto, criado pelo admin antes do primeiro login.

- point_types: tipos de pontuação gerenciados inline pelo admin.

- point_entries: lançamentos de pontos vinculados a um arquiteto e a um tipo.

## **3.1 Enum: user_role**

| Campo         | Tipo   | Nullable | Descrição                                                |
| :------------ | :----- | -------- | :------------------------------------------------------- |
| **admin**     | string | não      | Equipe da loja com acesso total ao painel administrativo |
| **architect** | string | não      | Arquiteto parceiro com acesso somente ao próprio portal  |

## **3.2 Tabela: user_profiles**

Criada no primeiro login via OTP. Vincula auth.users ao sistema da aplicação.

| Campo            | Tipo        | Nullable | Descrição                                       |
| :--------------- | :---------- | -------- | :---------------------------------------------- | ----------- |
| **id**           | uuid        | não      | PK — gerado automaticamente (gen_random_uuid)   |
| **auth_user_id** | uuid        | não      | FK → auth.users(id) — unique, on delete cascade |
| **role**         | user_role   | não      | Enum: "admin"                                   | "architect" |
| **created_at**   | timestamptz | não      | Data de criação do perfil                       |

## **3.3 Tabela: architects**

Criada pelo admin. Vinculada ao user_profile somente após o primeiro login do arquiteto.

| Campo              | Tipo        | Nullable | Descrição                                          |
| :----------------- | :---------- | -------- | :------------------------------------------------- |
| **id**             | uuid        | não      | PK — gerado automaticamente                        |
| **user_id**        | uuid        | sim      | FK → user_profiles(id) — null até o primeiro login |
| **name**           | text        | não      | Nome completo do arquiteto                         |
| **email**          | text        | não      | E-mail único — chave de acesso ao sistema          |
| **phone**          | text        | sim      | Telefone do escritório                             |
| **office_address** | text        | sim      | Endereço do escritório                             |
| **birthdate**      | date        | sim      | Data de nascimento                                 |
| **cau_register**   | text        | sim      | Número de registro CAU                             |
| **photo_url**      | text        | sim      | URL da foto armazenada no Supabase Storage         |
| **created_at**     | timestamptz | não      | Data de cadastro pelo admin                        |
| **updated_at**     | timestamptz | não      | Última atualização dos dados                       |

## **3.4 Tabela: point_types**

Gerenciados inline pelo admin no próprio dropdown de lançamento. Não há tela separada.

| Campo          | Tipo        | Nullable | Descrição                                |
| :------------- | :---------- | -------- | :--------------------------------------- |
| **id**         | uuid        | não      | PK — gerado automaticamente              |
| **name**       | text        | não      | Nome único do tipo (ex: "Venda de Rack") |
| **created_at** | timestamptz | não      | Data de criação                          |

| Regra de negócio: um point_type não pode ser excluído se existirem point_entries vinculadas a ele. O backend deve verificar e retornar 409 Conflict nesse caso. |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## **3.5 Tabela: point_entries**

Registro de cada lançamento de pontos feito por um admin para um arquiteto.

| Campo             | Tipo        | Nullable | Descrição                                             |
| :---------------- | :---------- | -------- | :---------------------------------------------------- |
| **id**            | uuid        | não      | PK — gerado automaticamente                           |
| **architect_id**  | uuid        | não      | FK → architects(id) — on delete cascade               |
| **point_type_id** | uuid        | não      | FK → point_types(id)                                  |
| **amount**        | integer     | não      | Quantidade de pontos — deve ser \> 0                  |
| **entry_date**    | date        | não      | Data do lançamento — padrão: dia atual, editável      |
| **created_by**    | uuid        | sim      | FK → auth.users(id) — admin que realizou o lançamento |
| **created_at**    | timestamptz | não      | Timestamp de criação do registro                      |
| **updated_at**    | timestamptz | não      | Timestamp da última edição                            |

# **4\. Endpoints da API**

Todos os endpoints autenticados exigem o header Authorization: Bearer \<jwt\>. O JWT é emitido pelo Supabase após verificação do OTP.

## **4.1 Autenticação**

| Método   | Rota         | Descrição                                                                                         | Auth        |
| -------- | :----------- | :------------------------------------------------------------------------------------------------ | :---------- |
| **POST** | /auth/otp    | Solicita envio de OTP ao e-mail. Valida se e-mail existe no sistema antes de chamar Supabase.     | público     |
| **POST** | /auth/verify | Verifica token OTP. Cria user_profile e vincula arquiteto no primeiro login. Retorna JWT \+ role. | público     |
| **POST** | /auth/logout | Invalida a sessão atual no Supabase.                                                              | autenticado |

## **4.2 Arquitetos (Admin)**

| Método    | Rota            | Descrição                                                                         | Auth  |
| --------- | :-------------- | :-------------------------------------------------------------------------------- | :---- |
| **GET**   | /architects     | Lista todos os arquitetos com total de pontos e status de vínculo (linked: bool). | admin |
| **POST**  | /architects     | Cadastra novo arquiteto. Cria apenas o registro profissional, sem criar usuário.  | admin |
| **GET**   | /architects/:id | Retorna dados completos do arquiteto \+ histórico de lançamentos de pontos.       | admin |
| **PATCH** | /architects/:id | Atualiza dados do arquiteto (nome, telefone, endereço, foto, etc.).               | admin |

## **4.3 Tipos de Pontuação (Admin)**

| Método     | Rota             | Descrição                                                     | Auth  |
| ---------- | :--------------- | :------------------------------------------------------------ | :---- |
| **GET**    | /point-types     | Lista todos os tipos de pontuação disponíveis.                | admin |
| **POST**   | /point-types     | Cria novo tipo de pontuação.                                  | admin |
| **DELETE** | /point-types/:id | Remove tipo. Retorna 409 se existirem lançamentos vinculados. | admin |

## **4.4 Lançamentos de Pontos (Admin)**

| Método     | Rota               | Descrição                                                                                     | Auth  |
| ---------- | :----------------- | :-------------------------------------------------------------------------------------------- | :---- |
| **GET**    | /point-entries     | Lista todos os lançamentos. Filtros: ?architect_id=\&from=\&to= Ordenado por entry_date desc. | admin |
| **POST**   | /point-entries     | Cria novo lançamento de pontos para um arquiteto.                                             | admin |
| **PATCH**  | /point-entries/:id | Edita lançamento: data, tipo, arquiteto vinculado ou quantidade.                              | admin |
| **DELETE** | /point-entries/:id | Remove lançamento.                                                                            | admin |

## **4.5 Portal do Arquiteto**

| Método  | Rota        | Descrição                                                    | Auth        |
| ------- | :---------- | :----------------------------------------------------------- | :---------- |
| **GET** | /me         | Retorna perfil do arquiteto logado \+ saldo total de pontos. | architect   |
| **GET** | /me/entries | Histórico de lançamentos do próprio arquiteto.               | architect   |
| **GET** | /ranking    | Top 10 arquitetos por pontuação no ano vigente.              | autenticado |

## **4.6 Dashboard Administrativo**

| Método  | Rota     | Descrição                                                      | Auth  |
| ------- | :------- | :------------------------------------------------------------- | :---- |
| **GET** | /ranking | Top 10 do ano vigente — mesmo endpoint do portal do arquiteto. | admin |

# **5\. Tipagem dos Payloads**

## **5.1 POST /auth/otp**

### **Request body**

| Campo     | Tipo   | Nullable | Descrição                                                       |
| :-------- | :----- | -------- | :-------------------------------------------------------------- |
| **email** | string | não      | E-mail cadastrado na tabela architects ou user_profiles (admin) |

### **Response 200**

| Campo       | Tipo   | Nullable | Descrição                 |
| :---------- | :----- | -------- | :------------------------ |
| **message** | string | não      | "OTP enviado com sucesso" |

## **5.2 POST /auth/verify**

### **Request body**

| Campo     | Tipo   | Nullable | Descrição                                   |
| :-------- | :----- | -------- | :------------------------------------------ |
| **email** | string | não      | E-mail utilizado para solicitar o OTP       |
| **token** | string | não      | Código OTP de 6 dígitos recebido por e-mail |

### **Response 200**

| Campo             | Tipo      | Nullable | Descrição                                                    |
| :---------------- | :-------- | -------- | :----------------------------------------------------------- | ----------- |
| **access_token**  | string    | não      | JWT de acesso emitido pelo Supabase                          |
| **refresh_token** | string    | não      | Refresh token para renovação de sessão                       |
| **role**          | user_role | não      | "admin"                                                      | "architect" |
| **architect_id**  | uuid      | sim      | ID do arquiteto — presente apenas quando role \= "architect" |

## **5.3 POST /architects**

### **Request body**

| Campo              | Tipo   | Nullable | Descrição                                 |
| :----------------- | :----- | -------- | :---------------------------------------- |
| **name**           | string | não      | Nome completo                             |
| **email**          | string | não      | E-mail único — usado como chave de acesso |
| **phone**          | string | sim      | Telefone do escritório                    |
| **office_address** | string | sim      | Endereço completo do escritório           |
| **birthdate**      | string | sim      | Data no formato ISO 8601 (YYYY-MM-DD)     |
| **cau_register**   | string | sim      | Número de registro no CAU                 |
| **photo**          | File   | sim      | Imagem enviada via multipart/form-data    |

### **Response 201**

| Campo              | Tipo    | Nullable | Descrição                                      |
| :----------------- | :------ | -------- | :--------------------------------------------- |
| **id**             | uuid    | não      | ID gerado pelo banco                           |
| **user_id**        | uuid    | sim      | null até o primeiro login                      |
| **name**           | string  | não      | Nome completo                                  |
| **email**          | string  | não      | E-mail                                         |
| **phone**          | string  | sim      | Telefone                                       |
| **office_address** | string  | sim      | Endereço                                       |
| **birthdate**      | string  | sim      | Data ISO 8601                                  |
| **cau_register**   | string  | sim      | Registro CAU                                   |
| **photo_url**      | string  | sim      | URL pública no Supabase Storage                |
| **linked**         | boolean | não      | true se arquiteto já realizou o primeiro login |
| **total_points**   | integer | não      | Soma total de pontos acumulados                |
| **created_at**     | string  | não      | ISO 8601 timestamp                             |
| **updated_at**     | string  | não      | ISO 8601 timestamp                             |

## **5.4 POST /point-types**

### **Request body**

| Campo    | Tipo   | Nullable | Descrição                                |
| :------- | :----- | -------- | :--------------------------------------- |
| **name** | string | não      | Nome único do tipo (ex: "Venda de Rack") |

### **Response 201**

| Campo          | Tipo   | Nullable | Descrição            |
| :------------- | :----- | -------- | :------------------- |
| **id**         | uuid   | não      | ID gerado pelo banco |
| **name**       | string | não      | Nome do tipo         |
| **created_at** | string | não      | ISO 8601 timestamp   |

## **5.5 POST /point-entries**

### **Request body**

| Campo             | Tipo    | Nullable | Descrição                                                            |
| :---------------- | :------ | -------- | :------------------------------------------------------------------- |
| **architect_id**  | uuid    | não      | ID do arquiteto que receberá os pontos                               |
| **point_type_id** | uuid    | não      | ID do tipo de pontuação                                              |
| **amount**        | integer | não      | Quantidade de pontos — deve ser \> 0                                 |
| **entry_date**    | string  | não      | Data do lançamento ISO 8601 (padrão: hoje, editável para retroativo) |

### **Response 201**

| Campo             | Tipo    | Nullable | Descrição                                |
| :---------------- | :------ | -------- | :--------------------------------------- |
| **id**            | uuid    | não      | ID gerado pelo banco                     |
| **architect_id**  | uuid    | não      | ID do arquiteto                          |
| **point_type_id** | uuid    | não      | ID do tipo                               |
| **point_type**    | object  | não      | Objeto { id, name } do tipo de pontuação |
| **amount**        | integer | não      | Quantidade de pontos                     |
| **entry_date**    | string  | não      | Data do lançamento ISO 8601              |
| **created_by**    | uuid    | sim      | ID do admin que criou o lançamento       |
| **created_at**    | string  | não      | ISO 8601 timestamp                       |
| **updated_at**    | string  | não      | ISO 8601 timestamp                       |

## **5.6 GET /me**

### **Response 200**

| Campo            | Tipo    | Nullable | Descrição                        |
| :--------------- | :------ | -------- | :------------------------------- |
| **id**           | uuid    | não      | ID do arquiteto                  |
| **name**         | string  | não      | Nome completo                    |
| **email**        | string  | não      | E-mail                           |
| **photo_url**    | string  | sim      | URL da foto de perfil            |
| **cau_register** | string  | sim      | Registro CAU                     |
| **total_points** | integer | não      | Saldo total de pontos acumulados |

## **5.7 GET /ranking**

### **Response 200**

| Campo                        | Tipo    | Nullable | Descrição                                  |
| :--------------------------- | :------ | -------- | :----------------------------------------- |
| **ranking**                  | array   | não      | Lista dos top 10 arquitetos do ano vigente |
| **ranking\[\].position**     | integer | não      | Posição no ranking (1 a 10\)               |
| **ranking\[\].architect_id** | uuid    | não      | ID do arquiteto                            |
| **ranking\[\].name**         | string  | não      | Nome do arquiteto                          |
| **ranking\[\].photo_url**    | string  | sim      | URL da foto de perfil                      |
| **ranking\[\].total_points** | integer | não      | Total de pontos no ano vigente             |
| **year**                     | integer | não      | Ano de referência do ranking               |

# **6\. Segurança e Row Level Security (RLS)**

O Supabase aplica RLS diretamente no banco de dados. Qualquer acesso direto via SDK do cliente (sem passar pelo backend) também é protegido pelas políticas abaixo.

## **6.1 Policies por tabela**

### **user_profiles**

- SELECT: usuário lê apenas o próprio perfil (auth_user_id \= auth.uid()) ou é admin.

- INSERT: somente admins podem inserir (para cadastro manual de novos admins).

### **architects**

- SELECT: admin lê todos; arquiteto lê apenas o próprio registro (via my_architect_id()).

- INSERT / UPDATE / DELETE: somente admins.

### **point_types**

- SELECT: qualquer usuário autenticado.

- INSERT / DELETE: somente admins.

### **point_entries**

- SELECT: admin lê todos; arquiteto lê apenas os próprios lançamentos.

- INSERT / UPDATE / DELETE: somente admins.

## **6.2 Funções auxiliares (security definer)**

Duas funções SQL são definidas com SECURITY DEFINER para uso nas policies:

- is_admin(): retorna true se o usuário logado tiver role \= "admin" em user_profiles.

- my_architect_id(): retorna o UUID do arquiteto vinculado ao usuário logado.

# **7\. Histórias de Usuário**

## **Épico 1 — Gestão de Arquitetos (Admin)**

### **US01 — Cadastro de Arquitetos**

- Formulário: Nome, Endereço do escritório, Data de nascimento, E-mail, Telefone, Registro CAU, Upload de foto.

- O e-mail cadastrado é a chave de acesso do arquiteto — deve ser único no sistema.

- O cadastro cria apenas o registro em architects. O user_profile é criado somente no primeiro login.

### **US02 — Visualização e Edição do Perfil do Arquiteto**

- Tela de detalhes exibe dados pessoais e histórico completo de lançamentos de pontuação.

- Botão de atalho "Lançar Nova Pontuação" disponível nessa tela.

- Exibe indicador de vínculo (se o arquiteto já realizou o primeiro login).

## **Épico 2 — Gestão de Pontuação (Admin)**

### **US03 — Listagem Geral de Pontuações**

- Lista todos os lançamentos ordenados por data (mais recente primeiro).

- Filtros por: Arquiteto e Período (data inicial / data final).

- Cada linha exibe: data, arquiteto, tipo de ponto, quantidade.

### **US04 — Lançamento de Pontos**

- Modal/tela com campos: Arquiteto, Quantidade, Tipo de ponto, Data.

- Data pré-preenchida com o dia atual, mas editável para lançamentos retroativos.

### **US05 — Gerenciamento de Tipos de Pontos (inline)**

- Não existe tela separada para gerenciar tipos.

- No dropdown de seleção de tipo, o admin pode digitar um novo nome para criá-lo ou excluir um existente.

- Exclusão bloqueada se existirem lançamentos vinculados (retorna 409).

### **US06 — Edição de Lançamento**

- A partir da listagem, é possível abrir e editar: data, tipo, arquiteto vinculado ou quantidade.

## **Épico 3 — Portal do Arquiteto**

### **US07 — Autenticação sem Senha (OTP)**

- Arquiteto informa e-mail na tela de login.

- Sistema envia código OTP via Supabase Auth — sem senhas, sem magic links.

- Arquiteto insere o código e obtém acesso. Primeiro login cria e vincula o user_profile automaticamente.

### **US08 — Dashboard do Arquiteto**

- Saldo atual de pontos exibido em destaque na tela inicial.

- Ranking dos 10 arquitetos com mais pontos no ano vigente.

## **Épico 4 — Dashboard Administrativo**

### **US09 — Dashboard Home Admin**

- Tela inicial exibe ranking dos 10 arquitetos que mais pontuaram no ano.

- Mesmo endpoint /ranking utilizado pelo portal do arquiteto.
