class TripController < ApplicationController

	def index
		render json: Trip.all
	end

	def create
		# Length of url, 52521875 possible Url for a length of 5
		url_length = 5

		def gen_url(length)
			rand(36**length).to_s(36)
		end

		def url_exist?(url)
			if !!Trip.find_by(edit_url: url) || !!Trip.find_by(disp_url: url)
				return true
			else 
				return false
			end
		end

		edit_url = gen_url(url_length)

		while url_exist?(edit_url) do 
			puts "same edit_url found on #{edit_url}"
			edit_url = gen_url(url_length)
		end

		disp_url = gen_url(url_length)

		while url_exist?(disp_url) do 
			puts "same disp_url found on #{disp_url}"
			disp_url = gen_url(url_length)
		end

		new_trip = Trip.create(edit_url: edit_url, disp_url: disp_url)

		render json: new_trip
	end

	def stop
		# use this to get a timestamp
		# render json: Trip.find_by(id: params[:trip_id]).stop.first.arrived_at.to_datetime.to_i
		# use this to get all the stop from a trip
		render json: Trip.find_by(id: params[:trip_id]).stops.order(:arrived_at)
	end

	def add_stop
		new_stop = Stop.create(
								trip_id: params[:trip_id],
								name: params[:name],
								lat: params[:lat],
								lng: params[:lng],
								arrived_at: params[:arrived_at]
								)
		puts "new stop created "
		puts new_stop

		render json: new_stop
	end
end