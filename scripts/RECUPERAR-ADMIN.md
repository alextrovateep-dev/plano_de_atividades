# Recuperar superadmin apagado

## Opção A — Firebase Console (mais simples, sem comandos)

### 1. Ver se o login ainda existe

[Authentication](https://console.firebase.google.com/project/plano-de-atividades-teep/authentication/users)

- **Se o e-mail aparecer** → copie o **UID** (coluna User UID).
- **Se não aparecer** → **Add user** → e-mail + senha → copie o **UID** novo.

### 2. Criar o perfil no Firestore

[Firestore](https://console.firebase.google.com/project/plano-de-atividades-teep/firestore) → coleção **`usuarios`** (nome fixo, não use o UID como nome da coleção) → **Add document**

- **Document ID:** cole o **UID** (tem de ser igual ao Authentication).
- Campos:

| Campo      | Tipo    | Valor              |
|-----------|---------|--------------------|
| email     | string  | seu@email.com      |
| nome      | string  | Seu Nome           |
| role      | string  | superadmin         |
| teepStaff | boolean | true               |

### 3. Testar

Abra o site → login com esse e-mail e senha → deve abrir o **Painel administrativo**.

---

## Opção B — Script (terminal)

Na pasta do projeto:

```powershell
cd functions
node ../scripts/recriar-superadmin.js SEU_EMAIL@teep.com
```

Se apagou **também** o login no Authentication:

```powershell
node ../scripts/recriar-superadmin.js SEU_EMAIL@teep.com SenhaMin6 "Seu Nome"
```

Se der erro de credenciais:

```powershell
firebase login
gcloud auth application-default login
```

Depois repita o `node ../scripts/recriar-superadmin.js ...`.
