class CreatePlaces < ActiveRecord::Migration
  def change
    create_table :places do |t|
      t.string :name
      t.integer :category
      t.string :description
      t.point :coordinates, :srid => 4326, :with_z => false 
      
      t.timestamps
    end
    
    add_index :places, [:category, :name], :unique => true, :name => "uniqueness_places_idx"
    
  end
end
