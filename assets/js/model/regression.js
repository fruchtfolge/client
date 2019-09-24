export default {
  data: {
    '2191': {
      costs: [
        10.8464021579,
        -0.2571372922,
        0.0036732253,
        0.0835793605,
        -0.0012077149,
        -0.0005313325,
        1.4463567136,
        -0.0179797053,
        0.1033905317,
        0.0012179714
      ],
      time: [
        0.2817579635,
        -0.0075026925,
        0.000320235,
        0.0073527627,
        -0.0005641974,
        0.0003622113,
        0.0591117942,
        -0.0032054331,
        0.004333962,
        -0.0009215207
      ]
    }
  },
  predict(machine, type, size, distance, amount) {
    const coeff = this.data[machine][type]
    return (
      coeff[0] +
      coeff[1] * size +
      coeff[2] * Math.pow(size, 2) +
      coeff[3] * distance +
      coeff[4] * size * distance +
      coeff[5] * Math.pow(distance, 2) +
      coeff[6] * amount +
      coeff[7] * size * amount +
      coeff[8] * distance * amount +
      coeff[9] * Math.pow(amount, 2)
    )
  }
}
