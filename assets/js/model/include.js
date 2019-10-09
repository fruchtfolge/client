/* eslint camelcase: 0 */
import cultures from '~/assets/js/cultures'
import helpers from '~/assets/js/model/helpers'

export default function createInclude(properties) {
  let include = `* -------------------------------
* Fruchtfolge Model - Include file
* Institute for Food an Resource Economics
* University of Bonn
* (c) Christoph Pahmeyer, ${helpers.getYear()}
* -------------------------------

* Static data
set grossMarginAttr / price,yield,directCosts,variableCosts,fixCosts,grossMargin,revenue,distanceCosts,croppingFactor,yieldCap /;
set plotAttr / size,distance,quality,humusContent /;
set cropAttr / rotBreak, maxShare, minSoilQuality, efaFactor, catchCropAfter, season, duevYieldLvl, nRequirement, nMaxAddition, nMinSubtraction, prevCropEff, pWithdraw, pHarvestLeft, hnv/;
set cropType / catchCrop, Blattfrucht, Halmfrucht /;
set symbol / lt,gt /;
set soilTypes /
"Reinsande (ss)"
"Lehmsande (ls)"
"Schluffsande (us)"
"Sandlehme (sl)"
"Normallehme (ll)"
"Tonlehme (tl)"
"Lehmschluffe (lu)"
"Tonschluffe (tu)"
"Schlufftone (ut)"
"Moore (mo)"
"Watt"
"Siedlung"
"Abbauflächen"
"Gewässer"
/;

set humusContents /
'1 - <2%'
'2 - <3%'
'3 - <4%'
'4 - <6%'
'6 - <8%'
'8 - <11,5%'
'11,5 - <15%'
'15 - <30%'
'≥30%'
/;
set months /jan,feb,mrz,apr,mai,jun,jul,aug,sep,okt,nov,dez/;
set halfMonths / jan1,jan2,feb1,feb2,MRZ1,MRZ2,apr1,apr2,mai1,mai2,jun1,jun2,jul1,jul2,aug1,aug2,sep1,sep2,okt1,okt2,nov1,nov2,dez1,dez2 /;
set months_halfMonths(months,halfMonths) /
jan.jan1 YES
jan.jan2 YES
feb.feb1 YES
feb.feb2 YES
mrz.MRZ1 YES
mrz.MRZ2 YES
apr.apr1 YES
apr.apr2 YES
mai.mai1 YES
mai.mai2 YES
jun.jun1 YES
jun.jun2 YES
jul.jul1 YES
jul.jul2 YES
aug.aug1 YES
aug.aug2 YES
sep.sep1 YES
sep.sep2 YES
okt.okt1 YES
okt.okt2 YES
nov.nov1 YES
nov.nov2 YES
dez.dez1 YES
dez.dez2 YES
/;

set years / 2001*2030 /;
$onempty
set curYear(years) / ${properties.curYear} /;
`

  // create plot related data
  const curPlots = []

  const p_plotData = []
  const plots_soilTypes = []
  const plots_humusContent = []
  const plots_rootCropCap = []
  const plots_permPast = []
  const plots_duevEndangered = []
  const plots_excludedCrops = []

  properties.curPlots.forEach(plot => {
    curPlots.push(` '${plot._id}'`)
    p_plotData.push(
      ` '${plot._id}'.size ${plot.size}\n '${plot._id}'.distance ${_.round(
        plot.distance,
        2
      )}\n '${plot._id}'.quality ${plot.quality || 0}`
    )
    plots_humusContent.push(` '${plot._id}'.'${plot.humusContent}'`)
    plots_soilTypes.push(` '${plot._id}'.'${plot.soilType}'`)
    if (plot.rootCrops) {
      plots_rootCropCap.push(` '${plot._id}' 'YES'`)
    }
    if (plot.permPast) {
      plots_permPast.push(` '${plot._id}' 'YES'`)
    }
    if (plot.duevEndangered) {
      plots_duevEndangered.push(` '${plot._id}' 'YES'`)
    }
    if (plot.excludedCrops && plot.excludedCrops.length > 0) {
      plot.excludedCrops.forEach(crop => {
        plots_excludedCrops.push(` '${plot._id}'.'${crop}' 'YES'`)
      })
    }
  })

  // create crop related data
  const curCrops = [` ''`]
  const permPastCrops = [` ''`]
  const cropGroup = [` ''`]
  const crops_cropGroup = [` ''.''`]
  const p_cropData = []
  const p_nmin = []
  const p_avgYield = []
  const crops_cropType = []
  const crops_rootCrop = []
  const crops_catchCrop = []
  const crops_summer = []
  const croppingFactor = []
  const laborReq = []
  const halfMonths = [
    'JAN1',
    'JAN2',
    'FEB1',
    'FEB2',
    'MRZ1',
    'MRZ2',
    'APR1',
    'APR2',
    'MAI1',
    'MAI2',
    'JUN1',
    'JUN2',
    'JUL1',
    'JUL2',
    'AUG1',
    'AUG2',
    'SEP1',
    'SEP2',
    'OKT1',
    'OKT2',
    'NOV1',
    'NOV2',
    'DEZ1',
    'DEZ2'
  ]
  const permPastCropCodes = [459, 480, 492, 57, 567, 572, 592, 972]

  function createCropPropertyString(crop) {
    let props = [
      'rotBreak',
      'maxShare',
      'minSoilQuality',
      'efaFactor',
      'duevYieldLvl',
      'nRequirement',
      'nMaxAddition',
      'nMinSubtraction',
      'prevCropEff',
      'pWithdraw',
      'pHarvestLeft',
      'hnv'
    ]
    props = props.map(prop => {
      if (!crop[prop]) crop[prop] = 0
      return `'${crop.name}'.${prop} ${crop[prop]}`
    })
    props = props.join('\n')
    return props
  }

  properties.curCrops.forEach(crop => {
    if (!crop) return
    // add crop group if it doesn't exist yet
    if (cropGroup.indexOf(` '${crop.cropGroup}'`) === -1) {
      cropGroup.push(` '${crop.cropGroup}'`)
    }
    // add link between crop and crop group
    crops_cropGroup.push(` '${crop.name}'.'${crop.cropGroup}'`)
    p_avgYield.push(
      ` '${crop.name}' ${helpers.avgYield(crop.name, properties)}`
    )
    crops_cropType.push(` '${crop.name}'.'${crop.cropType}'`)
    // add current crop to possible list of crops
    curCrops.push(` '${crop.name}'`)
    // declare crop as a permanent pasture crop if within the range of
    // pasture crops
    if (permPastCropCodes.indexOf(crop.code) > -1) {
      permPastCrops.push(` '${crop.name}'`)
    }
    // add all crop properties to p_cropData parameter
    p_cropData.push(createCropPropertyString(crop))
    console.log(crop)
    p_nmin.push(
      Object.keys(crop.nminDefault)
        .map(soil => {
          return Object.keys(crop.nminDefault[soil])
            .map(cropType => {
              return ` '${crop.name}'.'${soil}'.'${cropType}' ${
                crop.nminDefault[soil][cropType]
              }`
            })
            .join('\n')
        })
        .join('\n')
    )
    if (crop.rootCrop) {
      crops_rootCrop.push(` '${crop.name}' YES`)
    }
    if (crop.catchCropAfter) {
      crops_catchCrop.push(` '${crop.name}' YES`)
    }
    if (crop.season === 'Sommer') {
      crops_summer.push(` '${crop.name}' YES`)
    }
    properties.curCrops.forEach(subseqCrop => {
      croppingFactor.push(
        ` '${crop.name}'.'${subseqCrop.name}' ${
          crop.subseqCrops[subseqCrop.cropGroup]
        }`
      )
    })
    halfMonths.forEach(halfMonth => {
      let steps = crop.workingSteps.filter(o => {
        return halfMonth === o.month
      })
      if (steps && steps.length > 0) {
        steps = steps.map(step => {
          return _.sumBy(step.steps, 'time')
        })
        const time = _.sum(steps)
        laborReq.push(` '${crop.name}'.${halfMonth} ${_.round(time, 2)}`)
      }
    })
  })

  // create gross margin related data
  const crops = [` ''`]
  const p_grossMarginData = []
  const p_catchCropCosts = []

  properties.crops.forEach(crop => {
    if (crops.indexOf(` '${crop.name}'`) === -1) crops.push(` '${crop.name}'`)
  })

  properties.curPlots.forEach(plot => {
    p_catchCropCosts.push(` '${plot._id}' ${plot.matrix.catchCropCosts}`)
    properties.curCrops.forEach(crop => {
      crop = plot.matrix[properties.curYear][crop.name]
      // make sure there only is a gross margin for a plot if the rotational break is held
      // and the crop is set to active
      if (crop.rotBreakHeld && crop.active) {
        p_grossMarginData.push(
          ` '${plot._id}'.'${crop.name}' ${crop.grossMargin}`
        )
      }
    })
  })

  // create plot & crop related data
  const plots = []
  const plots_years_cropGroup = []

  properties.curPlots.forEach(plot => {
    // get all previous crops for that plot
    if (plots.indexOf(` '${plot._id}'`) === -1) plots.push(` '${plot._id}'`)
    const prev = properties.plots.filter(p => {
      return p.flik === plot.flik
    })
    if (prev.length) {
      prev.forEach(prevPlot => {
        // add crop name to crops set if it isn't present
        const cropGroupName = cultures[prevPlot.crop]
          ? cultures[prevPlot.crop].cropGroup
          : ''
        if (cropGroup.indexOf(` '${cropGroupName}'`) === -1)
          cropGroup.push(` '${cropGroupName}'`)
        plots_years_cropGroup.push(
          ` '${plot._id}'.${prevPlot.year}.'${cropGroupName}' 'YES'`
        )
      })
    }
  })

  // constraints related data
  const constraints = []
  const p_constraint = []
  const constraints_lt = []

  if (properties.curConstraints) {
    properties.curConstraints.forEach(constraint => {
      constraints.push(
        ` '${constraint.name} ${constraint.operator} ${constraint.area}ha'`
      )
      p_constraint.push(
        ` '${constraint.name} ${constraint.operator} ${constraint.area}ha'.'${
          constraint.crop1
        }'.${constraint.crop2 ? constraint.crop2 : '""'} ${constraint.area}`
      )
      if (constraint.operator === '<')
        constraints_lt.push(
          ` '${constraint.name} ${constraint.operator} ${
            constraint.area
          }ha'.lt YES`
        )
    })
  }

  // labour constraints
  const p_availLabour = []
  const p_availFieldWorkDays = []
  const months = [
    'jan',
    'feb',
    'mrz',
    'apr',
    'mai',
    'jun',
    'jul',
    'aug',
    'sep',
    'okt',
    'nov',
    'dez'
  ]

  if (properties.curTimeConstraints) {
    months.forEach((month, i) => {
      p_availLabour.push(
        ` ${month} ${properties.curTimeConstraints.data.datasets[0].data[i]}`
      )
      p_availFieldWorkDays.push(
        ` ${month} ${properties.curTimeConstraints.data.datasets[1].data[i]}`
      )
    })
  }

  // build include file
  include += helpers.save('set plots', plots)
  include += helpers.save('set curPlots(plots)', curPlots)
  include += helpers.save('parameter p_plotData(curPlots,plotAttr)', p_plotData)
  include += helpers.save(
    'set plots_soilTypes(curPlots,soilTypes)',
    plots_soilTypes
  )
  include += helpers.save(
    'set plots_humusContent(curPlots,humusContents)',
    plots_humusContent
  )
  include += helpers.save('set plots_rootCropCap(curPlots)', plots_rootCropCap)
  include += helpers.save('set plots_permPast(curPlots)', plots_permPast)
  include += helpers.save(
    'set plots_duevEndangered(curPlots)',
    plots_duevEndangered
  )
  /* include += helpers.save(
    'set plots_excludedCrops(curPlots,crops)',
    plots_excludedCrops
  ) */

  include += helpers.save('set crops', crops)
  include += helpers.save('set curCrops(crops)', curCrops)
  include += helpers.save('set permPastCrops(curCrops)', permPastCrops)
  include += helpers.save('set cropGroup', cropGroup)
  include += helpers.save(
    'set crops_cropGroup(curCrops,cropGroup)',
    crops_cropGroup
  )
  include += helpers.save(
    'set crops_cropType(curCrops,cropType)',
    crops_cropType
  )
  include += helpers.save('parameter p_cropData(curCrops,cropAttr)', p_cropData)
  include += helpers.save('parameter p_avgYield(curCrops)', p_avgYield)
  include += helpers.save(
    'parameter p_nmin(curCrops,soilTypes,cropType)',
    p_nmin
  )
  include += helpers.save('set crops_rootCrop(curCrops)', crops_rootCrop)
  include += helpers.save('set crops_catchCrop(curCrops)', crops_catchCrop)
  include += helpers.save('set crops_summer(curCrops)', crops_summer)
  include += helpers.save(
    'parameter p_croppingFactor(curCrops,curCrops)',
    croppingFactor
  )

  include += helpers.save(
    'set plots_years_cropGroup(plots,years,cropGroup)',
    plots_years_cropGroup
  )
  include += helpers.save(
    'parameter p_grossMarginData(curPlots,curCrops)',
    p_grossMarginData
  )
  include += helpers.save(
    'parameter p_catchCropCosts(curPlots)',
    p_catchCropCosts
  )
  include += helpers.save('parameter p_laborReq(crops,halfMonths)', laborReq)
  if (constraints.length) {
    include += helpers.save('set constraints', constraints)
    include += helpers.save(
      'parameter p_constraint(constraints,curCrops,curCrops)',
      p_constraint
    )
    include += helpers.save(
      'set constraints_lt(constraints,symbol)',
      constraints_lt
    )
  }
  if (p_availLabour.length) {
    include += helpers.save('parameter p_availLabour(months)', p_availLabour)
    include += helpers.save(
      'parameter p_availFieldWorkDays(months)',
      p_availFieldWorkDays
    )
  }

  // load base model from fruchtfolge-model
  const base = require('fruchtfolge-model')
  console.log(include)
  return include.concat(base)
}