const fs = require('fs')

let p = './lib'
let idx = process.argv.indexOf('--d')
if (idx !== -1) {
  p = process.argv[idx + 1]
}
fs.cp('./dist/ElFormAuto.umd.js', p + '/ElFormAuto.umd.js', (err) => {
  if (err) {
    console.error(err)
  }
})

fs.cp('./dist/ElFormAuto.umd.min.js', p + '/ElFormAuto.umd.min.js', (err) => {
  if (err) {
    console.error(err)
  }
})

console.log('finish!')
