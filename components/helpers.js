function sanitizeInput(input) {
  // first try and replace commas with points
  input = input.replace(/,/g, '.')
  // if there is more than one point, remove the first one
  if (input.match(/\./g) && input.match(/\./g).length > 1) {
    input = input.replace('.', '')
  }
  // now parse the resulting string
  input = Number(input)
  if (isNaN(input)) throw new Error('Input not parsable')
  return input
}

export { sanitizeInput }
