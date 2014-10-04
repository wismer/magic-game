class DecksController < ApplicationController
  def index
    @decks = Deck.all
  end

  def create
    @deck = Deck.create(deck_params)
    params['cards'].each_with_index do |i,c|
      @deck.cards << Card.create(card_params(c))
    end

    render "index"
  end

  def show
    @deck = Deck.find(params[:id])
  end

  def cards
    @deck = Deck.find(params[:deck_id])
    render json: @deck.cards.to_json
    # @deck.to_json
  end

  private
    def deck_params
      params.require(:deck).permit(:name, :expansion)
    end

    def card_params(i)
      params.require(:cards)[i].permit(:multiverseid, :card_count)
    end
end
