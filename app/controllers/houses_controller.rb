class HousesController < ApplicationController
  def index
    @houses=House.all
  end

  def show
    @show_index_flg = "1"
    @house=House.find(params[:id])
    @energies=@house.energies
    @energies_2011=@house.energies.where(year: "2011")
    @energies_2012=@house.energies.where(year: "2012")
    @energies_2013=@house.energies.where(year: "2013")
  end

  def EnergyProduction_2011
    @show_index_flg = "0"
    @house=House.find(params[:id])
    @energies=@house.energies.where(year: "2011")
    render :show
  end

  def EnergyProduction_2012
    @show_index_flg = "0"
    @house=House.find(params[:id])
    @energies=@house.energies.where(year: "2012")
    render :show
  end

  def EnergyProduction_2013
    @show_index_flg = "0"
    @house=House.find(params[:id])
    @energies=@house.energies.where(year: "2013")
    render :show
  end

end
