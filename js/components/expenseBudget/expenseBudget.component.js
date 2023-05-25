(function() {
    'use strict';
    function controller(api, $state, core, auth, localStorageService, $rootScope, restaurant, alertService) {
        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
		that.form = {};
        that.$state = $state;
        that.core = core;
        that.api = api;
        that.auth = auth;
		
		that.restaurant_id = localStorageService.get('restaurant_id'); // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }
		
        $rootScope.$on('restaurantSelected', function() {
            that.permissions = restaurant.data.permissions;
        });
		
		const month_no = {'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5, 'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11};
		const DD_OPTIONS_SIZE = 3;
		const PAYROLL_TAX = 9;
		const BREAKEVEN_INDEX = 0.62;
		that.month_names = Object.keys(month_no);
		that.current_month = new Date().getMonth();
		that.current_year = new Date().getFullYear();
		that.dd_options = [];
		for(var i = 0; i < DD_OPTIONS_SIZE; i++){
			var d = new Date();
			that.dd_options.push(d.getFullYear() - i);
		}
		that.selected_dd_option = that.dd_options[0];
		that.alco_tax = 6.25;
		that.cc_fee = 2.5;
		that.expenses_arr = [];
		that.other_expenses_total_arr = new Array(that.month_names.length).fill(0);
		that.est_net_profit_arr = new Array(that.month_names.length).fill(0);
	
		that.extract_np_values = function (title, key, dummy_arr, arr) {
			var ret_obj = {
					'title': title,
					'month_values': dummy_arr
			}
			if(arr.length){
				ret_obj.month_values = 
				dummy_arr.map(function(y, index){
					var find_item = arr.filter(function(x){return x.month == index + 1});
					if(find_item.length){
						if(key == 'alco_sales'){
							return Math.round(find_item[0][key.toString()] * that.alco_tax / 100);
						}
						else if(key == 'sales' && title == 'Creditcard Fee'){
							return Math.round(find_item[0][key.toString()] * that.cc_fee / 100);
						}
						else{
							return find_item[0][key.toString()];
						}
					}
					else{
						return y;
					}
				});
			}
			return ret_obj;
		}
		
		that.getData = function () {
			var dummy_month_arr = new Array(that.month_names.length).fill(0);
			that.alco_sales_values = new Array(that.month_names.length).fill(0);
			that.api.getExpenses({
				year: that.selected_dd_option,
				net_profit: true,
				np_mode: 'monthly'
			}).then(function (res) {
				if(res && res.data.data.code == 1000 && typeof res.data.data.expenses != 'undefined'){
					that.expenses_arr = res.data.data.expenses.expenses_data;
					that.bef_data = res.data.data.expenses.bef;
					that.net_profit = res.data.data.expenses.net_profit;
					that.overview_arr = [];
					
					if(typeof that.bef_data != 'undefined'){
						if(typeof that.bef_data.alcohol_tax != 'undefined' && that.bef_data.alcohol_tax != null){
							that.alco_tax = that.bef_data.alcohol_tax;
						}
						if(typeof that.bef_data.cc_fee != 'undefined' && that.bef_data.cc_fee != null){
							that.cc_fee = that.bef_data.cc_fee;
						}
						if(typeof that.bef_data.annual_salaries != 'undefined' && that.bef_data.annual_salaries != null){
							that.annual_salaries = that.bef_data.annual_salaries;
						}
					}
					if(typeof that.net_profit != 'undefined'){
						that.overview_arr.push(that.extract_np_values('Sales', 'sales', dummy_month_arr, that.net_profit.sales));
						that.overview_arr.push({title: "Labor", month_values: dummy_month_arr.map(function(x){return x + (that.annual_salaries != null ? Math.round(that.annual_salaries / 12) : 0) })});
						that.overview_arr.push(that.extract_np_values('Inventory', 'inv', dummy_month_arr, that.net_profit.inv));
						that.overview_arr.push(that.extract_np_values('Alcohol Tax', 'alco_sales', dummy_month_arr, that.net_profit.alco_sales));
						that.overview_arr.push(that.extract_np_values('Creditcard Fee', 'sales', dummy_month_arr, that.net_profit.sales));
						that.overview_arr.push({title: "Payroll Tax", month_values: that.overview_arr[1].month_values.map(function(x){return Math.round(x * PAYROLL_TAX / 100)})});
						
						if(that.net_profit.alco_sales.length){
							that.alco_sales_values = dummy_month_arr.map(function(y, index){
								var find_item = that.net_profit.alco_sales.filter(function(x){return x.month == index + 1});
								if(find_item.length){
									return JSON.parse(JSON.stringify(find_item[0]['alco_sales']));
								}
								else{
									return y;
								}
							});
						}
					}
					if(!that.expenses_arr.length){
						that.addBudgetEntry();
					}
					
					that.calculate_budget_amt_totals(that.expenses_arr);
					that.calculate_other_expenses_totals();
				}
			});
			
			that.expenses_cols = that.month_names.map(function(x){return x.substring(0,3)+"-"+that.selected_dd_option%2000});
		}
		
		that.disableExpenseInput = function (month_key) {
			if(that.selected_dd_option < that.current_year){
				return false;
			}
			if(month_no[month_key] <= that.current_month){
				return false;
			}
			return true;
		}
		
		that.addBudgetEntry = function () {
			that.expenses_arr.push({expense_id: null, expense_type_unit_id: null, expense_name: null, year: that.selected_dd_option, amount: null});
			that.calculateEstNetProfit();
		}
		
		that.removeBudgetEntry = function (index) {
			that.expenses_arr.splice(index, 1);
			that.calculate_budget_amt_totals(that.expenses_arr);
			that.calculate_other_expenses_totals();
		}
		
		that.calculateEstNetProfit = function () {
			that.est_net_profit_arr = new Array(that.month_names.length).fill(0);
			
			for(var j=0; j<that.est_net_profit_arr.length; j++){
				that.est_net_profit_arr[j] = 
				that.overview_arr[0].month_values[j]
				- that.overview_arr[1].month_values[j]
				- that.overview_arr[2].month_values[j]
				- that.overview_arr[3].month_values[j]
				- that.overview_arr[4].month_values[j]
				- that.overview_arr[5].month_values[j]
				- that.other_expenses_total_arr[j];
			}
		}
		
		that.calcualte_percent_value = function (key) {
			for(var i=0; i<that.overview_arr.length; i++){
				var ci = that.overview_arr[i];
				if(ci.title == key && key == 'Alcohol Tax'){
					for(var i=0; i<ci.month_values.length - 1; i++){
						ci.month_values[i] = Math.round(that.alco_sales_values[i] * that.alco_tax / 100);
					}
					break;
				}
				else if(ci.title == key && key == 'Creditcard Fee'){
					for(var i=0; i<ci.month_values.length - 1; i++){
						ci.month_values[i] = Math.round(that.overview_arr[0].month_values[i] * that.cc_fee / 100);
					}
					break;
				}
				else if(ci.title == key && key == 'Labor'){
					for(var i=0; i<ci.month_values.length - 1; i++){
						ci.month_values[i] = Math.round(that.annual_salaries / 12);
						that.overview_arr[5].month_values[i] = Math.round(ci.month_values[i] * PAYROLL_TAX / 100);
					}
					break;
				}
			}
			that.calculateEstNetProfit();
		}
		
		that.calculate_budget_amt_totals = function (arr) {
			var total = 0;
			for(var i=0; i<arr.length; i++){
				var ci = arr[i];
				total += ci.amount;
			}
			that.budget_amt_total = total;
			
			that.update_breakeven();
		}
		
		that.update_breakeven = function () {
			that.breakeven_value = Math.round((that.budget_amt_total + (that.selected_dd_option < that.current_year ? that.overview_arr[5].month_values[that.month_names.length - 1] : that.overview_arr[5].month_values[that.current_month])) / (1 - BREAKEVEN_INDEX));
		}
		
		that.calculate_other_expenses_totals = function (month_key) {
			if(typeof month_key == 'undefined'){
				that.other_expenses_total_arr = new Array(that.month_names.length).fill(0);
			}
			else{
				that.other_expenses_total_arr[month_no[month_key]] = 0;
			}
			
			for(var i=0; i<that.expenses_arr.length; i++){
				var ci = that.expenses_arr[i];
				that.month_names.forEach(function(m){
					if(typeof month_key == 'undefined'){
						that.other_expenses_total_arr[month_no[m]] += ci[m] || 0;
					}
					else if(month_key == m){
						that.other_expenses_total_arr[month_no[m]] += ci[m] || 0;
					}
				});
			}
			
			that.calculateEstNetProfit();
		}
		
		that.saveExpenses = function (form) {
            if (!form.$valid) {
                return
            }
			that.api.update_expenses({year: that.selected_dd_option, expenses: that.expenses_arr, bef: {alcohol_tax: that.alco_tax, cc_fee: that.cc_fee, annual_salaries: that.annual_salaries}}).then(function (res) {
                if (res && res.data.data.code == 1000) {
					that.getData();
					alertService.showAlertSave();
                }
				else{
					alertService.showError('Something went wrong!');
				}
			
            });
		}
		
        that.$onInit = function() {
			that.core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
				that.is_su = auth.authentication.user.id == 1 ? true : false;
			
				if(!that.is_su){
					$state.go('admin.homeMenu');
				}
				
				var exp_subcats_dict = {};
				that.expense_subcategories = that.get_refbooks.accounting_subcategories.filter(function(x){return x.parent_category == 7})
					.map(function(x){exp_subcats_dict[x.id] = x.subcategory});
				that.expenses_types = that.get_refbooks.accounting_units.filter(function(x){return x.parent_category == 7})
					.map(function(x){return Object.assign(x, {'subcat_name': exp_subcats_dict[x.subcategory]})});
					
				that.getData();
            });
        };
    }

    controller.$inject = ['api', '$state', 'core', 'auth', 'localStorageService', '$rootScope', 'restaurant', 'alertService'];

    angular.module('inspinia').component('expenseBudgetComponent', {
        templateUrl: 'js/components/expenseBudget/expenseBudget.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
