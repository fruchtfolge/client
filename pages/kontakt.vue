<template>
  <div>
    <div class="copy">
      <div style="width: 100%; max-width: 888px; flex: 1 0 100%;">
        <div class="grid" columns="1" columns-s="1" style="grid-row-gap: 0px;">
          <h2>Kontakt</h2>
          <h2 style="margin-bottom: 0px;">
            Christoph Pahmeyer
          </h2>
          <div>
            <p>
              <strong>Economic Modeling of Agricultural Systems Group - ILR - Universität Bonn</strong><br>
              Nussallee 21, Haus 2, D-53115 Bonn<br>
              Tel.: +49 (0)228/733775<br>
              E-Mail: christoph.pahmeyer@ilr.uni-bonn.de<br>
              Web: <a class="link" href="https://chrispahm.github.io/about" target="_blank">https://chrispahm.github.io</a>
            </p>
            <p>
              <strong>Fruchtfolge</strong> ist ein <strong>Open Source</strong> Projekt.<br>
              Sie können die Entwicklung auf<br>
              <a class="link" href="https://github.com/fruchtfolge">https://github.com/fruchtfolge</a><br>
              verfolgen und mitgestalten.
            </p>
            <p>
              Wenn Sie Fehler in der Anwendung entdecken, wären wir dankbar über eine
              kurze Mitteilung per E-Mail oder als
              <a class="link" href="https://github.com/fruchtfolge/client/issues">Github Issue</a>
              (präferiert).
            </p>
            <p>
              Aktuelle Projekte und Veröffentlichungen der Economic Modelling of Agricultural Systems Group
              können Sie unter <a class="link" href="http://www.ilr.uni-bonn.de/em/em_e.htm">http://www.ilr.uni-bonn.de/em/em_e.htm</a> einsehen.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  scrollToTop: true,
  middleware: null,
  layout: 'home'
}
</script>

<style media="screen">
.copy {
  min-height: 100vh;
}
</style>
