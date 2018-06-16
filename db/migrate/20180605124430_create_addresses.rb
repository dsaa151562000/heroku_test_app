class CreateAddresses < ActiveRecord::Migration[5.1]
  def change
    create_table :addresses do |t|
      t.string :zipcode
      t.string :city
      t.string :street
      t.string :tel
      t.integer :user_id

      t.timestamps
    end
  end
end
