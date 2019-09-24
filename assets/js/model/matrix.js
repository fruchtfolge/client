import helpers from '~/assets/js/model/helpers'

export default function buildMatrix(store) {
  const plots = store.plots
  const crops = store.crops
  const curYear = store.curYear
  const curScenario = store.curScenario
  // get median yield capacity
  const medianYieldCap = helpers.getMedianYieldCap(plots)
  // loop over all plots and create 'matrix' property where all
  // gross margin related information for the past 10 years is stored
  plots.forEach(plot => {
    plot.matrix = {}
    let yieldCap = 1
    if (plot.quality && !isNaN(plot.quality) && plot.quality !== 0) {
      yieldCap = _.round(plot.quality / medianYieldCap, 2)
    }
    const prevCrop = _.find(crops, ['name', plot[curYear - 1]])
    crops.forEach(crop => {
      // don't consider more than 10 years prior to the optimisation horizon
      if (
        crop.year < curYear - 10 ||
        crop.scenario !== curScenario
        // (crop.year === curYear && !crop.active)
      )
        return
      if (!plot.matrix[crop.year]) plot.matrix[crop.year] = {}
      const cropFactAndRotBreak = helpers.getCropFactAndRotBreak(
        plot,
        crops,
        plots,
        crop
      )
      const amount = _.round(
        _.sumBy(crop.contributionMargin.revenues, o => {
          return o.amount.value
        })
      )
      const duevEndangered =
        plot.duevEndangered && store.settings.duev2020
          ? crop.yieldRed20 / 100
          : 1
      const correctedAmount = _.round(
        amount * cropFactAndRotBreak[0] * yieldCap * duevEndangered,
        2
      )
      let price
      if (amount > 0) {
        price = _.round(
          _.sumBy(crop.contributionMargin.revenues, o => {
            return o.total.value
          }) / amount,
          2
        )
      } else {
        price = _.round(
          _.sumBy(crop.contributionMargin.revenues, o => {
            return o.total.value
          }),
          2
        )
      }
      const revenueNoCropEff = _.round(price * amount, 2)
      const revenue = _.round(price * correctedAmount, 2)
      const directCosts = _.round(
        _.sumBy(crop.contributionMargin.directCosts, o => {
          if (store.settings.duev2020 && o.name.includes('Kalkammon')) {
            return o.amount.value * 0.8 * o.price.value
          } else {
            return o.total.value
          }
        }),
        2
      )
      const variableCosts = _.round(
        _.sumBy(crop.contributionMargin.variableCosts, o => {
          return o.total.value
        }),
        2
      )
      const distanceCosts = helpers.calculateDistanceCosts(
        plot,
        correctedAmount
      )
      plot.matrix.catchCropCosts = helpers.catchCropCosts(plot)
      const data = {
        croppingFactor: cropFactAndRotBreak[0],
        yieldRed20: duevEndangered,
        rotBreakHeld: cropFactAndRotBreak[1],
        name: crop.name,
        active: crop.active,
        grown: plot.crop === crop.code,
        code: crop.code,
        yieldCap,
        amount,
        correctedAmount,
        price,
        revenue,
        directCosts,
        variableCosts,
        distanceCosts,
        grossMarginNoCropEff: _.round(
          revenueNoCropEff - directCosts - variableCosts - distanceCosts,
          2
        ),
        grossMarginHa: _.round(
          revenue - directCosts - variableCosts - distanceCosts,
          2
        ),
        grossMargin: _.round(
          (revenue - directCosts - variableCosts - distanceCosts) * plot.size
        ),
        fixCosts: _.round(
          _.sumBy(crop.contributionMargin.fixCosts, o => {
            return o.total.value
          }),
          2
        ),
        size: plot.size,
        // fertilizer ordinance data
        avgYield: helpers.avgYield(crop.name, store)
          ? helpers.avgYield(crop.name, store)
          : crop.duevYieldLvl,
        nReq: crop.nRequirement,
        nYieldDiff: helpers.nYieldDiff(
          helpers.avgYield(crop.name, store),
          crop.duevYieldLvl,
          crop
        ),
        nMinDiff: helpers.nmin(plot, crop, prevCrop),
        humusContent: helpers.humusContent(plot.humusContent),
        nFertPrevYear: crop.nFertPrevYear ? crop.nFertPrevYear / -10 : 0,
        nPrevCrop: prevCrop ? prevCrop.prevCropEff * -1 : 0
      }
      // calculate total N-Requirement and round to 0 decimals
      data.nSum = _.round(
        data.nReq +
          data.nYieldDiff +
          data.nMinDiff +
          data.humusContent +
          data.nFertPrevYear +
          data.nPrevCrop,
        0
      )
      plot.matrix[crop.year][crop.name] = data
    })
  })
  return plots
}
