class TermsOfService < ApplicationRecord
  has_one :profile, :as => :profilable
  bindding.pry
end
