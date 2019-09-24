export default {
  getYear() {
    const date = new Date()
    return date.getFullYear()
  },
  save(string, arr) {
    // remove potential duplicates from array
    arr = _.uniq(arr)
    return `${string} /\n${arr.join('\n')}\n/;\n\n`
  },
  getMedianYieldCap(plots) {
    if (plots.length === 1) return _.round(plots[0].quality)
    // disregard plots with a SQR of 0
    const sqrs = plots
      .filter(plot => {
        return plot.quality && !isNaN(plot.quality) && plot.quality > 0
      })
      .map(plot => {
        return plot.quality
      })
    const sorted = sqrs.slice().sort()
    const middle = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
      return _.round((sorted[middle - 1] + sorted[middle]) / 2, 2)
    }

    return _.round(sorted[middle], 2)
  },
  getCropFactAndRotBreak(curPlot, crops, plots, curCrop) {
    let croppingFactor = 1
    let rotBreakHeld = true
    // get previous crops grown on the plot
    const plotPrevYears = plots.filter(plot => {
      return plot.id === curPlot.id && plot.year < curPlot.year
    })
    if (plotPrevYears.length > 0) {
      // check if rotational break for crop is sufficient
      const sortedPlots = _.sortBy(plotPrevYears, ['year'])
      sortedPlots.forEach((plotYear, i) => {
        if (
          plotYear.year > curPlot.year - curCrop.rotBreak &&
          plotYear.crop === curCrop.code
        )
          rotBreakHeld = false
        // calculate rotational value of previous crop / current crop combination
        // however, adjust over time -> last years crop has greatest impact
        // impact is exponentially decreasing over time
        // we calculate the exponential moving average of the cropping factors
        const plotYearCrop = _.find(crops, {
          code: plotYear.crop,
          year: plotYear.year + 1
        })
        if (i === sortedPlots.length - 1 && plotYearCrop) {
          croppingFactor = plotYearCrop.subseqCrops[curCrop.cropGroup]
          // if cropping factor is 0 (crop can't be grown), then the yield is 0
          if (croppingFactor === 0) croppingFactor = 0
          // if cropping factor is smaller than 8, yield is linearly declining to 40%
          else if (croppingFactor < 8)
            croppingFactor = 0.9 + (croppingFactor - 7) * 0.083
          // if croppingFactor is equal to 8, the yield is expected to be 100%
          else if (croppingFactor === 8) croppingFactor = 1
          // if cropping factor is greater than 8, the yield is linearly growing to 110%
          else if (croppingFactor > 8)
            croppingFactor = 1.1 + ((croppingFactor - 10) / 2) * 0.1
        } else if (i > 0) {
          // const prevCrop = sortedPlots[i-1].crop
          // const cropData = _.find(crops, {code: prevCrop, year: sortedPlots[i-1].year})
          // let prevFactor = cropData.subseqCrops[plotYearCrop.cropGroup]
          // prevFactor = prevFactor / (curPlot.year - plotYear.year) ** 2
        }
      })
    }
    return [croppingFactor, rotBreakHeld]
  },
  calculateDistanceCosts(curPlot, cropYield) {
    if (cropYield > 100) cropYield = 100
    const value = cropYield * (0.2915 * Math.abs(curPlot.distance - 2) + 1.4287)
    if (curPlot.distance > 2) return value
    return value * -1
  },
  humusContent(content) {
    if (
      !content ||
      content === '1 - <2%' ||
      content === '2 - <3%' ||
      content === '3 - <4%' ||
      content === 'Siedlungen' ||
      content === 'nicht bestimmt'
    ) {
      return 0
    } else {
      return -20
    }
  },
  nmin(plot, crop, prevCrop) {
    if ((!prevCrop && !plot.catchCrop) || !plot.soilType) return 0
    let type = ''
    if (plot.catchCrop) type = 'catchCrop'
    else type = prevCrop.cropType
    return Number(crop.nminDefault[plot.soilType][type]) * -1
  },
  nYieldDiff(avgYield, duevYield, crop) {
    let deviation = 0
    if (avgYield) {
      deviation = avgYield - duevYield
    }
    if (deviation >= 0) {
      return _.round(crop.nMaxAddition * deviation, 1)
    } else {
      return _.round(crop.nMinSubtraction * deviation, 1)
    }
  },
  catchCropCosts(plot) {
    const value = _.round(
      (0.2850553506 * plot.distance - 0.6666666667 * plot.size + 113) *
        plot.size,
      2
    )
    return value
  },
  avgYield(name, store) {
    // find object for crop of last 3 years
    const data = store.crops.filter(c => {
      return (
        c.year >= store.curYear - 3 &&
        c.scenario === store.curScenario &&
        c.name === name
      )
    })
    if (data) {
      const yieldSum = _.sum(
        data.map(d => {
          return _.sumBy(d.contributionMargin.revenues, o => {
            return o.amount.value
          })
        })
      )
      return _.round(yieldSum / data.length, 1) * 10
    }
  }
}
