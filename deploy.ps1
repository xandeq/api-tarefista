# deploy.ps1
#
# ATENCAO: nunca usar `git add .` aqui. Foi assim que `.env` (com o JWT_SECRET)
# e os logs de requisicoes reais entraram no repositorio publico.
# Adicione somente os caminhos de codigo, de forma explicita.

param(
    [string]$commitMessage = "Default commit message"
)

$ErrorActionPreference = "Stop"

# Caminhos versionaveis (allowlist explicita)
$paths = @(
    "controllers",
    "models",
    "routes",
    "events",
    ".github",
    "index.js",
    "logger.js",
    "config.js",
    "phrases.json",
    "env.json",
    "package.json",
    "package-lock.json",
    "Procfile",
    "README.md",
    "deploy.ps1",
    ".gitignore",
    ".gitleaks.toml",
    ".prettierrc",
    ".env.example"
)

$existing = $paths | Where-Object { Test-Path $_ }
git add -- $existing

# Guarda-corpo: aborta se algum segredo entrou no stage
if (Get-Command gitleaks -ErrorAction SilentlyContinue) {
    gitleaks protect --staged -c .gitleaks.toml --no-banner
    if ($LASTEXITCODE -ne 0) {
        Write-Error "gitleaks encontrou segredos no stage. Deploy abortado."
        exit 1
    }
} else {
    Write-Warning "gitleaks nao encontrado - pulando verificacao local de segredos."
}

# Commit das mudancas com a mensagem passada como parametro
git commit -m "$commitMessage"

# Faz o push para o branch main no GitHub
git push origin main

# Faz o push para o Heroku
git push heroku main

# Adiciona o log tail do Heroku no final
heroku logs --tail
