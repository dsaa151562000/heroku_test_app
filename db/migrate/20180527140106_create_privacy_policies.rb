class CreatePrivacyPolicies < ActiveRecord::Migration[5.1]
  def change
    create_table :privacy_policies do |t|

      t.timestamps
    end
  end
end
