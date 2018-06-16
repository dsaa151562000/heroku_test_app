Rails.application.routes.draw do
  get 'comments/create'

  get 'comments/destroy'

  devise_for :users
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

end
