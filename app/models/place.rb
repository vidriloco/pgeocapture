class Place < ActiveRecord::Base
  include Shared::Categories
  
  attr_accessible :category, :description, :name, :coordinates
  validates_presence_of :category, :name
  validate :coordinates_are_set
  validate :poi_is_unique, :on => :create
    
  def self.categories
    { 0 => :school, 1 => :faculty, 2 => :institute, 3 => :library, 4 => :museum, 5 => :sport_center, 6 => :food_store, 7 => :restaurant, 8 => :laboratory, 9 => :pumabus_stop, 10 => :bicipuma_station, 11 => :open_space}
  end
  
  def humanized_category
    Place.humanized_category_for(:categories, self.category)
  end
  
  def humanized_description
    description.blank? ? I18n.t('views.places.attributes.extra.description.not_given') : description
  end
  
  def humanized_coordinates
    "#{I18n.t('views.places.attributes.extra.lat')}: #{coordinates.lat}, #{I18n.t('views.places.attributes.extra.lon')} #{coordinates.lon}"
  end
  
  def lat
    coordinates == nil ? nil : coordinates.lat
  end
  
  def lon
    coordinates == nil ? nil : coordinates.lon
  end
  
  def to_plist_node
    hash={}
    %w(id name lat lon category).each do |item|
      hash[item] = self.send(item)
    end
    hash.to_plist(false)
  end
  
  def apply_geo(coordinates)
    return self if coordinates.nil? || (coordinates["lon"].blank? || coordinates["lat"].blank?)
    self.coordinates = Point.from_lon_lat(coordinates["lon"].to_f, coordinates["lat"].to_f, 4326)
    self
  end
  
  private
  def coordinates_are_set
    errors.add(:coordinates, I18n.t('custom_validations.places.coordinates_missing')) if self.coordinates.nil?
  end
  
  def poi_is_unique
    previous = Place.first(:conditions => {:category => category, :name => name})
    errors.add(:coordinates, I18n.t('custom_validations.places.not_unique')) unless previous.nil?
  end

end
