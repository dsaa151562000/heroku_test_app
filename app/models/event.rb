class Event < ApplicationRecord
  has_many :comments, as: :commentable, dependent: :destroy
  belongs_to :user, optional: true, class_name: "User", foreign_key: "users_id"
end
