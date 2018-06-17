class Customer::Webview::External::V1::RestaurantsController < ApplicationController
  before_action :set_restaurant

  def show
  end

  private

  def set_restaurant
    @restaurant = Restaurant.find(params[:id])
  end
end
