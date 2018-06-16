class ChangeUserIdOfArticle < ActiveRecord::Migration[5.1]
  def change
    change_column_null :articles, :users_id, false
  end
end
