export const planetChartData = {
  type: 'line',
  data: {
    labels: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    datasets: [
      {
        label: 'Verfügbare Arbeitszeit',
        data: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400],
        yAxisID: 'A',
        pointBackgroundColor: "rgb(74,109,124)",
        borderColor: "rgb(74,109,124)",
        borderWidth: 5,
        radius: 8,
        pointHoverRadius: 9,
        pointHitRadius: 25
      },
      {
        label: 'Verfügbare Feldarbeitstage',
        data: [0, 0, 3, 17, 21, 21, 22, 22, 23, 19, 9, 0],
        yAxisID: 'B',
        pointBackgroundColor: "rgb(121, 173, 151)",
        borderColor: "rgb(121, 173, 151)",
        borderWidth: 5,
        radius: 8,
        pointHoverRadius: 9,
        pointHitRadius: 25
      }
    ]
  },
  options: {
    responsive: true,
    //lineTension: 1,
    dragData: true,
    dragDataRound: 0,
    scales: {
      yAxes: [{
        id: 'A',
        beginAtZero: true,
        padding: 25,
        type: 'linear',
        position: 'left',
        ticks: {
          min: 0,
          max: 2000
        }
      },
      {
        id: 'B',
        beginAtZero: true,
        type: 'linear',
        position: 'right',
        padding: 25,
        ticks: {
          min: 0,
          max: 31
        }
      }]
    }
  }
}

export default planetChartData;
