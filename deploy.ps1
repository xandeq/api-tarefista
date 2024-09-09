# deploy.ps1

param(
    [string]$commitMessage = "Default commit message"
)

# Adiciona todas as mudanças
git add .

# Commit das mudanças com a mensagem passada como parâmetro
git commit -m "$commitMessage"

# Faz o push para o branch main no GitHub
git push origin main

# Faz o push para o Heroku
git push heroku main

# Adiciona o log tail do Heroku no final
heroku logs --tail
