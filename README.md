# DoIt

Aplicação web de gerenciamento de tarefas, desenvolvida como trabalho da disciplina **Fábrica de Software** — Engenharia de Software, Univille.

## Sobre o projeto

O DoIt resolve um problema simples: tarefas espalhadas em cadernos, aplicativos de mensagem e anotações avulsas. A proposta é centralizar tudo em um único lugar, acessível diretamente pelo navegador, sem instalação ou cadastro complexo.

## Funcionalidades

- Cadastro e login de conta (autenticação client-side)
- Adicionar, visualizar e excluir tarefas
- Marcar tarefas como concluídas
- Filtrar tarefas por status: **Todas**, **Pendentes** ou **Concluídas**
- Contador de tarefas pendentes e concluídas
- Dados persistidos no `localStorage` — as tarefas continuam após fechar o navegador
- Cada conta possui sua própria lista de tarefas isolada

## Tecnologias

- HTML5
- CSS3
- JavaScript Vanilla

Sem frameworks, sem dependências externas, sem backend. A aplicação roda 100% no navegador.

## Como executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/fagsgabriel/Doit__Sistema_Kanban__Fabrica_de_Software.git
   ```
2. Abra o arquivo `index.html` diretamente no navegador.

Não é necessário servidor, npm ou qualquer configuração adicional.

## Estrutura de arquivos

```
├── index.html   # Estrutura das três telas (Login, Cadastro, Gerenciador)
├── style.css    # Estilos e layout responsivo
└── app.js       # Lógica de autenticação, tarefas e navegação
```

## Autor

Gabriel Fagundes — Engenharia de Software, Univille (2026)
