class EventsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_event, only: [:show, :edit, :update, :destroy]

  def index
    @events = Event.all
  end

  def show
    @comment = Comment.new
  end

  def new
    #binding.pry
    @event = Event.new
    @user = current_user
  end

  def edit
  end

  def create
    #binding.pry

    @event = Event.new(event_params)
    #@event.users_id = current_user.id   #変更
    # @event.name = params[:event][:neme]
    # @event.content = params[:event][:content]
    respond_to do |format|
      if @event.save
        format.html { redirect_to @event, notice: 'Event was successfully created.' }
        format.json { render :show, status: :created, location: @event }
      else
        format.html { render :new }
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end


  def update
    respond_to do |format|
      if @event.update(event_params)
        format.html { redirect_to @event, notice: 'Event was successfully updated.' }
        format.json { render :show, status: :ok, location: @event }
      else
        format.html { render :edit }
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end


  def destroy
    @event.destroy
    respond_to do |format|
      format.html { redirect_to event_index_url, notice: 'Event was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
  def set_event
    @event = Event.find(params[:id])
    @user = current_user
  end

  def event_params
    #binding.pry

    @user = current_user
    params.require(:event).permit(:name, :content, :users_id).merge(users_id: @user.id)
  end
end
