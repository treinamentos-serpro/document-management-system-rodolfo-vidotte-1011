---
name: rodolfo-teste-unitario
description: "Executa os testes automatizados configurados no projeto DMS e resume os resultados"
argument-hint: "Opcional: informe backend, frontend ou um arquivo de teste"
agent: agent
---

Execute os testes automatizados do Document Management System.

1. Verifique os scripts de teste nos arquivos `backend/package.json` e `frontend/package.json` e siga as instruções do projeto.
2. Por padrão, execute a suíte do backend com `npm --prefix backend test`.
3. Execute também `npm --prefix frontend test` somente se o frontend declarar um script `test`. Se não houver script, informe que não há testes configurados para o frontend.
4. Se o usuário indicar `backend`, `frontend` ou um arquivo de teste, limite a execução ao escopo indicado, respeitando o runner e os comandos existentes no respectivo `package.json`.
5. Não trate build, lint ou verificação de tipos como testes. Não instale dependências, altere arquivos, crie testes ou tente corrigir falhas sem solicitação explícita.
6. Aguarde o término de cada comando e reporte o comando executado, o resultado, a quantidade de testes aprovados/reprovados quando disponível e as falhas relevantes. Se um comando falhar, preserve e resuma a saída de erro; não declare sucesso parcial como sucesso total.

Responda em português do Brasil, de forma concisa. Diferencie claramente testes aprovados, reprovados e não configurados/não executados.
---