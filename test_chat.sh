#!/bin/bash
# Pruebas del backend chatbot en 4 idiomas
URL="http://localhost:3002/api/chat"
PASS=0; FAIL=0

echo "============================================================"
echo "REPORTE DE PRUEAS - BACKEND CHATBOT (puerto 3002)"
echo "============================================================"

run_test() {
  local n="$1" lang="$2" msg="$3" expect_accion="$4"
  local raw
  raw=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"mensaje\":\"$msg\"}" "$URL" 2>&1)

  local respuesta fuente accion idioma accion_val
  respuesta=$(echo "$raw" | jq -r '.respuesta // empty' 2>/dev/null)
  fuente=$(echo "$raw" | jq -r '.fuente // empty' 2>/dev/null)
  accion=$(echo "$raw" | jq -r '.accion // empty' 2>/dev/null)
  idioma=$(echo "$raw" | jq -r '.idioma // empty' 2>/dev/null)

  # Evaluaciones
  local resp_empty="NO"
  if [ -z "$respuesta" ]; then resp_empty="SÍ"; fi

  local fuente_ok="SÍ"
  if [ -z "$fuente" ]; then fuente_ok="NO"; fi

  local tiene_accion="NO"
  if [ "$accion" = "cambiar_idioma" ]; then tiene_accion="SÍ"; fi

  # Idioma correcto de la respuesta
  local lang_correct="SÍ"
  case "$lang" in
    es)
      # respuesta debe estar en español (no inglés obvio). No hay script distintivo.
      # Marcamos SÍ si no está vacía; revisión manual opcional.
      ;;
    en)
      # debe ser inglés, NO español. Detectar si respuesta parece español (contiene tildes/ñ o palabras españolas clave)
      if echo "$respuesta" | grep -qiE '¡|¿|ñ|á|é|í|ó|ú|sobre|proyecto|proyectos|habilidad|contacto|hola|gracias|cambi'; then
        lang_correct="NO"
      fi
      ;;
    ru)
      # debe ser cirílico
      if ! echo "$respuesta" | grep -qP '[Ѐ-ӿ]'; then lang_correct="NO"; fi
      ;;
    hi)
      # debe ser devanagari
      if ! echo "$respuesta" | grep -qP '[ऀ-ॿ]'; then lang_correct="NO"; fi
      ;;
  esac

  # Accion: solo permitida en test #4
  local accion_ok="SÍ"
  if [ "$tiene_accion" = "SÍ" ] && [ "$expect_accion" != "SÍ" ]; then accion_ok="NO"; fi
  if [ "$tiene_accion" = "NO" ] && [ "$expect_accion" = "SÍ" ]; then accion_ok="NO"; fi

  # Estado general
  local estado="PASS"
  if [ "$resp_empty" = "SÍ" ] || [ "$fuente_ok" = "NO" ] || [ "$lang_correct" = "NO" ] || [ "$accion_ok" = "NO" ]; then
    estado="FAIL"; FAIL=$((FAIL+1))
  else
    PASS=$((PASS+1))
  fi

  echo "-----------------------------------------------------------"
  echo "Prueba #$n [$lang]"
  echo "Mensaje: $msg"
  echo "Respuesta: $respuesta"
  echo "Idioma correcto? : $lang_correct"
  echo "Tiene accion:cambiar_idioma? : $tiene_accion (esperada: $expect_accion)"
  echo "Fuente: $fuente (idioma campo: $idioma)"
  echo "Respuesta vacia? : $resp_empty"
  echo "Estado: $estado"
}

run_test 1  es "hola"                              NO
run_test 2  es "¿quién es mauricio?"               NO
run_test 3  es "gracias"                           NO
run_test 4  es "cambiar idioma a inglés"           SÍ
run_test 5  en "hello"                             NO
run_test 6  en "who is mauricio?"                  NO
run_test 7  en "thank you"                         NO
run_test 8  ru "привет"                            NO
run_test 9  ru "кто такой маурисио?"               NO
run_test 10 ru "спасибо"                           NO
run_test 11 hi "नमस्ते"                            NO
run_test 12 hi "मॉरिसियो कौन है?"                NO
run_test 13 hi "धन्यवाद"                          NO

echo "============================================================"
echo "RESUMEN: PASS=$PASS  FAIL=$FAIL  (total 13)"
echo "============================================================"
