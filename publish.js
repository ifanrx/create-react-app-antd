const AnyFile = require('any-file')
const ftpConf = require('./ftp-pass')
const assetMap = require('./build/asset-manifest.json')
const path = require('path')

let asset = Object.keys(assetMap)
  .filter(v => !assetMap[v].match(/\.map$/))
  .map(v => assetMap[v]).concat(['index.ifanrx.html'])

Promise.all(asset.map(v => upload(v))).then(res => {
  console.log('success', res)
}).catch(e => {
  console.log(e)
})

function upload(file) {
  return new Promise((resolve, reject) => {
    let af = new AnyFile()
    let fromFile = path.join(__dirname, 'build', file)
    let toFile = `ftp://${ftpConf.username}:${ftpConf.password}@${ftpConf.server}/hydrogen/user-dash-static/${file}`
    af.from(fromFile).to(toFile, (err, res) => {
      if (err) return reject(err)
      if (res) {
        resolve(`${file} copied!`)
      } else {
        reject(new Error('File not copied!'))
      }
    })
  })
}
