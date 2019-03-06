task :serve do
  sh 'jekyll serve -H 0.0.0.0 --watch --force-polling'
end

task :prepare_assets do
  js_assets = %w(chart.js/dist/Chart.min.js pixi.js/dist/pixi.min.js)
  style_assets = %w(bulma)

  root = Dir.pwd
  vendor_path = "#{root}/vendor".freeze
  node_modules = "#{root}/node_modules".freeze

  FileUtils.rm_r(vendor_path, force: true)

  FileUtils.mkdir(vendor_path)
  FileUtils.mkdir("#{vendor_path}/js")
  FileUtils.mkdir("#{vendor_path}/css")

  js_assets.each do |asset|
    FileUtils.cp_r("#{node_modules}/#{asset}", "#{vendor_path}/js")
  end

  style_assets.each do |asset|
    FileUtils.cp_r("#{node_modules}/#{asset}", "#{vendor_path}/css")
  end
end

task :remove_node_modules do
  FileUtils.rm_r("#{Dir.pwd}/node_modules", force: true)
end
