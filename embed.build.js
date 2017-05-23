({
  baseUrl: ".",
  mainConfigFile: "config.js",
  name: "bower_components/almond/almond", // assumes a production build using almond
  include: ['embed'],
  out: "example/widget/embed.min.js",
  optimizeCss: "standard",
  stubModules: ['rv', 'amd-loader', 'text']
})
