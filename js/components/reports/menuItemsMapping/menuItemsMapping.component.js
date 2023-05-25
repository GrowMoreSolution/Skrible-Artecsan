(function () {
    'use strict';

    function menuItemsMappingController(api, $state, auth, localStorageService, restaurant, $rootScope, SweetAlert) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.base_api_url = appConfig.apiDomain;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.items = [];
        that.posSyncList = [];
        that.menus = [];		

        $rootScope.$on('restaurantSelected', function () {
            that.pos_id = $state.params.pos_id || restaurant.data.info.pos_id;
            that.permissions = restaurant.data.permissions;
        });

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }
		
		that.subscription_type_id = restaurant.data.info.subscription_type_id;
		that.employees_list = restaurant.data.info.employees;
							
		for (var i = 0; that.employees_list.length > i; i++) {
			if(that.employees_list[i].id == auth.authentication.user.id){
				that.emp_id = that.employees_list[i].type_ids;
			}
		}
		if(auth.authentication.user.id == 1){	//SU
			that.emp_id = 1;
		}
		
		if(that.subscription_type_id == 1 || that.subscription_type_id == 5){
			that.moveto_categories = ['Alcohol', 'Alcohol_Mods', 'Other', 'Archived'];
		}
		else if (that.subscription_type_id == 2 || that.subscription_type_id == 6){
			that.moveto_categories = ['Food', 'Food_Mods', 'Other', 'Archived'];
		}
		else if (that.subscription_type_id == 3 || that.subscription_type_id == 7){
			if(that.emp_id == 4){
				that.moveto_categories = ['Alcohol', 'Alcohol_Mods', 'Other', 'Archived'];
			}
			else if (that.emp_id == 3){
				that.moveto_categories = ['Food', 'Food_Mods', 'Other', 'Archived'];
			}
			else{
				that.moveto_categories = ['Alcohol', 'Alcohol_Mods', 'Food_Mods', 'Food', 'Other', 'Archived'];
			}
		}
		that.current_moveto = [];		
		
		
        that.searchModel = {
            is_active: '1',
			category: that.moveto_categories[0],//$state.params.type ? $state.params.type : 'Alcohol',
            list_type: 'sold_items',
            paginationCount: 25,
            paginationOffset: 0,
            total: 0,
            isDisabledBtn: true
        };
									
		that.getMenus = function() {
			if(that.searchModel.category == 'Alcohol' || that.searchModel.category == 'Alcohol_Mods' || that.searchModel.category == 'Food' || that.searchModel.category == 'Food_Mods'){
				that.api.get_menus({update_price: false, inventory_type_id: that.searchModel.category == 'Alcohol' || that.searchModel.category == 'Alcohol_Mods' ? 2 : 1}).then(function (res) {
					that.menus = JSON.parse(JSON.stringify(res.data.data.menus_list));
					that.menus.unshift({id: null, menu_item_name: '--Unmapped--', pricing_level: ''});
					/*that.menus = [{}];
					that.menus[0].id = null;
					that.menus[0].custom_name = '';
					var mi = 1;
					for (var i=0; i<res.data.data.menus_list.length; i++) {
						if((that.searchModel.category == 'Alcohol' || that.searchModel.category == 'Alcohol_Mods') && res.data.data.menus_list[i].inventory_type_id == 2){
							that.menus[mi] = res.data.data.menus_list[i];
							that.menus[mi++].custom_name = res.data.data.menus_list[i].menu_item_name + " (" + res.data.data.menus_list[i].pricing_level + ")";
						}
						else if((that.searchModel.category == 'Food' || that.searchModel.category == 'Food_Mods') && res.data.data.menus_list[i].inventory_type_id == 1){
							that.menus[mi] = res.data.data.menus_list[i];
							that.menus[mi++].custom_name = res.data.data.menus_list[i].menu_item_name + " (" + res.data.data.menus_list[i].pricing_level + ")";
						}
						//else if(that.searchModel.category == 'Archived'){
						//	that.menus[mi] = res.data.data.menus_list[i];
						//	that.menus[mi++].custom_name = res.data.data.menus_list[i].menu_item_name + " (" + res.data.data.menus_list[i].pricing_level + ")";
						//}
						
					}*/
				});
			}
		}

		that.changeMoveTo = function () {
			that.current_moveto = [''];
			for(var i=0; i<that.moveto_categories.length; i++){
				if(that.moveto_categories[i] != that.searchModel.category){
					that.current_moveto.push(that.moveto_categories[i]);
				}
			}
		}
		
		that.checkMoveRules = function (item) {
			
			if(item.moveto == ''){
				return;
			}
			
			//console.log(item);
			var m = {
                matched_items: [{
                    id: item.id,
					src: that.searchModel.category,
					dest: item.moveto
                }]
            };

            that.api.change_mapping_category(that.restaurant_id.restaurant_id, m).then(function (res) {
				if(res){
					//console.log(res);
					if(res.data.report_items.action_id_stack[0].action_id == 0){
						SweetAlert.swal({
                            title: "Item moved successfully!",
                            timer: 1000,
                            showConfirmButton: false,
                            type: "success"
                          });
						  that.getItems(false);
					}
					else if(res.data.report_items.action_id_stack[0].action_id == 1){
						SweetAlert.swal({
							title: "Please unmap the item first!",
							timer: 1000,
							showConfirmButton: false,
							type: "warning"
						  });
					}
			}});
		}
		
        that.getItems = function (is_cat_change) {
			
			that.changeMoveTo();
			
            that.searchModel.inRequest = true;

            var m = {
                is_active: that.searchModel.category == 'Archived' ? 0 : that.searchModel.is_active,
				category: that.searchModel.category,
                list_type: that.searchModel.list_type,
                paginationOffset: that.searchModel.paginationOffset,
                paginationCount: that.searchModel.paginationCount

            };

            if (m.paginationOffset > 0) {
                m.paginationOffset = (m.paginationOffset - 1) * m.paginationCount;
            }

			//console.log(m);
            that.api.getItemsForMap(that.restaurant_id.restaurant_id, m).then(function (res) {
                that.items = res.data.data.report_items;
				for(var i=0; i<that.items.length; i++){
					that.items[i].moveto = '';
				}
                that.searchModel.total = res.data.data.total; // TODO
				if(is_cat_change){
					that.getMenus();
				}
            });
        };

        that.setMenuItemId = function (item, cat) {
			//console.log(cat, that.searchModel.category);
            var m = {
                matched_items: [{
                    id: item.id,
                    name: item.name,
                    focus_item_id: item.focus_item_id,
                    menu_item_id: item.menu_item_id,
                    is_active: item.is_active
                }]
            };

            that.api.setItemsForMap(that.restaurant_id.restaurant_id, m).then(function (res) {
				if(res){
					SweetAlert.swal({
                            title: "Mapping saved successfully!",
                            timer: 500,
                            showConfirmButton: false,
                            type: "success"
                          });
				}

            }, that.getItems(false));
        };

		that.unmapItem = function (item, cat) {
			//console.log(cat, that.searchModel.category);
			item.menu_item_id = null;
            var m = {
                matched_items: [{
                    id: item.id,
                    name: item.name,
                    focus_item_id: item.focus_item_id,
                    menu_item_id: item.menu_item_id,
                    is_active: item.is_active
                }]
            };

            that.api.setItemsForMap(that.restaurant_id.restaurant_id, m).then(function (res) {
				if(res){
					SweetAlert.swal({
                            title: "Unmapped successfully!",
                            timer: 500,
                            showConfirmButton: false,
                            type: "success"
                          });
				}

            }//, that.getItems(false)
			);
        };
		
        that.checkAll = function (val) {

            if (val == true) {
                that.searchModel.isDisabledBtn = false;
            } else {
                that.searchModel.isDisabledBtn = true;
            }

            for (var i = 0; that.items.length > i; i++) {
                that.items[i].isChecked = val;
            }
        };

        that.isDisabledBtn = function (item) {
            if (item.isChecked == true) {
                that.searchModel.isDisabledBtn = false;
            } else {
                that.searchModel.isDisabledBtn = true;
            }
        };

		that.getMenuName = function(menu_opn){
			if(menu_opn.id == null){
				return '';
			}
			else{
				return menu_opn.menu_item_name+' ('+menu_opn.pricing_level+')';
			}
		}
		
		that.criteriaMatch = function(item_pattern){
			return function( menu_item ) {
				return (menu_item.menu_item_name.toLowerCase().indexOf(item_pattern.toLowerCase().split('_')[0]) != -1);
			};
		}
		
        that.moveChecked = function () {

            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "All selected items will be moved to the selected categories",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ed5565",
                    confirmButtonText: "Confirm"
                },
                function (res) {
                    if (res) {
                        var itemsIsArchived = {};
                        itemsIsArchived['matched_items'] = [];

                        for (var i = 0; that.items.length > i; i++) {
                            if (/*that.items[i].isChecked === true && */that.items[i].moveto != '') {
								//console.log(that.items[i]);
                                itemsIsArchived["matched_items"].push({
                                    id: that.items[i].id,
									src: that.searchModel.category,
									dest: that.items[i].moveto
                                });
                            }
                        }

						if(itemsIsArchived['matched_items'].length > 0){
							that.api.change_mapping_category(that.restaurant_id.restaurant_id, itemsIsArchived).then(function (res) {
								if(res && (res.data.report_items.action_id_stack.length == itemsIsArchived["matched_items"].length)){
									//console.log(res);
									var need_um = false;
									for(var i=0; i<res.data.report_items.action_id_stack.length; i++){
										if(res.data.report_items.action_id_stack[i].action_id == 1){
											need_um = true;
											break;
										}
									}
									
									if(!need_um){
										SweetAlert.swal({
											title: "Item(s) moved successfully!",
											timer: 1000,
											showConfirmButton: false,
											type: "success"
										  });
										  that.getItems(false);
									}
									else if(need_um){
										SweetAlert.swal({
											title: "One or more items need to be unmapped first!",
											timer: 1000,
											showConfirmButton: false,
											type: "warning"
										  });
									}
							}});
						
						}
                    }
                });


        };
		
        that.$onInit = function () {
			that.getItems(true);
        }


    }

    menuItemsMappingController.$inject = ['api', '$state', 'auth', 'localStorageService', 'restaurant', '$rootScope', 'SweetAlert'];

    angular.module('inspinia').component('menuItemsMappingComponent', {
        templateUrl: 'js/components/reports/menuItemsMapping/menuItemsMapping.html',
        controller: menuItemsMappingController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
