class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :articles, dependent: :destroy, foreign_key: 'users_id'  # foreign_keyを追記
  has_many :events, dependent: :destroy, foreign_key: 'users_id'  # foreign_keyを追記
  has_many :addresses, dependent: :destroy, foreign_key: 'users_id'  # foreign_keyを追記

  accepts_nested_attributes_for :addresses
end
