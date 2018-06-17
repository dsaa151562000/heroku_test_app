class CreateRestaurants < ActiveRecord::Migration[5.1]
  def change
    create_table :restaurants do |t|
      t.string :name, null: false
      t.string :name_kana, null: false
      t.string :tel
      t.string :zipcode, null: false
      t.text :address, null: false
      t.time :business_start_time
      t.time :business_end_time

      t.timestamps
    end
  end
end
