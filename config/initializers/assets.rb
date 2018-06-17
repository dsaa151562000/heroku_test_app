# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
# Add Yarn node_modules folder to the asset load path.
Rails.application.config.assets.paths << Rails.root.join('node_modules')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
# Rails.application.config.assets.precompile += %w( admin.js admin.css )
Rails.application.config.assets.precompile += %w( semantic.min.css )
Rails.application.config.assets.precompile += %w( rtl.css )
Rails.application.config.assets.precompile += %w( smartphoto.min.css )
Rails.application.config.assets.precompile += %w( docs.css )

Rails.application.config.assets.precompile += %w( less.min.js )
Rails.application.config.assets.precompile += %w( docs.js )
Rails.application.config.assets.precompile += %w( semantic.min.js )

Rails.application.config.assets.precompile += %w( tablesort.min.js )
Rails.application.config.assets.precompile += %w( tab.js )
Rails.application.config.assets.precompile += %w( sinon.js )
Rails.application.config.assets.precompile += %w( smartphoto.min.js )
Rails.application.config.assets.precompile += %w( underscore.min.js )
Rails.application.config.assets.precompile += %w( history.min.js )
Rails.application.config.assets.precompile += %w( highlight.min.js )
Rails.application.config.assets.precompile += %w( easing.min.js )
Rails.application.config.assets.precompile += %w( cookie.min.js )
Rails.application.config.assets.precompile += %w( clipboard.min.js )
Rails.application.config.assets.precompile += %w( jquery.min.js )
Rails.application.config.assets.precompile += %w( tablesort.min.js )
Rails.application.config.assets.precompile += %w( detect.min.js )