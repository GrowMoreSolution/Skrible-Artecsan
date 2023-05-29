(function () {

    'use strict';

    function controller(api, $state, auth, localStorageService, $rootScope, SweetAlert, restaurant, core) {

        // if (!auth.authentication.isLogged) {
        //     $state.go('home');
        //     return;
        // }

        var that = this;

        that.form = {};
        that.state = $state;
        that.core = core;
        that.api = api;
        that.auth = auth;
		// that.subscription_type_id = restaurant.data.info.subscription_type_id;
		// that.setupStatus = restaurant.data.info.is_setup_completed;
		// that.pg1_exists = false;
		// that.analytics_questionare = [];

        // that.all_restaurant_categories = [{"name": "Bakery","sub": ["Cakes","Pies","Cookies","Donuts","All","Other"]},{"name": "Bar","sub":["Basic Bar","Brewpub","Biker Bar","Cigar Bar","Cocktail Bar","College Bar","Country Bar","Craft","Dive Bar","Gay Bar","High End Bar","Hotel Bar","Irish Pub","Juke Joint","Karaoke Bar","Lounge","Members Only","Pop Bar","Pub","R&B-Hip Hop","Sports Bar","Tavern","Topless Bar","Underground Bar","Wine Bar","Other"]},{"name": "Bistro","sub": null},{"name": "Buffet","sub": null},{"name": "Deli","sub": ["Cold Sandwiches","Other"]},{"name": "Diner","sub": null},{"name": "Dinner Train","sub": null},{"name": "Drive In","sub": null},{"name": "Cafeteria","sub": null},{"name": "Casual","sub": null},{"name": "Fast Food/QSR","sub": null},{"name": "Family Style (Food/No Alcohol)","sub": null},{"name": "Food Truck","sub": null},{"name": "Full Service (Food/Alcohol)","sub": null},{"name": "Full Service Bar","sub": null},{"name": "Fine Dining","sub": null},{"name": "Gentleman's Club","sub": ["Full Nudity Female","Full Nudity Female","Male"]},{"name": "Hotel Restaurant","sub": null},{"name": "Live Music Venue","sub": null},{"name": "Lunch Counter","sub": null},{"name": "Night Club","sub": ["Alternative Rock","Country","Dance","House","Jazz","Pop","R&B-Hip Hop","Techno","Trance","World Music","Other"]},{"name": "Theatre","sub": null}];

        // that.all_restaurant_types = [{"name": "American Comfort"},{"name": "Africa Eastern"},{"name": "Africa Northern"},{"name": "Africa Southern"},{"name": "Africa Western"},{"name": "Arabic"},{"name": "Asian Latin Fusion"},{"name": "Australian"},{"name": "Barbecue"},{"name": "Belgium"},{"name": "Burgers"},{"name": "Canadian"},{"name": "Caribbean"},{"name": "Chicken"},{"name": "Chinese Restaurant"},{"name": "Coffee House"},{"name": "Country"},{"name": "Craft"},{"name": "Cuban"},{"name": "Dinner Theatre"},{"name": "Donut Shop"},{"name": "Dutch"},{"name": "Ethopian"},{"name": "European Eastern"},{"name": "European Northern"},{"name": "European Southern"},{"name": "European Western"},{"name": "Fish & Chips"},{"name": "French"},{"name": "Gastropub"},{"name": "Greek"},{"name": "Health Food"},{"name": "Ice Cream Shop"},{"name": "Indian Cuisine"},{"name": "Irish"},{"name": "Italian Restaurant"},{"name": "Japanese"},{"name": "Juke Joint"},{"name": "Korean"},{"name": "Lebanese"},{"name": "Mediterranean"},{"name": "Members Only"},{"name": "Mexican Restaurant"},{"name": "Middle Eastern"},{"name": "Mongolian"},{"name": "Pancake Restaurant"},{"name": "Pizza"},{"name": "Puerto Rican"},{"name": "Polish"},{"name": "Revolving Restaurant"},{"name": "Russian"},{"name": "Sandwich Bar"},{"name": "Seafood Restaurant"},{"name": "Serbian"},{"name": "Spanish"},{"name": "Soul Food"},{"name": "South American"},{"name": "Steak House"},{"name": "Sushi"},{"name": "Swiss"},{"name": "Thai"},{"name": "Vegetarian"},{"name": "Vietnamese"},{"name": "Other"}];

		// that.rest_locn = [{"name": "Inside of a hotel lobby"},{"name": "Inside of a office building lobby"},{"name": "Inside of a airport lobby"},{"name": "Inside of a shopping mall"},{"name": "In a shopping mall parking lot"},{"name": "Within 1 mile of a college or university"},{"name": "Multi-Restaurants/Entertainment Complex"},{"name": "Multi-Restaurants/Shopping Complex (NOT a strip mall)"},{"name": "Strip Mall Restaurant"},{"name": "Area with high tourist traffic in or within 1/2 mile of major metro downtown"},{"name": "Area with high tourist traffic NOT near major metro downtown"},{"name": "Major Metropolitan Downtown"},{"name": "Non Major Metropolitan Downtown"},{"name": "Within 1/2 mile of Airport"},{"name": "Outside edge of Downtown"},{"name": "Business district"},{"name": "Restaurant Row or local hotspot"},{"name": "Within 1 mile of a shopping mall"},{"name": "Near Major Intersection"},{"name": "Neighborhood"}, {"name": "Adjacent to Highway or Freeway"}];
		
        // that.days_of_the_week = [{"name": "Sunday"},{"name": "Monday"},{"name": "Tuesday"},{"name": "Wednesday"},{"name": "Thrusday"},{"name": "Friday"},{"name": "Saturday"}];

        // that.hours_of_the_day = [{"name": "12:00 AM"},{"name": "01:00 AM"},{"name": "02:00 AM"},{"name": "03:00 AM"},{"name": "04:00 AM"},{"name": "05:00 AM"},{"name": "06:00 AM"},{"name": "07:00 AM"},{"name": "08:00 AM"},{"name": "09:00 AM"},{"name": "10:00 AM"},{"name": "11:00 AM"},{"name": "12:00 PM"},{"name": "01:00 PM"},{"name": "02:00 PM"},{"name": "03:00 PM"},{"name": "04:00 PM"},{"name": "05:00 PM"},{"name": "06:00 PM"},{"name": "07:00 PM"},{"name": "08:00 PM"},{"name": "09:00 PM"},{"name": "10:00 PM"},{"name": "11:00 PM"},{"name": "N/A"}];

        // that.close_hours_of_the_day = [{"name": "12:00 PM"},{"name": "01:00 PM"},{"name": "02:00 PM"},{"name": "03:00 PM"},{"name": "04:00 PM"},{"name": "05:00 PM"},{"name": "06:00 PM"},{"name": "07:00 PM"},{"name": "08:00 PM"},{"name": "09:00 PM"},{"name": "10:00 PM"},{"name": "11:00 PM"},{"name": "Next Day"},{"name": "12:00 AM"},{"name": "01:00 AM"},{"name": "02:00 AM"},{"name": "03:00 AM"},{"name": "04:00 AM"},{"name": "05:00 AM"},{"name": "06:00 AM"},{"name": "07:00 AM"},{"name": "08:00 AM"},{"name": "09:00 AM"},{"name": "10:00 AM"},{"name": "11:00 AM"},{"name": "N/A"}];

        // that.yes_no = [{"name": "Yes"},{"name": "No"}];
		
		// that.phy_attr_emp_desc_list = [{"name": "All Nude"},{"name": "Topless"},{"name": "Shorts / Small top"},{"name": "Other"}];
		
		// that.play_lic_music_freq_list = [{"name": "During all open hours"},{"name": "Evenings Only"},{"name": "Weekend Only"},{"name": "Evenings and Weekend Only"},{"name": "Other"}];
		
		// that.play_lic_music_type_list = [{"name": "Alternative"},{"name": "Asian Pop (k-pop/j-pop)"},{"name": "Blues"},{"name": "Classical"},{"name": "Country"},{"name": "Dance"},{"name": "Easy Listening"},{"name": "Electronic"},{"name": "European (folk/pop)"},{"name": "Folk"},{"name": "Hip Hop/Rap"},{"name": "Indie Pop"},{"name": "Inspirational Gospel"},{"name": "Jazz"},{"name": "Latin"},{"name": "New Age"},{"name": "Opera"},{"name": "Other"},{"name": "Pop"},{"name": "R&B/Soul"},{"name": "Reggae"},{"name": "Rock"},{"name": "World/Music"}];
		
		// that.live_band_freq_list = [{"name": "Daily"},{"name": "Almost daily"},{"name": "Weekend Only"},{"name": "At least once per month"},{"name": "Multiple times per month"}]; 
		
		// that.male_female = [{"name": "Male"},{"name": "Female"}];

        // that.inventory_count_frequency = [{"name": "Daily"},{"name": "Weekly"},{"name": "Bi-Weekly"},{"name": "Monthly"},{"name": "Annually"},{"name": "No Schedule"},{"name": "Never"}];

        // that.model = {};

        // that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        // if (!that.restaurant_id) {
        //     $state.go('home');
        //     return
        // }

        // if (restaurant.data.permissions) {
        //     that.permissions = restaurant.data.permissions
        // }

        // $rootScope.$on('restaurantSelected', function () {
        //     that.permissions = restaurant.data.permissions;
        // });


        // that.next = function (form) {

        //     if (!form.$valid) return;
	
		// 	var m = {
        //         restaurant_id: that.restaurant_id.restaurant_id,
        //         serving_details: [],
		// 		pg_no : that.page
        //     };
			
		// 	if(that.page == 1){
		// 		if(!that.pg1_exists){
		// 			SweetAlert.swal({
		// 			title: "Save response?",
		// 			text: "This data cannot be changed once saved!",
		// 			type: "warning",
		// 			showCancelButton: true,
		// 			confirmButtonColor: "#337ab7",
		// 			confirmButtonText: "Save"
		// 			},
		// 			function (res) {
		// 				if (res) {
		// 					//save pg 1
							
		// 					m.serving_details.push({
		// 						restaurant_category : that.model.restaurant_category,
		// 						restaurant_subcategory : that.model.restaurant_subcategory == 'Other' ? 'Other:'+that.model.restaurant_subcategory_other : that.model.restaurant_subcategory,
		// 						total_area_sqft : that.model.total_area_sqft,
		// 						kitchen_area_sqft : that.model.kitchen_area_sqft,
		// 						dining_area_sqft : that.model.dining_area_sqft,
		// 						patio_area_sqft : that.model.patio_area_sqft,
		// 						other_area_sqft : that.model.other_area_sqft,
		// 						rest_locality : that.model.rest_locality
		// 					});

		// 					that.api.set_analytics_answers(m).then(function (res) {
		// 						//swal.close();
		// 						try {
		// 							if (res.data.data.code === 1000) {
		// 								that.pg1_exists = true;
		// 								return;
		// 							}
		// 						} catch (e) {
		// 							console.log(e)
		// 						}
		// 					});

		// 				} else {
		// 					return;
		// 				}
		// 			});
		// 		}
		// 		else{
		// 			that.page = that.page ? that.page + 1 : 1;
		// 			that.change_qns(true);
		// 			return;
		// 		}
				
		// 	}
		// 	//page 2 to 4
		// 	else{
				
		// 		if(that.page == 2){
		// 			m.serving_details.push({
		// 				food_cost_budget: that.model.food_cost_budget,
		// 				liq_cost_budget: that.model.liq_cost_budget,
		// 				beer_cost_budget: that.model.beer_cost_budget,
		// 				wine_cost_budget: that.model.wine_cost_budget,
		// 				base_rent: that.model.base_rent,
		// 				percent_rent: that.model.percent_rent,
		// 				percent_rent_value: that.model.percent_rent_value,
		// 				labor_budget: that.model.labor_budget
		// 			});
		// 		}
		// 		else if (that.page == 3){
		// 			m.serving_details.push({
		// 				sunday_open: that.model.open_times[0],
		// 				monday_open: that.model.open_times[1],
		// 				tuesday_open: that.model.open_times[2], 
		// 				wednesday_open: that.model.open_times[3], 
		// 				thursday_open: that.model.open_times[4], 
		// 				friday_open: that.model.open_times[5],
		// 				saturday_open: that.model.open_times[6],
		// 				sunday_close: that.model.close_times[0], 
		// 				monday_close: that.model.close_times[1], 
		// 				tuesday_close: that.model.close_times[2], 
		// 				wednesday_close: that.model.close_times[3], 
		// 				thursday_close: that.model.close_times[4], 
		// 				friday_close: that.model.close_times[5], 
		// 				saturday_close: that.model.close_times[6],
		// 				part_of_grp: that.model.part_of_grp,
		// 				inventory_food_count: that.model.inventory_food_count,
		// 				inventory_alcohol_count: that.model.inventory_alcohol_count,
		// 				managed_by_primary_rest_owner: that.model.managed_by_primary_rest_owner,
		// 				partially_owned_by_chef: that.model.partially_owned_by_chef,
		// 				years_in_business: that.model.years_in_business,
		// 				emp_full_time: that.model.emp_full_time,
		// 				emp_part_time: that.model.emp_part_time,
		// 				servers_full_time: that.model.servers_full_time,
		// 				servers_part_time: that.model.servers_part_time,
		// 				bartenders_full_time: that.model.bartenders_full_time,
		// 				bartenders_part_time: that.model.bartenders_part_time,
		// 				kitchen_emp_full_time: that.model.kitchen_emp_full_time,
		// 				kitchen_emp_part_time: that.model.kitchen_emp_part_time,
		// 				gm_exp: that.model.gm_exp,
		// 				gm_gender: that.model.gm_gender,
		// 				owner_gender: that.model.owner_gender
		// 			});
					
		// 		}
		// 		else if (that.page == 4){
		// 			m.serving_details.push({
		// 				serve_bkfst: that.model.serve_bkfst,
		// 				serve_lunch: that.model.serve_lunch,
		// 				serve_brunch: that.model.serve_brunch,
		// 				serve_dinner: that.model.serve_dinner,
		// 				is_rest_attached_to_mall: that.model.is_rest_attached_to_mall,
		// 				is_rest_standalone_bldg: that.model.is_rest_standalone_bldg,
		// 				attached_sign: that.model.attached_sign,
		// 				near_freeway: that.model.near_freeway,
		// 				phy_attr_emp: that.model.phy_attr_emp,
		// 				phy_attr_emp_desc: that.model.phy_attr_emp_desc,
		// 				play_lic_music: that.model.play_lic_music,
		// 				play_lic_music_freq: that.model.play_lic_music_freq,
		// 				play_lic_music_type: that.model.play_lic_music_type,
		// 				live_band: that.model.live_band,
		// 				live_band_freq: that.model.live_band_freq,
		// 				party_n_group: that.model.party_n_group,
		// 				occupancy_limit: that.model.occupancy_limit,
		// 				built_in_stage: that.model.built_in_stage,
		// 				dance_floor: that.model.dance_floor,
		// 				valet_parking: that.model.valet_parking,
		// 				total_seats: that.model.total_seats,
		// 				total_tables: that.model.total_tables,
		// 				cover_charge: that.model.cover_charge,
		// 				multiple_locns: that.model.multiple_locns,
		// 				multiple_locns_count: that.model.multiple_locns_count,
		// 				cater: that.model.cater,
		// 				food_truck: that.model.food_truck,
		// 				delivery_staff: that.model.delivery_staff
		// 			});
		// 		}

		// 		that.api.set_analytics_answers(m).then(function (res) {
		// 			//swal.close();
		// 			try {
		// 				if (res.data.data.code === 1000) {
		// 					if(that.page > 3){
		// 						//complete setup and go to compset......
		// 						//hence next on pg 4 will be two; complete setup and exit?
		// 						//also fix refresh... blank rest id?
		// 						//also fix other subcat... while get and save
		// 						if(that.subscription_type_id == 4){
		// 							$state.go('reports.compgroupReport');
		// 						}
		// 						else{
		// 							$state.go('admin.homeMenu');
		// 						}
		// 					}
		// 					else{
		// 						that.page = that.page ? that.page + 1 : 1;
		// 						that.change_qns(true);
		// 					}
		// 					return;
		// 				}
		// 			} catch (e) {
		// 				console.log(e)
		// 			}
		// 		});
		// 	}
        // };

		// that.go_back = function () {
		// 	that.page = that.page ? that.page - 1 : 1;
		// 	that.change_qns(false);
		// }
		
		// that.change_qns = function (show_popup) {
		// 	var resId = that.restaurant_id.restaurant_id;
		// 	that.api.get_analytics_answers({rest_id: resId, pg_no: that.page}).then(function (res) {
		// 		if(res.data.data.analytics_answers.analytics_answers && Array.isArray(res.data.data.analytics_answers.analytics_answers)){
		// 			switch(that.page){
		// 				case 1:
		// 					if(res.data.data.analytics_answers.analytics_answers.length != 0){
		// 						that.pg1_exists = true;
		// 						var aa = res.data.data.analytics_answers.analytics_answers[0];
							  
		// 						that.model.restaurant_category = aa.restaurant_category;
		// 						that.model.restaurant_subcategory = aa.restaurant_subcategory.substring(0, 5) == 'Other' ? 'Other' : aa.restaurant_subcategory;
		// 						that.model.restaurant_subcategory_other = aa.restaurant_subcategory.substring(0, 5) == 'Other' ? aa.restaurant_subcategory.substring(6, aa.restaurant_subcategory.length) : null;
		// 						that.model.total_area_sqft = aa.total_area_sqft;
		// 						that.model.kitchen_area_sqft = aa.kitchen_area_sqft;
		// 						that.model.dining_area_sqft = aa.dining_area_sqft;
		// 						that.model.patio_area_sqft = aa.patio_area_sqft;
		// 						that.model.other_area_sqft = aa.other_area_sqft;
		// 						that.model.rest_locality = aa.rest_locality;
		// 					}
		// 					else{
		// 						that.model = {
		// 							  restaurant_category: null,
		// 							  restaurant_subcategory: null,
		// 							  restaurant_subcategory_other: null,
		// 							  total_area_sqft: null,
		// 							  kitchen_area_sqft: null,
		// 							  dining_area_sqft: null,
		// 							  patio_area_sqft: null,
		// 							  other_area_sqft: null,
		// 							  rest_locality: null
		// 							};
		// 					}
									
		// 					if(that.pg1_exists){
		// 						that.analytics_questionare = that.all_analytics_questionare.slice(0, 3);
		// 					}
		// 					else{
		// 						SweetAlert.swal({
		// 							title: "",
		// 							text: "The questions on page #1 will determine how we categorize your restaurant and therefore must be answered correctly. Please note that you cannot change the answers on Page #1 once you select save. If you have questions or need additional explanations please select the ? next to each answer box.",
		// 							confirmButtonColor: "#337ab7",
		// 							confirmButtonText: "OK"
		// 						},
		// 						function (res) {
		// 							if (res) {
		// 								that.analytics_questionare = that.all_analytics_questionare.slice(0, 3);
		// 							}
		// 							else{
		// 								that.analytics_questionare = that.all_analytics_questionare.slice(0, 3);
		// 							}
		// 							return;
		// 						});
		// 					}
		// 					break;
						
		// 				case 2:
		// 					if(res.data.data.analytics_answers.analytics_answers.length != 0){
		// 						var aa = res.data.data.analytics_answers.analytics_answers[0];
							  
		// 						that.model.food_cost_budget = aa.food_cost_budget;
		// 						that.model.liq_cost_budget = aa.liq_cost_budget;
		// 						that.model.beer_cost_budget = aa.beer_cost_budget;
		// 						that.model.wine_cost_budget = aa.wine_cost_budget;
		// 						that.model.base_rent = aa.base_rent;
		// 						that.model.percent_rent = aa.percent_rent;
		// 						that.model.percent_rent_value = aa.percent_rent_value;
		// 						that.model.labor_budget = aa.labor_budget;
		// 					}
		// 					else{
		// 						that.model = {
		// 							  food_cost_budget: null,
		// 							  liq_cost_budget: null,
		// 							  beer_cost_budget: null,
		// 							  wine_cost_budget: null,
		// 							  base_rent: null,
		// 							  percent_rent: null,
		// 							  percent_rent_value: null,
		// 							  labor_budget: null
		// 							};
		// 					}
							
		// 					if(show_popup){
		// 						SweetAlert.swal({
		// 							title: "",
		// 							text: "Would you like to know if your budget is inline with your peers? The following questions are optional but sharing the data will provide greater insight into your expenses and budget. Remember that in order to get data, you must confidentially share data.",
		// 							confirmButtonColor: "#337ab7",
		// 							confirmButtonText: "OK"
		// 						},
		// 						function (res) {
		// 							if (res) {
		// 								that.analytics_questionare = that.all_analytics_questionare.slice(3, 10);
		// 							}
		// 							else{
		// 								that.analytics_questionare = that.all_analytics_questionare.slice(3, 10);
		// 							}
		// 							return;
		// 						});
		// 					}
		// 					else{
		// 						that.analytics_questionare = that.all_analytics_questionare.slice(3, 10);
		// 					}
							
		// 					break;
							
		// 				case 3:
		// 					if(res.data.data.analytics_answers.analytics_answers.length != 0){
		// 						var aa = res.data.data.analytics_answers.analytics_answers[0];
								
		// 						that.model.open_times = [aa.sunday_open, aa.monday_open, aa.tuesday_open, aa.wednesday_open, aa.thursday_open, aa.friday_open, aa.saturday_open];
		// 						that.model.close_times = [aa.sunday_close, aa.monday_close, aa.tuesday_close, aa.wednesday_close, aa.thursday_close, aa.friday_close, aa.saturday_close];
		// 						that.model.part_of_grp = aa.part_of_grp;
		// 						that.model.inventory_food_count = aa.inventory_food_count;
		// 						that.model.inventory_alcohol_count = aa.inventory_alcohol_count;
		// 						that.model.managed_by_primary_rest_owner = aa.managed_by_primary_rest_owner;
		// 						that.model.partially_owned_by_chef = aa.partially_owned_by_chef;
		// 						that.model.years_in_business = aa.years_in_business;
		// 						that.model.emp_full_time = aa.emp_full_time;
		// 						that.model.emp_part_time = aa.emp_part_time;
		// 						that.model.servers_full_time = aa.servers_full_time;
		// 						that.model.servers_part_time = aa.servers_part_time;
		// 						that.model.bartenders_full_time = aa.bartenders_full_time;
		// 						that.model.bartenders_part_time = aa.bartenders_part_time;
		// 						that.model.kitchen_emp_full_time = aa.kitchen_emp_full_time;
		// 						that.model.kitchen_emp_part_time = aa.kitchen_emp_part_time;
		// 						that.model.gm_exp = aa.gm_exp;
		// 						that.model.gm_gender = aa.gm_gender;
		// 						that.model.owner_gender = aa.owner_gender;
		// 					}
		// 					else{
		// 						that.model = {
		// 							  open_times: [null, null, null, null, null, null, null],
		// 							  close_times: [null, null, null, null, null, null, null],
		// 							  part_of_grp: null,
		// 							  inventory_food_count: null,
		// 							  inventory_alcohol_count: null,
		// 							  managed_by_primary_rest_owner: null,
		// 							  partially_owned_by_chef: null,
		// 							  years_in_business: null,
		// 							  emp_full_time: null,
		// 							  emp_part_time: null,
		// 							  servers_full_time: null,
		// 							  servers_part_time: null,
		// 							  bartenders_full_time: null,
		// 							  bartenders_part_time: null,
		// 							  kitchen_emp_full_time: null,
		// 							  kitchen_emp_part_time: null,
		// 							  gm_exp: null,
		// 							  gm_gender: null,
		// 							  owner_gender: null
		// 							};
		// 					}
							
		// 					if(show_popup){
		// 						SweetAlert.swal({
		// 							title: "",
		// 							text: "An extremely important part of any restaurant comes from the top as owners and managers. Tell us about your executive team and structure.",
		// 							confirmButtonColor: "#337ab7",
		// 							confirmButtonText: "OK"
		// 						},
		// 						function (res) {
		// 							if (res) {
		// 								that.analytics_questionare = that.all_analytics_questionare.slice(10, 24);
		// 							}
		// 							else{
		// 								that.analytics_questionare = that.all_analytics_questionare.slice(10, 24);
		// 							}
		// 							return;
		// 						});
		// 					}
		// 					else{
		// 						that.analytics_questionare = that.all_analytics_questionare.slice(10, 24);
		// 					}
							
		// 					break;
							
							
		// 				case 4:
		// 					if(res.data.data.analytics_answers.analytics_answers.length != 0){
		// 						var aa = res.data.data.analytics_answers.analytics_answers[0];
							  
		// 						that.model.serve_bkfst = aa.serve_bkfst;
		// 						that.model.serve_lunch = aa.serve_lunch;
		// 						that.model.serve_brunch = aa.serve_brunch;
		// 						that.model.serve_dinner = aa.serve_dinner;
		// 						that.model.is_rest_attached_to_mall = aa.is_rest_attached_to_mall;
		// 						that.model.is_rest_standalone_bldg = aa.is_rest_standalone_bldg;
		// 						that.model.attached_sign = aa.attached_sign;
		// 						that.model.near_freeway = aa.near_freeway;
		// 						that.model.phy_attr_emp = aa.phy_attr_emp;
		// 						that.model.phy_attr_emp_desc = aa.phy_attr_emp_desc;
		// 						that.model.play_lic_music = aa.play_lic_music;
		// 						that.model.play_lic_music_freq = aa.play_lic_music_freq;
		// 						that.model.play_lic_music_type = aa.play_lic_music_type;
		// 						that.model.live_band = aa.live_band;
		// 						that.model.live_band_freq = aa.live_band_freq;
		// 						that.model.party_n_group = aa.party_n_group;
		// 						that.model.occupancy_limit = aa.occupancy_limit;
		// 						that.model.built_in_stage = aa.built_in_stage;
		// 						that.model.dance_floor = aa.dance_floor;
		// 						that.model.valet_parking = aa.valet_parking;
		// 						that.model.total_seats = aa.total_seats;
		// 						that.model.total_tables = aa.total_tables;
		// 						that.model.cover_charge = aa.cover_charge;
		// 						that.model.multiple_locns = aa.multiple_locns;
		// 						that.model.multiple_locns_count = aa.multiple_locns_count;
		// 						that.model.cater = aa.cater;
		// 						that.model.food_truck = aa.food_truck;
		// 						that.model.delivery_staff = aa.delivery_staff;
		// 					}
		// 					else{
		// 						that.model = {
		// 							  serve_bkfst: null,
		// 							  serve_lunch: null,
		// 							  serve_brunch: null,
		// 							  serve_dinner: null,
		// 							  is_rest_attached_to_mall: null,
		// 							  is_rest_standalone_bldg: null,
		// 							  attached_sign: null,
		// 							  near_freeway: null,
		// 							  phy_attr_emp: null,
		// 							  phy_attr_emp_desc: null,
		// 							  play_lic_music: null,
		// 							  play_lic_music_freq: null,
		// 							  play_lic_music_type: null,
		// 							  live_band: null,
		// 							  live_band_freq: null,
		// 							  party_n_group: null,
		// 							  occupancy_limit: null,
		// 							  built_in_stage: null,
		// 							  dance_floor: null,
		// 							  valet_parking: null,
		// 							  total_seats: null,
		// 							  total_tables: null,
		// 							  cover_charge: null,
		// 							  multiple_locns: null,
		// 							  multiple_locns_count: null,
		// 							  cater: null,
		// 							  food_truck: null,
		// 							  delivery_staff: null
		// 							};
		// 					}
							
		// 					if(show_popup){
		// 						SweetAlert.swal({
		// 							title: "",
		// 							text: "In order to provide the most insight, let’s dig a bit deeper into your restaurant. These questions are optional and you can return to them later however in order to get additional insight, you must confidentially share.",
		// 							confirmButtonColor: "#337ab7",
		// 							confirmButtonText: "OK"
		// 						},
		// 						function (res) {
		// 							if (res) {
		// 								that.analytics_questionare = that.all_analytics_questionare.slice(24, that.all_analytics_questionare.length);
		// 							}
		// 							else{
		// 								that.analytics_questionare = that.all_analytics_questionare.slice(24, that.all_analytics_questionare.length);
		// 							}
		// 							return;
		// 						});
		// 					}
		// 					else{
		// 						that.analytics_questionare = that.all_analytics_questionare.slice(24, that.all_analytics_questionare.length);
		// 					}
							
		// 					break;
		// 			}
		// 		}
		// 	});
			
		// }
		
        that.$onInit = function () {
			// that.page = 1;
			// that.core.getRefbooks().then(function (res1) {
			// 	that.all_analytics_questionare = res1.analytics_questionare;
			// 	that.change_qns(true);		
			// });
        };
    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$rootScope', 'SweetAlert', 'restaurant', 'core'];

    angular.module('inspinia').component('employeerole', {
        templateUrl: 'js/components/employeerole/employeerole.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
