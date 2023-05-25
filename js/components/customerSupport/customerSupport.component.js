(function () {

    'use strict';

    function controller(api, $state, auth, localStorageService, $rootScope, $scope, SweetAlert, alertService, restaurant, core) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;

        that.form = {};
        that.state = $state;
        that.core = core;
        that.api = api;
        that.auth = auth;
		
		that.instructions = "<article style='display: block;'><h1 id='Setup Assistance'>Let us help you get setup!</h1><p class=\"font-16\">We know you are busy running your restaurant but we also understand that you might be anxious to dive into your numbers and get more insight. Let us help! For a small ONE-TIME fee our team can have your account setup typically within 1-3 business days after receiving all the information that we need.</p><br/><h2>How it works?</h2><p class=\"font-16\">The Skrible team will setup 80% of your recipes and match 80% of your recipes to their corresponding menu items. We do this intentionally because we like to give our users an opportunity to learn how the system functions without taking up too much of their time. In short, our setup process will leave you with four final tasks which include:</p><ol class=\"font-16\"><li>Entering in the last 20% of your recipes (estimated time - 30 minutes)</li><li>Adding Skrible to your POS email distribution list (estimated time - 10 minutes)</li><li>completing the analytics form (estimated time - 30 minutes)</li><li>Doing a full inventory audit and entering the info into the system (estimated time 2-4 man-hours)</li></ol><br/><h2>What do we need to get started?</h2><ol class=\"font-16\"><li><b><u>List of vendors</u></b> that you currently purchase from which should include their name, address, phone, sales rep name, sales rep email, your account number</li><li><b><u>List of inventory items</u></b> purchased from each vendor and currently on your shelf. You can usually get this info from your vendor pretty quickly then just forward it to us.</li><li><b><u>List of your recipes</u></b> which should include unit of measure and exact name as it appears above. This info must be very clear and specific. For example: if you purchase a red Fuji apple and a red Honeycrisp apple please do not list on your recipe 'red apple'. In this situation you will have to be very specific and note the details such as 'red Fuji apple'.</li><li><b><u>Menu items and modifiers</u></b> please provide a copy of your menu which should note the recipe items and menu item cost. For example: a hamburger meal might include a hamburger with optional fries or salad and a drink for $7.99.</li><li><b><u>POS printout with item sales price</u></b> please print your item sales from your POS covering the past 90 days and note any items which are inactive. We also need to see your retail prices and discount prices for each item, each menu item and each modifier.</li></ol><p class=\"font-16\">Please forward all of the above data via email to <code>sales@getskrible.com</code> with your restaurant name and address in the email subject. After we've received all of the above info, your setup will begin and you will be notified once your menu and recipe setup is complete.</p><p class=\"font-16\">To proceed please select one of the below assistance type and you will be taken to the payment screen. Once your payment is processed you will receive a confirmation email and a follow up email with more setup details.</p></article>";
		
		that.subscription_type_id = restaurant.data.info.subscription_type_id;

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}
		
		that.currYear = new Date().getFullYear().toString().slice(-2);
        //that.formatCardApi = 'json';
        //that.CardApiKey = 'c208cd8b5d695cd2a3f761fb890e87f3';
        //that.invalidCard = false;
        $rootScope.card_number = "";
        $rootScope.exp_month = "";
        $rootScope.exp_year = "";
        $rootScope.cvc = "";
        $rootScope.first_name = "";
        $rootScope.last_name = "";
        $rootScope.billing_address = "";
        $rootScope.StripePaymentId = "";

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

		that.go_back = function () {
			that.page = 1;
			that.s_type = null;
		}
		
		that.chooseType = function (s_type) {
			that.page = 2;
			that.s_type = s_type;
			switch(that.s_type){
				case 1:
				that.s_amount = '699.00';
				break;
				
				case 2:
				that.s_amount = '899.00';
				break;
				
				case 3:
				that.s_amount = '1499.00';
				break;
			}
		}
		
			
		that.submit = function (form) {
            if (!form.$valid) {
               alert("not valid");
                return
            }
		
			$scope.handleStripe = function (status, response) {
				if (response.error) {
					// Invalid card
					swal({
						title: "Invalid Card Details!",
						showConfirmButton: true,
						type: "warning"
					});
				} else {
					// got stripe token, now charge it
					that.api.payment_call({"response": response, "type": that.s_type, "mode": 'live', "pay_for": 'setup'}).then(function (res) {
						if (res.data.data.payment == "done") {
							SweetAlert.swal({
								title: "Payment Successful!",
								type: "success",
								text: "Please check your email for receipt. You may now begin connecting your POS.",
								confirmButtonColor: "#337ab7",
								confirmButtonText: "OK"
							},
							function (res1) {
								$state.go('administrator.posSync');
								return;
							});
						}
						else if(res.data.data.payment == "error"){
							swal({
								title: "Check Card Details!",
								showConfirmButton: true,
								type: "warning"
							});
						}
						else{
							swal({
								title: "Oops! Something went wrong, please try again.",
								showConfirmButton: true,
								type: "warning"
							});
						}
					});
				}
			};
		}
		
        that.$onInit = function () {
			that.page = 1;
			that.s_type = null;
        };
    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$rootScope', '$scope', 'SweetAlert', 'alertService', 'restaurant', 'core'];

    angular.module('inspinia').component('support', {
        templateUrl: 'js/components/customerSupport/customerSupport.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
