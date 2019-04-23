<template>
  <div>
    <div class="copy">
      <h1>Kontakt</h1>
      <h2>Christoph Pahmeyer</h2>
      <p>
        <strong>Economic Modelling of Agricultural Systems Group - ILR - Universität Bonn</strong><br>
        Nussallee 21, Haus 2, D-53115 Bonn<br>
        Tel.: +49 (0)228/733775<br>
        E-Mail: christoph.pahmeyer@ilr.uni-bonn.de<br>
      </p>
      <p>
        <strong>Fruchtfolge</strong> ist ein <strong>Open Source</strong> Projekt.<br>
        Sie können die Entwicklung auf<br>
        <a href="https://github.com/fruchtfolge/client">https://github.com/fruchtfolge/client</a><br>
        verfolgen und mitgestalten.
      </p>
      <p>
        Wenn Sie Fehler in der Anwendung entdecken, wären wir dankbar über eine
        kurze Mitteilung per E-Mail oder als
        <a href="https://github.com/fruchtfolge/client/issues">Github Issue</a>
        (präferiert).
      </p>
      <p>
        Aktuelle Projekte und Veröffentlichungen der Economic Modelling of Agricultural Systems Group
        können Sie unter <a href="http://www.ilr.uni-bonn.de/em/em_e.htm">http://www.ilr.uni-bonn.de/em/em_e.htm</a> einsehen.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  middleware: null,
  layout: 'home'
}
</script>

<style scoped>
@media (min-width: 700px) {
  .copy {
    width: 50%;
    min-width: 500px;
    margin: auto;
    top: 120px;
  }
  .copy h1 {
    letter-spacing: 0.05em;
  }
  .copy p {
    font-family: 'Open Sans';
    font-weight: 300;
  }
}
</style>
