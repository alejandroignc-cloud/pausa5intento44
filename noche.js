/* Pausa5: módulo nocturno opcional.
   No almacena respuestas ni historial en localStorage, cookies o servidor. */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    const abrir = document.getElementById("abrirNoche");
    const modal = document.getElementById("nocheModal");
    const ventana = modal?.querySelector(".night-sheet");
    const cerrar = document.getElementById("cerrarNoche");
    const audio = document.getElementById("nocheAudio");
    const audioPanel = document.getElementById("nocheAudioContenedor");
    const audioEstado = document.getElementById("nocheAudioEstado");
    const indicador = document.getElementById("nochePasoIndicador");
    const pasos = Array.from(modal?.querySelectorAll(".night-step") || []);
    const marcas = Array.from(modal?.querySelectorAll(".night-dots i") || []);
    if (!abrir || !modal || !ventana || !cerrar || !audio || pasos.length !== 3) return;

    let ultimoFoco = null; // Solo memoria de esta pantalla.
    let pasoActual = 1;

    function mostrarPaso(numero) {
      pasoActual = numero;
      pasos.forEach(p => { p.hidden = Number(p.dataset.nochePaso) !== numero; });
      marcas.forEach((m, i) => m.classList.toggle("active", i === numero - 1));
      indicador.textContent = `Paso ${numero} de 3`;
      ventana.scrollTop = 0;
      const titulo = pasos[numero - 1].querySelector("h3");
      if (titulo) { titulo.setAttribute("tabindex", "-1"); titulo.focus({preventScroll:true}); }
    }

    function abrirModulo() {
      ultimoFoco = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      mostrarPaso(1);
    }

    function cerrarModulo() {
      audio.pause();
      audio.currentTime = 0;
      audioPanel.hidden = true;
      audioEstado.textContent = "Puedes pausar o repetir el audio cuando quieras.";
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      // Evitar liberar scroll cuando otra ventana de la app sigue abierta.
      if (!document.querySelector(".routine-modal.active, .overlay-modal.active")) {
        document.body.classList.remove("modal-open");
      }
      pasos.forEach((p,i) => { p.hidden = i !== 0; });
      indicador.textContent = "Paso 1 de 3";
      marcas.forEach((m,i) => m.classList.toggle("active",i === 0));
      pasoActual = 1;
      if (ultimoFoco?.isConnected) ultimoFoco.focus({preventScroll:true});
      ultimoFoco = null;
    }

    abrir.addEventListener("click", abrirModulo);
    cerrar.addEventListener("click", cerrarModulo);
    modal.addEventListener("click", event => { if (event.target === modal) cerrarModulo(); });
    document.addEventListener("keydown", event => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") { event.preventDefault(); cerrarModulo(); return; }
      if (event.key === "Tab") {
        const focusable = Array.from(ventana.querySelectorAll('button:not([disabled]),a[href],audio[controls]'))
          .filter(el => !el.closest('[hidden]'));
        if (!focusable.length) return;
        const primero = focusable[0], ultimo = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === primero) {event.preventDefault();ultimo.focus();}
        else if (!event.shiftKey && document.activeElement === ultimo) {event.preventDefault();primero.focus();}
      }
    });

    document.getElementById("nocheSi").addEventListener("click", () => mostrarPaso(2));
    document.getElementById("nocheAlternativa").addEventListener("click", () => mostrarPaso(3));
    document.getElementById("nocheNo").addEventListener("click", () => {
      cerrarModulo();
      // Abrir el reproductor estándar; sin estado elegido, usar la rutina tranquila.
      // No se almacena la elección sobre medicamentos.
      if (!estadoActual) seleccionarEstado("tranquilo", false);
      iniciarRutina();
    });

    document.getElementById("nocheReproducir").addEventListener("click", async () => {
      audioPanel.hidden = false;
      audioEstado.textContent = "Iniciando la relajación guiada...";
      try {
        await audio.play();
      } catch (_) {
        audioEstado.textContent = "Presiona Reproducir en el control de audio para comenzar.";
        audio.focus();
      }
    });
    audio.addEventListener("play", () => { audioEstado.textContent = "Audio en reproducción. Puedes pausarlo en cualquier momento."; });
    audio.addEventListener("pause", () => { if (!audio.ended && modal.classList.contains("is-open")) audioEstado.textContent = "Audio en pausa. Puedes retomarlo cuando quieras."; });
    audio.addEventListener("ended", () => { audioEstado.textContent = "Terminaste tu pausa nocturna. Puedes repetirla o cerrar esta ventana."; });
    audio.addEventListener("error", () => { audioEstado.textContent = "No pudimos abrir el archivo de audio. Revisa tu conexión y vuelve a intentarlo."; });
  });
})();
