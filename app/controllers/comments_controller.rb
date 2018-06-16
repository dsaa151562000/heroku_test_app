class CommentsController < ApplicationController
  def create
    #binding.pry
    # Articleをパラメータの値から探し出し,Blogに紐づくcommentsとしてbuildします。
    if comment_params.include?(:event_id)
      @parent = Event.find(comment_params[:event_id])
    else
      @parent = Article.find(comment_params[:article_id])
    end

    #binding.pry

    #@comment = @event.comments.build(comment_params)
    #@event = @comment.event
    # クライアント要求に応じてフォーマットを変更

    respond_to do |format|
      if @parent.comments.create(content: comment_params[:content])
        format.html { redirect_to event_path(@parent), notice: 'コメントを投稿しました。' }
      else
        format.html { render :new }
      end
    end
  end

  def destroy
  end

  private
  # ストロングパラメーター
  def comment_params
    if params.include?(:event_id)
      params.require(:comment).permit(:event_id, :content)
    else
      params.require(:comment).permit(:article_id, :content)
    end
  end


end
