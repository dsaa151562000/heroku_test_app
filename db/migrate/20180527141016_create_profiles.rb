class CreateProfiles < ActiveRecord::Migration[5.1]
  def change
    create_table :profiles do |t|
      t.references :profilable, polymorphic: true, index: true
      t.string :disription

      t.timestamps
    end
  end
end
