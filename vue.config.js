module.exports = {
  publicPath: './',
  outputDir: './dist',
  // 默认情况下，生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存。如果你无法使用 Vue CLI 生成的 index HTML，你可以通过将这个选项设为 false 来关闭文件名哈希。
  filenameHashing: true,
  // 生产环境 sourceMap
  productionSourceMap: false,
  // 强制lib不生成独立css文件
  css: { extract: false },
}
