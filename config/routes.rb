Rails.application.routes.draw do
  get 'comments/create'

  get 'comments/destroy'

  devise_for :users

  devise_scope :user do
    get '/users/sign_out' => 'devise/sessions#destroy'
  end
  resources :news
  resources :energies
  resources :houses do
    member do
      get 'EnergyProduction_2011' => 'houses#EnergyProduction_2011'
      get 'EnergyProduction_2012' => 'houses#EnergyProduction_2012'
      get 'EnergyProduction_2013' => 'houses#EnergyProduction_2013'
    end
  end

  root 'events#index'

  resources :articles do
    resources :comments
  end

  resources :events do
    resources :comments
  end

  namespace :customer do
    namespace :webview do
      namespace :external do
        namespace :v1 do
          resources :restaurants, only: %w[show]
        end
      end
    end
  end
#
end
