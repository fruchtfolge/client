export const cropLabourReq = {
  type: 'line',
  data: {
    datasets: [{
      yAxisID: 'A',
      backgroundColor: "rgba(121, 173, 151, 0.3)",
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
    dragData: true,
    dragDataRound: 1,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        id: 'A',
        type: 'linear',
        position: 'left',
        ticks: {
          min: 0,
          beginAtZero: true
        }
      }]
    }
  }
}

export default cropLabourReq;
