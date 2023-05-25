(function () {
    'use strict';
	
	var modalController = function ($uibModalInstance, alertService, SweetAlert) {
        var that = this;
		that.emailForm = {};
		that.user_email = null;
		that.q_title = 'Please enter your email address';
		
        that.save = function(form) {
			if (!form.$valid) {
				if(!form.Email.$valid){
					SweetAlert.swal(
					{
						  title: "Error!",
						  text:
							"Enter a valid email address with all lowercase letters.",
						  type: "error",
						  confirmButtonColor: "#ed5565",
						  confirmButtonText: "OK"
						},
						function(res) {
							if (res) {
								//
							}
						}
					);
				}
                return
            }
			$uibModalInstance.close({'user_email': that.user_email});
		};

		that.cancel = function() {
			$uibModalInstance.dismiss("cancel");
		};
    };
	
    function foodCalculatorController(api, $state, auth, core, $uibModal, restaurant, alertService, SweetAlert) {

        var that = this;
        that.auth = auth;
		that.api = api;
		
		that.model = {};
		that.reset_model = function () {
			that.model = {
						'menu_name' : null,
						'menu_price' : null,
						'menu_cost' : null,
						'menu_cost_percent' : 0,
						'item1' : {
									'recipe_name' : 'Click here for Recipe #1',
									'recipe_cost' : null,
									'servings' : 1,
									'ingredients' : [{
												ingre_name: null,
												cost: null,
												delivery_unit: null,
												recipe_amount: null,
												measure_type: null,
												recipe_cost: null
												}]
								},
						'item2' : {
									'recipe_name' : 'Click here for Recipe #2',
									'recipe_cost' : null,
									'servings' : 1,
									'ingredients' : [{
												ingre_name: null,
												cost: null,
												delivery_unit: null,
												recipe_amount: null,
												measure_type: null,
												recipe_cost: null
												}]
								},
						'item3' : {
									'recipe_name' : 'Click here for Recipe #3',
									'recipe_cost' : null,
									'servings' : 1,
									'ingredients' : [{
												ingre_name: null,
												cost: null,
												delivery_unit: null,
												recipe_amount: null,
												measure_type: null,
												recipe_cost: null
												}]
								},
						'user_email': null
			};
			
			that.selected_item = that.model.item1;
			that.selected_item_no = 1;
		}
		that.reset_model();

		that.unit_types = [
			{
				id: 1,
				name: 'Lbs'
			},
			{
				id: 2,
				name: 'Oz'
			},
			{
				id: 3,
				name: 'Units'
			},
			{
				id: 4,
				name: 'Gal'
			},
			{
				id: 5,
				name: 'Liters'
			}
		];
		
		that.reset_model_alert = function (){
			SweetAlert.swal(
				{
				  title: "Are you sure?",
				  text:
					"This will completely clear all the information and you will have to startover!",
				  type: "warning",
				  showCancelButton: true,
				  confirmButtonColor: "#ed5565",
				  confirmButtonText: "Confirm"
				},
				function(res) {
					if (res) {
						that.reset_model();
					}
				}
			);
		}
		
		that.select_item = function (item_no) {
			switch(item_no){
				case 1:
				that.selected_item = that.model.item1;
				that.selected_item_no = 1;
				break;
				
				case 2:
				that.selected_item = that.model.item2;
				that.selected_item_no = 2;
				break;
				
				case 3:
				that.selected_item = that.model.item3;
				that.selected_item_no = 3;
				break;
				
				default:
				that.selected_item = that.model.item1;
				that.selected_item_no = 1;
				break;
			}
		}
		
		that.get_unit_types = function ($index) {
			if(that.selected_item.ingredients[$index].delivery_unit == null || typeof $index == 'undefined'){
				return that.unit_types;
			}
			else if(that.selected_item.ingredients[$index].delivery_unit.id == 3){	//units -> units
				return that.unit_types.slice(2,3);
			}
			else if(that.selected_item.ingredients[$index].delivery_unit.id == 1){	//lb -> oz/lb
				return that.unit_types.slice(0,2);
			}
			else if(that.selected_item.ingredients[$index].delivery_unit.id == 2){	//oz -> oz/lb/gal/lit
				return that.unit_types.slice(0,2).concat(that.unit_types.slice(3,5));
			}
			else if(that.selected_item.ingredients[$index].delivery_unit.id == 4 || that.selected_item.ingredients[$index].delivery_unit.id == 5){	//gal/lit -> oz/gal/lit
				return that.unit_types.slice(1,2).concat(that.unit_types.slice(3,5));
			}
		}
		
		that.adjustPrice = function () {
			if(that.model.menu_price == null || that.model.menu_price < 0){
				that.model.menu_price = 0;
			}
		}
		
		that.checkRecipeName = function (sel_item) {
			if(sel_item.recipe_name == null || sel_item.recipe_name == ''){
				sel_item.recipe_name = "Item "+that.selected_item_no;
			}
		}
		
		that.adjustServings = function (sel_item) {
			if(sel_item.servings == null || sel_item.servings < 0){
				sel_item.servings = 0;
			}
			sel_item.servings = Math.round(sel_item.servings);
		}
		
		that.addIngreEntry = function () {
			that.selected_item.ingredients.push({
												ingre_name: null,
												cost: null,
												delivery_unit: null,
												recipe_amount: null,
												measure_type: null,
												recipe_cost: null
												});
		}
		
		that.delIngreEntry = function ($index) {
			that.selected_item.ingredients.splice($index, 1);
			that.calculate(that.selected_item_no);
		}
		
		that.resetFields = function (ingre, $index){
			ingre.recipe_cost = 0;
			if(ingre.delivery_unit.id == 3 || ingre.measure_type.id == 3){
				ingre.measure_type = null;
			}
			that.calculate(that.selected_item_no, $index);
		}
		
		that.calc_ingre_recipe_cost = function (curr_i){
			try{
				if(curr_i.cost != null && curr_i.delivery_unit.id != null && curr_i.recipe_amount != null && curr_i.measure_type.id != null){
					//var measure_to_delivery_multiplier = (curr_i.delivery_unit.id == curr_i.measure_type.id) ? 1 : (curr_i.delivery_unit.id == 1 && curr_i.measure_type.id == 2) ? 1/16 : (curr_i.delivery_unit.id == 2 && curr_i.measure_type.id == 1) ? 16 : 1;
					var measure_to_delivery_multiplier = 1;
					if(curr_i.delivery_unit.id != curr_i.measure_type.id){
						if(curr_i.delivery_unit.id == 1 && curr_i.measure_type.id == 2){	//lb <- oz
							measure_to_delivery_multiplier = 1/16;
						}
						else if(curr_i.delivery_unit.id == 2 && curr_i.measure_type.id == 1){	//oz <- lb
							measure_to_delivery_multiplier = 16;
						}
						else if(curr_i.delivery_unit.id == 2 && curr_i.measure_type.id == 4){	//oz <- gal
							measure_to_delivery_multiplier = 128;
						}
						else if(curr_i.delivery_unit.id == 2 && curr_i.measure_type.id == 5){	//oz <- lit
							measure_to_delivery_multiplier = 33.814;
						}
						else if(curr_i.delivery_unit.id == 4 && curr_i.measure_type.id == 2){	//gal <- oz
							measure_to_delivery_multiplier = 1/128;
						}
						else if(curr_i.delivery_unit.id == 5 && curr_i.measure_type.id == 2){	//lit <- oz
							measure_to_delivery_multiplier = 1/33.814;
						}
						else if(curr_i.delivery_unit.id == 4 && curr_i.measure_type.id == 5){	//gal <- lit
							measure_to_delivery_multiplier = 0.264172;
						}
						else if(curr_i.delivery_unit.id == 5 && curr_i.measure_type.id == 4){	//lit <- gal
							measure_to_delivery_multiplier = 3.78541;
						}
					}
					curr_i.recipe_cost = Math.round((curr_i.recipe_amount * measure_to_delivery_multiplier * curr_i.cost) * 100) / 100;
				}
				else{
					curr_i.recipe_cost = 0;
				}
			}
			catch(err){
				
			}
		}
		
		that.calc_recipe_cost = function (curr_r){
			var recipe_cost = 0;
			for(var i in curr_r.ingredients){
				var curr_i = curr_r.ingredients[i];
				
				if(curr_i.recipe_cost != null){
					recipe_cost += curr_i.recipe_cost;
				}
			}
			curr_r.recipe_cost = that.selected_item.servings == 0 ? null : Math.round((recipe_cost / that.selected_item.servings) * 100) / 100;
		}
		
		that.calc_menu_cost = function (){
			that.model.menu_cost = Math.round(((that.model.item1.recipe_cost == null ? 0 : that.model.item1.recipe_cost) + (that.model.item2.recipe_cost == null ? 0 : that.model.item2.recipe_cost) + (that.model.item3.recipe_cost == null ? 0 : that.model.item3.recipe_cost)) * 100) / 100;
			
			if(that.model.menu_price != null && that.model.menu_price != 0 && that.model.menu_cost != null){
				that.model.menu_cost_percent = Math.round((that.model.menu_cost / that.model.menu_price) * 10000) / 100;
			}
		}
		
		that.calculate = function (selected_item_no, $index){
			if($index != null && typeof $index != 'undefined'){
				if(selected_item_no == 1){
					var curr_i = that.model.item1.ingredients[$index];
					that.calc_ingre_recipe_cost(curr_i);
					that.calc_recipe_cost(that.model.item1);
					that.calc_menu_cost();
				}
				else if(selected_item_no == 2){
					var curr_i = that.model.item2.ingredients[$index];
					that.calc_ingre_recipe_cost(curr_i);
					that.calc_recipe_cost(that.model.item2);
					that.calc_menu_cost();
				}
				else if(selected_item_no == 3){
					var curr_i = that.model.item3.ingredients[$index];
					that.calc_ingre_recipe_cost(curr_i);
					that.calc_recipe_cost(that.model.item3);
					that.calc_menu_cost();
				}
			}
			else if(selected_item_no != -1 && ($index == null || typeof $index == 'undefined')){
				if(selected_item_no == 1){
					that.calc_recipe_cost(that.model.item1);
					that.calc_menu_cost();
				}
				else if(selected_item_no == 2){
					that.calc_recipe_cost(that.model.item2);
					that.calc_menu_cost();
				}
				else if(selected_item_no == 3){
					that.calc_recipe_cost(that.model.item3);
					that.calc_menu_cost();
				}
			}
			else if(selected_item_no == -1){
				that.calc_menu_cost();
			}
		}
		
		that.removeInvalidIngredients = function (curr_r){
			var validIngre = [];

			for(var i in curr_r.ingredients){
				var curr_i = curr_r.ingredients[i];
				
				if(!(curr_i.cost == null || curr_i.delivery_unit == null || curr_i.recipe_amount == null || curr_i.measure_type == null || curr_i.recipe_cost == null)){
					validIngre.push(curr_i);
				}
			}
			curr_r.ingredients = validIngre;
		}
		
		that.emailDetails = function () {
			var valid_recipe_exists = false;
			if(that.model.item1.ingredients.length){
				valid_recipe_exists = true;
			}
			if(that.model.item2.ingredients.length){
				valid_recipe_exists = true;
			}
			if(that.model.item3.ingredients.length){
				valid_recipe_exists = true;
			}
			
			if(!valid_recipe_exists){
				alertService.showError('Please add at least one ingredient to any recipe.');
                return;
			}
			else{
				var sendResults = function () {
					var m = JSON.parse(JSON.stringify(that.model));
					if(m.item1.ingredients.length){
						that.removeInvalidIngredients(m.item1);
					}
					if(m.item2.ingredients.length){
						that.removeInvalidIngredients(m.item2);
					}
					if(m.item3.ingredients.length){
						that.removeInvalidIngredients(m.item3);
					}
			
					that.api.send_free_calc_email(m).then(function (res, err) {
						swal({
							title: "Emailed successfully!",
							text: "Please check your inbox.",
							showConfirmButton: true,
							type: "success"
						},
						function(res) {
							//that.reset_model();
						});
					});
				}
				
				that.model.user_email = null;
				var modalInstance = $uibModal.open({
					templateUrl: 'email_results.html',
					controller: modalController,
					windowClass: "animated fadeIn modal-lgg",
					controllerAs: '$ctr',
					resolve: {
						user_email: function () {
							return that.model.user_email;
						}
					}
				});

				modalInstance.result.then(function (res) {
					that.model.user_email = res.user_email;
					sendResults();
				});
			}
			
		}
		
        that.$onInit = function () {

        };
    }

    foodCalculatorController.$inject = ['api', '$state', 'auth', 'core', '$uibModal', 'restaurant', 'alertService', 'SweetAlert'];

    angular.module('inspinia').component('foodCalculator', {
        templateUrl: 'js/components/foodCalculator/foodCalculator.html',
        controller: foodCalculatorController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();