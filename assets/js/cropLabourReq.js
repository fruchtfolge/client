export const cropLabourReq = {
  type: 'line',
  data: {
    datasets: [
      {
        yAxisID: 'A',
        backgroundColor: 'rgba(121, 173, 151, 0.3)',
        pointBackgroundColor: 'rgb(121, 173, 151)',
        borderColor: 'rgb(121, 173, 151)',
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
      yAxes: [
        {
          id: 'A',
          type: 'linear',
          position: 'left',
          ticks: {
            min: 0,
            beginAtZero: true
          }
        }
      ]
    },
    hover: {
      onHover: function(e) {
        const point = this.getElementAtEvent(e)
        if (point.length) e.target.style.cursor = 'grab'
        else e.target.style.cursor = 'default'
      }
    }
  }
}

export default cropLabourReq
