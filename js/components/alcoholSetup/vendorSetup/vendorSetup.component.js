(function () {
    'use strict';

    function modalController($uibModalInstance, vendor, global_Vendors, showPrimaryVendor, localStorageService, get_refbooks, api) {
        var that = this;

        that.form = {};
        that.api = api;
        that.get_refbooks = get_refbooks;
        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}
		that.vendor = vendor;
		that.global_Vendors = global_Vendors;
		that.showPrimaryVendor = showPrimaryVendor;
		
        that.model = {};

		that.is_add = that.vendor ? false : true;
		
        var initModel = function () {
			//console.log(that.vendor);
            that.model = {
				restaurant_id: that.vendor ? that.vendor.restaurant_id: null,
                vendor_name: that.vendor ? that.vendor.vendor_name: null,
				primary_vendor: that.vendor ? that.vendor.primary_vendor: null,
                vendor_type_id: that.vendor ? 2 : 2,
                address: that.vendor ? that.vendor.address: null,
                city: that.vendor ? that.vendor.city: null,
                state: that.vendor ? that.vendor.state: null,
                zip: that.vendor ? that.vendor.zip_code: null,
                sales_rep: that.vendor ? that.vendor.sales_rep: null,
				phone_number: that.vendor ? that.vendor.phone_number: null,
                primary_email: that.vendor ? that.vendor.primary_email: null,
				secondary_email_1: that.vendor ? that.vendor.secondary_email_1: null,
				secondary_email_2: that.vendor ? that.vendor.secondary_email_2: null,
                account_no: that.vendor ? that.vendor.account_no: null
            };
        };

        initModel();

        that.onZipChanged = function (z) {
            that.api.locations_lookup({search_for: z.toString()}).then(function (response) {
                if (response.data.data.locations.length) {
                    that.model.city = response.data.data.locations[0].clear_name;

                    for (var i = 0; that.get_refbooks.country_states.length > i; i++) {
                        if (response.data.data.locations[0].state_geoname_id === that.get_refbooks.country_states[i].geoname_id) {
                            that.model.state = that.get_refbooks.country_states[i].state;
                            break;
                        }
                    }
                }
            },
            function (error) {
                console.log('error');
            });
        };

        that.submit = function (form) {

            if (!form.$valid) {
                return
            }

            //console.log(that.model);			
			
            var m = {
                restaurant_id: that.restaurant_id.restaurant_id,
                vendor_details: []
            };
			
			m.vendor_details.push({
                    vendor_name: that.model.vendor_name,
					primary_vendor: that.model.primary_vendor,
                    vendor_type_id: that.model.vendor_type_id,
                    address: that.model.address,
                    city: that.model.city,
                    state: that.model.state,
                    zip_code: that.model.zip,
                    sales_rep: that.model.sales_rep,
					phone_number: that.model.phone_number,
                    primary_email: that.model.primary_email,
					secondary_email_1: that.model.secondary_email_1,
					secondary_email_2: that.model.secondary_email_2,
                    account_no: that.model.account_no
                });

            //console.log(m);

            if(that.vendor)
            {
                //update
                //console.log("in update", that.vendor.id);
                that.api.update_vendor_details(that.vendor.id, m).then(function (res) {
					//console.log(res);
                    try {
                        //console.log(res);
                        if (res.data.data.code === 1000) {
                          swal({
                            title: "Vendor updated successfully!",
                            timer: 1500,
                            showConfirmButton: false,
                            type: "success"
                          });

                          $uibModalInstance.close();
						  //getChosenVendors();
                        }
                    } catch (e) {
                        console.log(e)
                    }
                });
            }
            else {
            // create
            //console.log("in create");
            that.api.add_new_vendor(that.restaurant_id.restaurant_id, m).then(function (res) {
				//console.log(res);
                try {
                    if (res.data.data.code === 1000) {
                      swal({
                        title: "New Vendor added successfully!",
                        timer: 1500,
                        showConfirmButton: false,
                        type: "success"
                      });
					  //getChosenVendors();
                      $uibModalInstance.close();
                    }
                } catch (e) {
                    console.log(e)
                }
            });
          }
        };


        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

	var qt = function ($uibModalInstance) {
        var that = this;
		
		that.q_title = 'Vendor Setup Instructions';
						
		that.q_texts = '<article style="display: block;"><p><b>Add a New Vendor</b> – to add a new vendor you should first start a search for vendors by Name, City or Zip Code. If your search return a result you should first select the “Edit” button to view the vendor details to assure that you have an exact match. If you’re vendor matches, while in the edit section, be sure to add your sale rep name and account number.<br/><br/><b>Can’t locate your vendor?</b> Simply select the “Add a New Vendor” button on the right.<br/>From there you can manually enter all of your vendor details which includes name, address, phone number, account number and sale rep name.<br/><br/><b>Email Inventory Orders</b> – to email an inventory order you will need to include your sales rep email address. To add your sales rep email address simply locate your vendor and select “Edit”. Once inside the edit module you will see three email addresses. These email addresses are who your online orders will be delivered to. You may enter up to three email addresses.</p></article>';

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };
	
    function vendorSetupController(api, $state, auth, core, localStorageService, $uibModal, SweetAlert, $rootScope, restaurant, $window,$scope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.core = core;

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}
        //that.is_add = true;


        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

		
		$scope.SetUpStatus=0;
		if(restaurant.data.info){
			$scope.SetUpStatus = restaurant.data.info.is_setup_completed;
		}
		
		
        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        that.vendorList = [];
        that.vendorsSelected = [];
        that.searchModel = {
            order_by: null, // id, name, city, date, zip
            order_way: "DESC",  //ASC/DESC
            paginationOffset: 0, // 0 by default
            paginationCount: 25, //25 by default,
            inRequest: false,
            search_by: null,
            paginationTotal: 0,
            city: null,
            vendor_name: null,
            zip_code: null
        };
		
		that.checkEmpType = function () {
			that.user = {userid: null, user_type_id: null};
			that.user.userid = that.auth.authentication.user.id;
			that.showPrimaryVendor = false;
			if(that.user.userid == 1){
				that.showPrimaryVendor = true;
			}
		}

		that.showInfo = function () {
			//Quick tutorial
			var modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'quick_tutorial.html',
					controller: qt,
					controllerAs: 'qt',
					windowClass: "animated fadeIn modal-lgg",
					size: 'lg'
			});
			//Quick tutorial
		}

        that.addNewVendor = function (vendor) {
			
            var modalInstance = $uibModal.open({
                templateUrl: 'add_new_vendor.html',
                controller: modalController,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                resolve: {
					vendor: function () {
                        return vendor;
                    },
					global_Vendors: function () {
                        return that.global_Vendors;
                    },
                    get_refbooks: function () {
                        if (that.get_refbooks) return that.get_refbooks;
                        return that.core.getRefbooks().then(function (res) {
                            return that.get_refbooks = res;
                        })
                    },
					showPrimaryVendor: function () {
                        return that.showPrimaryVendor;
                    }
                }
            });

			
            modalInstance.result.then(function () {
				getChosenVendors();
				that.search();
            }, function () {
                getChosenVendors();
            });
        };
		
		that.editVendor = function (vendor) {
            that.api.get_vendor_by_id(vendor.id).then(function (res) {
				//console.log(vendor);
				var vd = res.data.data.vendordetails[0];
				vd['id'] = vendor.id;
				vd['restaurant_id'] = vendor.restaurant_id;
				that.addNewVendor(vd);
                //that.add(res.data.data.menus_list[0]);
            });
        };

        that.search = function (keyword) {

            that.searchModel.inRequest = true;

            var m = {
                vendor_type_id: 2, // 1 - alcohol 2 - food 3- all
                order_by: that.searchModel.order_by,
                order_way: that.searchModel.order_way,
                paginationOffset: that.searchModel.paginationOffset,
                paginationCount: that.searchModel.paginationCount,
                search_by: that.searchModel.search_by,
                city: that.searchModel.city,
                vendor_name: that.searchModel.vendor_name,
                zip_code: that.searchModel.zip_code
            };

            for (var i in m) {
                if (!m[i]) {
                    delete  m[i]
                }
            }

            if (keyword) {
                m.paginationOffset = 0;
                if (that.searchModel.order_by == keyword) {
                    that.searchModel.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC';
                    m.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC'
                } else {
                    that.searchModel.order_by = keyword;
                    m.order_by = keyword;
                }
            }
            if (m.paginationOffset > 0 && !keyword) {
                m.paginationOffset = (m.paginationOffset - 1) * m.paginationCount;
            }


            api.get_vendors(m).then(function (res) {
                try {
                    that.vendorList = res.data.data.vendors;
                    that.searchModel.paginationTotal = res.data.data.total;
                } catch (e) {
                    console.log(e);
                }
                that.searchModel.inRequest = false;
            }, function () {
                that.searchModel.inRequest = false;
            })
        };

        that.search();


        var getChosenVendors = function () {

            api.get_chosen_vendors(that.restaurant_id.restaurant_id, {vendor_type_id: 2}).then(function (res) {
                try {
                    that.vendorsSelected = res.data.data.vendors;
                } catch (e) {
                    console.log(e);
                }
            })
        };
		
		var getGlobalVendors = function () {

            api.get_global_vendors({vendor_type_id: 2}).then(function (res) {
                try {
                    that.global_Vendors = res.data.data.vendors;
					//console.log(that.global_Vendors);
                } catch (e) {
                    console.log(e);
                }
            })
        };


        that.addVendor = function (vendor) {

            var id = that.restaurant_id.restaurant_id;
            var m = {
                vendor_id: vendor.id,
                is_active: vendor.is_used,
                inventory_type_id: 2
            };
            that.api.add_vendor(id, m).then(getChosenVendors);

        };

        that.deleteVendor = function (vendor) {

            if (vendor.is_has_active_sku_uses == 1) {
                SweetAlert.swal({
                    title: '',
                    text: 'You can not delete the vendor, if he has any elements with historical data, or if elements are used in any menu. Instead, you can disable the provider, but first remove all the items belonging to the supplier, which are associated with the menu.',
                    type: "warning",
                    confirmButtonColor: "#DD6B55"
                });
                return;
            }

            var id = that.restaurant_id.restaurant_id;
            var m = {
                vendor_id: vendor.id,
                is_active: 0,
                inventory_type_id: 2
            };
            that.api.add_vendor(id, m).then(function () {
                getChosenVendors();
                that.search();
            });

        };

        that.next = function () {

            if (that.vendorsSelected.length) {
                $state.go('alcoholSetup.inventory');
                return;
            }

            SweetAlert.swal({
                title: 'At first select vendors',
                showConfirmButton: false,
                type: "error",
                timer: 2000
            });
        };


        that.$onInit = function () {
			Promise.all([that.checkEmpType()]).then(function(response) {
				getChosenVendors();
				getGlobalVendors();
			});
        };
    }

    vendorSetupController.$inject = ['api', '$state', 'auth', 'core', 'localStorageService', '$uibModal', 'SweetAlert', '$rootScope', 'restaurant', '$window','$scope'];

    angular.module('inspinia').component('alcoholVendorSetupComponent', {
        templateUrl: 'js/components/alcoholSetup/vendorSetup/vendorSetup.html',
        controller: vendorSetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
