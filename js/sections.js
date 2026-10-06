/* Mostra/esconde secoes conforme o ficheiro sections.txt (chave=valor, true/false).
   Navbar, rodape e hero (#home) nunca sao escondidos. */
(() => {
  const ALWAYS_VISIBLE = ["home"];

  const parse = (text) => {
    const map = {};
    text.split(/\r?\n/).forEach((line) => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;
      const i = line.indexOf("=");
      if (i < 1) return;
      map[line.slice(0, i).trim()] = line.slice(i + 1).trim().toLowerCase() === "true";
    });
    return map;
  };

  const apply = (map) => {
    Object.entries(map).forEach(([id, visible]) => {
      if (visible || ALWAYS_VISIBLE.includes(id)) return;
      const section = document.querySelector("main section#" + CSS.escape(id));
      if (!section) return;
      section.hidden = true;
      section.style.display = "none";
      document
        .querySelectorAll(`.navbar__links a[href="#${id}"]`)
        .forEach((a) => (a.closest("li") || a).remove());
    });
  };

  fetch("sections.txt", { cache: "no-store" })
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((text) => {
      const run = () => apply(parse(text));
      document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", run) : run();
    })
    .catch(() => {}); // sem ficheiro (ou aberto via file://): mostra tudo
})();
