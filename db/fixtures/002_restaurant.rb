# frozen_string_literal: true

Restaurant.seed do |restaurant|
  restaurant.id = 1
  restaurant.name = "restaurant_01"
  restaurant.name_kana = "restaurant_kana_01"
  restaurant.tel = "090" + "1" * 8
  restaurant.zipcode = "1510053"
  restaurant.address = "restaurant_住所_01"
  restaurant.business_start_time = "11:00"
  restaurant.business_end_time = "21:00"
end

Restaurant.seed do |restaurant|
  restaurant.id = 2
  restaurant.name = "restaurant_02"
  restaurant.name_kana = "restaurant_kana_02"
  restaurant.tel = "090" + "2" * 8
  restaurant.zipcode = "1620052"
  restaurant.address = "restaurant_住所_02"
  restaurant.business_start_time = "9:30"
  restaurant.business_end_time = "23:45"
end

Restaurant.seed do |restaurant|
  restaurant.id = 3
  restaurant.name = "restaurant_03"
  restaurant.name_kana = "restaurant_kana_03"
  restaurant.tel = "090" + "3" * 8
  restaurant.zipcode = "1500002"
  restaurant.address = "restaurant_住所_03"
  restaurant.business_start_time = "11:30"
  restaurant.business_end_time = "23:00"
end

Restaurant.seed do |restaurant|
  restaurant.id = 4
  restaurant.name = "restaurant_04"
  restaurant.name_kana = "restaurant_kana_04"
  restaurant.tel = "090" + "4" * 8
  restaurant.zipcode = "1510051"
  restaurant.address = "restaurant_住所_04"
  restaurant.business_start_time = "5:00"
  restaurant.business_end_time = "22:15"
end

Restaurant.seed do |restaurant|
  restaurant.id = 5
  restaurant.name = "restaurant_05"
  restaurant.name_kana = "restaurant_kana_05"
  restaurant.tel = "090" + "5" * 8
  restaurant.zipcode = "1500013"
  restaurant.address = "restaurant_住所_05"
  restaurant.business_start_time = "6:30"
  restaurant.business_end_time = "19:45"
end
