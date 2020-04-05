<template>
  <div>
    <div class="copy">
      <h1>Impressum</h1>
      <h2>Christoph Pahmeyer</h2>
      <p>
        Economic Modelling of Agricultural Systems Group - ILR - Universität Bonn<br>
        Nussallee 21, Haus 2, D-53115 Bonn<br>
        Tel.: +49 (0)228/733775, E-Mail: christoph.pahmeyer@ilr.uni-bonn.de<br>
      </p>
      <h2>Haftungsausschluss</h2>
      <p>
        Für Aktualität, Vollständigkeit, Fehlerfreiheit und Funktionalität der bereitgestellten Informationen kann keinerlei Gewähr übernommen werden. Die Freiheit sämtlicher online-Angebote von Viren und / oder sonstigen Beeinträchtigungen wird nicht garantiert.<br>
        <br>
        Es wird sich ausdrücklich vorbehalten, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen. Ein Nutzer-Anspruch auf ständige Bereitstellung besteht nicht.<br>
        <br>
        Fremde Seiten, zu denen Verknüpfungen (Links) bestehen, liegen ausschließlich in der Verantwortung des jeweiligen Anbieters (Urteil vom 12. Mai 1998, Az.: 312085/98, LG Hamburg). Es wird nicht garantiert, dass diese Seiten einwandfrei sind und immer funktionieren.<br>
        <br>
        Für Schäden, die durch die Nutzung der Internetseite entstehen, sowie für Entscheidungen, die auf Basis der bereitgestellten Informationen und Optimierungsempfehlungen getroffen werden, und deren Folgen wird jegliche Haftung ausgeschlossen.<br>
        <br>
        © 2019 Christoph Pahmeyer. Alle Rechte vorbehalten.
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
  .copy p {
    font-family: Inter;
    font-weigth: 300;
  }
}
</style>
