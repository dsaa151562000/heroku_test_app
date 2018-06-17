class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :basic_authentication unless Rails.env.development?


  private

  def basic_authentication
    authenticate_or_request_with_http_basic do |user, pass|
      user == 'aaaaaa' && pass == 'bbbbbb'
    end
  end
end
