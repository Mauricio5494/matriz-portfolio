# 🛡️ Guía de Seguridad — GitHub Desktop (matriz-portfolio)

Este archivo explica el flujo seguro para hacer cambios al portfolio usando **GitHub Desktop** sin romper el repositorio.

---

## ✅ Reglas de oro

1. **Siempre usa una sola carpeta del proyecto.** No clones el repo en dos lugares distintos. Si ya clonaste en otra carpeta (ej. `Documentos/GitHub/`), bórrala y trabaja solo aquí:
   ```
   /home/sparky/Documentos/Github Projects/matriz-portfolio/
   ```

2. **Nunca uses "Force push" a menos que estés 100% seguro de que tu versión local es la correcta y el remoto está roto.** El force push borra el historial del remoto.

3. **Antes de hacer Push, siempre haz Fetch primero.** Así ves si hay cambios en el remoto que no tienes localmente.

---

## 📋 Flujo recomendado (paso a paso)

### 1. Abrir GitHub Desktop
Abre la aplicación y selecciona el repositorio `matriz-portfolio`.

### 2. Fetch (traer cambios del remoto)
- Haz clic en **Fetch origin** (arriba a la derecha).
- Esto descarga los cambios del remoto sin mezclarlos con los tuyos.

### 3. Revisar si hay cambios pendientes
- Si GitHub Desktop te dice que tu rama está **detrás** de `origin/main`, significa que hay cambios en el remoto que no tienes localmente.
- Haz **Pull origin** para bajarlos y mezclarlos con tu trabajo local.
- Si hay un **conflicto de fusión**, GitHub Desktop te lo dirá. No hagas force push. Resuelve el conflicto en los archivos, commitea y luego empuja.

### 4. Hacer tus cambios
Edita los archivos en tu editor de código (VS Code, etc.). Los cambios aparecerán automáticamente en GitHub Desktop en la pestaña **Changes**.

### 5. Commit
- Escribe un resumen claro (ej: `feat: agregar sección Mejor Proyecto`).
- Opcionalmente agrega una descripción más detallada.
- Haz clic en **Commit to main**.

### 6. Push
- Haz clic en **Push origin** (arriba a la derecha).
- Si GitHub Desktop te avisa que el remoto tiene cambios que no tienes, **no hagas force push**. Haz Pull primero, resuelve conflictos si los hay, y luego Push.

---

## 🚫 Qué NO hacer

| ❌ No hagas esto | ✅ Haz esto en su lugar |
|---|---|
| Force push sin verificar | Fetch primero, luego Pull si hay cambios remotos |
| Clonar el repo en dos carpetas distintas | Usa siempre la misma carpeta de trabajo |
| Ignorar advertencias de conflicto | Resuelve el conflicto antes de empujar |
| Hacer push sin revisar los archivos cambiados | Revisa la pestaña Changes antes de commitear |

---

## 🆘 Si algo sale mal

Si el repositorio se rompe o se ve mal en GitHub Pages:

1. **No entres en pánico.** Todo está commiteado localmente.
2. Abre una terminal en la carpeta del proyecto:
   ```bash
   cd "/home/sparky/Documentos/Github Projects/matriz-portfolio"
   ```
3. Verifica el estado:
   ```bash
   git status
   git log --oneline -5
   ```
4. Si necesitas restaurar el último commit bueno, avísame y te ayudo.

---

## 📁 Archivos importantes del proyecto

| Archivo | Qué contiene |
|---|---|
| `index.html` | HTML principal con todas las secciones |
| `css/style.css` | Entry point que importa los parciales |
| `css/_components.css` | Estilos base (incluye efecto tilt, gaps) |
| `css/_theme-milk-chan.css` | Tema Milk-chan con Press Start 2P |
| `js/cards-tilt.js` | Lógica del efecto 3D en tarjetas |
| `GUIA_GITHUB_DESKTOP.md` | Esta guía |

---

Última actualización: 2026-11-12
