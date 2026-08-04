# ---------------------------------------------------------------------------
# Sube las variables de .env.local a Vercel con el CLI.
#
#   npm i -g vercel
#   vercel login
#   vercel link          # asocia esta carpeta al proyecto de Vercel
#   .\scripts\subir-env-a-vercel.ps1
#
# Por defecto sube al entorno "production". Cambia -Entorno para preview/development.
# Si una variable ya existe en Vercel, el CLI la rechaza: bórrala primero con
#   vercel env rm NOMBRE production
# ---------------------------------------------------------------------------
param(
  [ValidateSet('production', 'preview', 'development')]
  [string]$Entorno = 'production',
  [string]$Archivo = '.env.local'
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  throw "El CLI de Vercel no está instalado. Ejecuta: npm i -g vercel"
}
if (-not (Test-Path $Archivo)) {
  throw "No encuentro $Archivo"
}

foreach ($linea in Get-Content $Archivo -Encoding utf8) {
  $t = $linea.Trim()
  if ($t -eq '' -or $t.StartsWith('#')) { continue }

  $i = $t.IndexOf('=')
  if ($i -lt 1) { continue }

  $nombre = $t.Substring(0, $i).Trim()
  $valor  = $t.Substring($i + 1).Trim()

  # dotenv permite comillas alrededor del valor; Vercel guarda el texto crudo.
  if ($valor.Length -ge 2 -and
      (($valor.StartsWith('"') -and $valor.EndsWith('"')) -or
       ($valor.StartsWith("'") -and $valor.EndsWith("'")))) {
    $valor = $valor.Substring(1, $valor.Length - 2)
  }

  if ($valor -eq '') {
    Write-Host "  omitida (vacía): $nombre"
    continue
  }

  Write-Host "  -> $nombre ($Entorno)"
  # --sensitive impide volver a leer el valor desde el dashboard.
  $valor | vercel env add $nombre $Entorno --sensitive
}

Write-Host ""
Write-Host "Listo. Verifica con: vercel env ls $Entorno"
Write-Host "Redespliega para que tomen efecto: vercel --prod"
