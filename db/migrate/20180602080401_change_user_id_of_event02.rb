class ChangeUserIdOfEvent02 < ActiveRecord::Migration[5.1]
  def change
    change_column_null :events, :users_id, false
  end
end
