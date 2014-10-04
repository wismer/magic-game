class CreateCards < ActiveRecord::Migration
  def change
    create_table :cards do |t|
      t.integer :card_count
      t.integer :multiverseid
      t.references :deck, index: true

      t.timestamps
    end
  end
end
