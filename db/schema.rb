# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20141003174618) do

  create_table "cards", force: true do |t|
    t.integer  "card_count"
    t.integer  "multiverseid"
    t.integer  "deck_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "cards", ["deck_id"], name: "index_cards_on_deck_id"

  create_table "decks", force: true do |t|
    t.string   "name"
    t.string   "expansion"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
