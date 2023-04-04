const fs = require('fs')

function copy (source, dest) {
  console.log(`copy '${source}' to '${dest}'`)
  fs.cp(source, dest, (err) => {
    if (err) {
      console.error(err)
    }
  })
}

let p = '.'
let idx = process.argv.indexOf('--d')
if (idx !== -1) {
  p = process.argv[idx + 1]
  copy('./package.json', p + '/package.json')
}
copy('./dist/LeAutoForm.umd.js', p + '/lib/LeAutoForm.umd.js')
copy('./dist/LeAutoForm.umd.min.js', p + '/lib/LeAutoForm.umd.min.js')

console.log('finish!')
