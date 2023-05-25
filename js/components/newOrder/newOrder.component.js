(function () {

    'use strict';

	
	function modalController($uibModalInstance, global_Vendors, inventory_type_id, localStorageService, get_refbooks, api) {
        var that = this;

        that.form = {};
        that.api = api;
        that.get_refbooks = get_refbooks;
        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}
		that.global_Vendors = global_Vendors;
		that.inventory_type_id = inventory_type_id;
        that.model = {};
		
        var initModel = function () {
            that.model = {
				restaurant_id: null,
                vendor_name: null,
				primary_vendor: null,
                vendor_type_id: that.inventory_type_id,
                address: null,
                city: null,
                state: null,
                zip: null,
                sales_rep: null,
                primary_email: null,
				secondary_email_1: null,
				secondary_email_2: null,
                account_no: null
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
                    primary_email: that.model.primary_email,
					secondary_email_1: that.model.secondary_email_1,
					secondary_email_2: that.model.secondary_email_2,
                    account_no: that.model.account_no
                });

            // create
            that.api.add_new_vendor(that.restaurant_id.restaurant_id, m).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                      swal({
                        title: "New Vendor added successfully!",
                        timer: 1500,
                        showConfirmButton: false,
                        type: "success"
                      });
                      $uibModalInstance.close();
                    }
                } catch (e) {
                    console.log(e)
                }
            });
        };


        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
	
	var qt = function ($uibModalInstance, isFood, isEdit) {
        var that = this;
		
		if(isFood){
			if(isEdit){
				that.q_title = 'Confirm Food Delivery Instructions';
				that.q_texts = '<article style="display: block;"><p><b>Confirm Food Delivery Edit Screen</b> – you may modify your orders here to match your invoice or make corrects. Here you may change the Order Quantity, Order Type, Case Size and Item Cost. You may also remove an item completely or add a new item<br/><br/><b>Adding a New Item</b> – Select the + symbol to create a new line item. Note: The vendor has to be the same. Once the new item is added you must approve the item the select Confirm and Save<br/><br/><b>Delete</b> – To remove an item you much first unapproved the item then select Delete and finally Confirm and Save<br/><br/><b>Modify Case Size</b> – Check the box next to the case size that you would like to change. We do not recommend changing the case size but instead, change your order size.<br/><br/><b>Modify Item Cost</b> – Check the box next to the item cost then enter in the correct cost. Select Confirm and Save</p></article>';
			}
			else{
				that.q_title = 'New Food Order Instructions';
				that.q_texts = '<article style="display: block;"><p><b>New Food Order</b> – Here is where you will generate your orders which can be automatically delivered to your sales rep email<br/><br/><b>Vendor</b> – Select the vendor from the drop down list. You may select multiple vendors and the final order will be sorted and delivered by vendors<br/><br/><b>Item Description</b> – Each vendor has their own unique items<br/><br/><b>Units on Hand</b> – The theoretical amount of inventory that you should have on-hand as of the start of the current business day. The categories are Case, Packs, Units and Order Type<br/><br/><b>Actual</b> – This is where you will enter the desired order amount and Order Type<br/><br/><b>Approve</b> – You must approve each item or it will not be processed<br/><br/><b>Confirm and Send</b> – This will send your order to the email addresses you included in the vendors setup file which should include your sales rep email address.<br/><br/><b>Confirm and Save</b> – This will save and process the order but will not send it</p></article>';
			}
		}
		else{
			if(isEdit){
				that.q_title = 'Confirm Alcohol Delivery Instructions';
				that.q_texts = '<article style="display: block;"><p><b>Confirm Alcohol Delivery Edit Screen</b> – you may modify your orders here to match your invoice or make corrects. Here you may change the Order Quantity, Order Type, Case Size and Item Cost. You may also remove an item completely or add a new item<br/><br/><b>Adding a New Item</b> – Select the + symbol to create a new line item. Note: The vendor has to be the same. Once the new item is added you must approve the item the select Confirm and Save<br/><br/><b>Delete</b> – To remove an item you much first unapproved the item then select Delete and finally Confirm and Save<br/><br/><b>Modify Item Cost</b> – Check the box next to the item cost then enter in the correct cost. Select Confirm and Save</p></article>';
			}
			else{
				that.q_title = 'New Alcohol Order Instructions';
				that.q_texts = '<article style="display: block;"><p><b>New Alcohol Order</b> – Here is where you will generate your orders which can be automatically delivered to your sales rep email<br/><br/><b>Vendor</b> – Select the vendor from the drop down list. You may select multiple vendors and the final order will be sorted and delivered by vendors<br/><br/><b>Item Description</b> – Each vendor has their own unique items<br/><br/><b>Units on Hand</b> – The theoretical amount of inventory that you should have on-hand as of the start of the current business day.<br/><br/><b>Actual</b> – This is where you will enter the desired order amount and Order Type<br/><br/><b>Approve</b> – You must approve each item or it will not be processed<br/><br/><b>Confirm and Send</b> – This will send your order to the email addresses you included in the vendors setup file which should include your sales rep email address.<br/><br/><b>Confirm and Save</b> – This will save and process the order but will not send it<br/><br/>TIP: Do not include deposits as part of your cost. For example – many keg vendors will charge a refundable keg deposit which is not apart of your true cost. If you add it to your cost it will sku your pricing, cost and budget.</p></article>';
			}
		}

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };
	
	function newFoodItem_modalController($uibModalInstance, $state, alertService, restaurant_id, vendor_id, inventory_type_id, api, core, SweetAlert, $q) {
		var that = this;
		that.$state = $state;
		
        that.form = {};
        that.uniqueItem = [];

        that.categories = [];
        that.sub_categories = [];


        core.getRefbooks().then(function (res) {
            that.deliveryMeasure = res.measurement_units_of_delivery;
            that.categories = res.vendor_cat;
            that.sub_categories = res.vendor_sub_cat;
        });


        that.api = api;

        that.model = {};


        that.sku_lookup = function (search_for) {
            return that.api.sku_lookup({search_for: search_for, vendor_id: vendor_id}).then(function (res) {
                return res.data.data.sku.slice(0, 10);
            })

        };

        that.submit = function (form) {

            var deferred = $q.defer();

            if (!form.$valid) {
                alertService.showError('Please validate all inputs');
                deferred.reject();
                return deferred.promise;
            }

            if (!that.uniqueItem.length) {
                alertService.showError('Please, add at least one item');
                deferred.reject();
                return deferred.promise;
            }

			if(that.uniqueItem[0].vendor_sku != null && that.uniqueItem[0].vendor_sku.length){
				that.api.validateSKU({sku: that.uniqueItem[0].vendor_sku, vendor_id: vendor_id}).then(function (res) {
					if(res.data.data.sku_status.length && res.data.data.sku_status[0].sku_status == 'used'){
						alertService.showError('SKU already used!');
						return;
					}
					else{
						var id = vendor_id;

						var m = {
							inventory_type_id: 1,
							sku_items: []
						};

						for (var i = 0; that.uniqueItem.length > i; i++) {
							m.sku_items.push({
								substitute_for: that.uniqueItem[i].substitute_for ? that.uniqueItem[i].substitute_for : null,
								vendor_sku: that.uniqueItem[i].vendor_sku,
								pack: that.uniqueItem[i].pack,
								size: that.uniqueItem[i].size,
								total_unit_size: that.uniqueItem[i].pack * that.uniqueItem[i].size,
								uom_id_of_delivery_unit: that.uniqueItem[i].uom_id_of_delivery_unit,
								brand: 'No Brand',
								brand_id: 1,
								item_name: that.uniqueItem[i].item_name,
								vendor_cat_id: that.uniqueItem[i].vendor_cat_id,
								vendor_sub_cat_id: that.uniqueItem[i].vendor_sub_cat_id,
								yield: 1,
								price: that.uniqueItem[i].case_cost,
								minimum_order_type: that.uniqueItem[i].minimum_order_type,
								is_active: that.uniqueItem[i].is_active,
								id: that.uniqueItem[i].id
							})
						}

						that.api.add_update_own_inventory(id, m).then(function (res) {
							if (res.data.data.code === 1000) {
								alertService.showAlertSave();
								deferred.resolve();
								$uibModalInstance.dismiss('cancel');
							}
						});

						return deferred.promise;
					}
				});
			}
        };
		
		that.apply_values = function ($item) {
			that.src =  $item.src;
			that.uniqueItem[0].vendor_sku = $item.vendor_sku;
			that.uniqueItem[0].item_name = $item.item_name;
			that.uniqueItem[0].vendor_cat_id = $item.vendor_cat_id;
			that.uniqueItem[0].vendor_sub_cat_id = $item.vendor_sub_cat_id;
			that.uniqueItem[0].uom_id_of_delivery_unit = $item.uom_id_of_delivery_unit;
			that.uniqueItem[0].pack = $item.pack;
			that.uniqueItem[0].size = $item.size;
			that.uniqueItem[0].case_cost = $item.case_cost;
			that.uniqueItem[0].minimum_order_type = $item.minimum_order_type;
			that.uniqueItem[0].substitute_for = $item.substitute_for;
			that.filterItems();
		}
		
        that.addUniqueItem = function () {

            that.uniqueItem.push({
                vendor_sku: null,
                pack: null,
                uom_id_of_delivery_unit: null,
                item_name: null,
                vendor_cat_id: that.categories.length ? that.categories[0].id : null,
                vendor_sub_cat_id: that.sub_categories.length ? that.sub_categories[0].id : null,
                is_active: 1,
                size: null,
                case_cost: null,
                minimum_order_type: 'Case',
                id: null,
				substitute_for: null
            })
        };
		
		that.filterItems = function () {
			that.inventoryListSelected = [];
			for(var i =0; i< that.inventoryItems.length; i++){
				if(that.inventoryItems[i].substitute_for == null && that.inventoryItems[i].vendor_cat_id == that.uniqueItem[0].vendor_cat_id &&
					(((that.uniqueItem[0].uom_id_of_delivery_unit == 10 || that.uniqueItem[0].uom_id_of_delivery_unit == 11 || that.uniqueItem[0].uom_id_of_delivery_unit == 12 || that.uniqueItem[0].uom_id_of_delivery_unit == 13 || that.uniqueItem[0].uom_id_of_delivery_unit == 16 || that.uniqueItem[0].uom_id_of_delivery_unit == 17 || that.uniqueItem[0].uom_id_of_delivery_unit == 18) && (that.inventoryItems[i].uom_id_of_delivery_unit == 10 || that.inventoryItems[i].uom_id_of_delivery_unit == 11 || that.inventoryItems[i].uom_id_of_delivery_unit == 12 || that.inventoryItems[i].uom_id_of_delivery_unit == 13 || that.inventoryItems[i].uom_id_of_delivery_unit == 16 || that.inventoryItems[i].uom_id_of_delivery_unit == 17 || that.inventoryItems[i].uom_id_of_delivery_unit == 18)) || ((that.uniqueItem[0].uom_id_of_delivery_unit == 5 || that.uniqueItem[0].uom_id_of_delivery_unit == 14 || that.uniqueItem[0].uom_id_of_delivery_unit == 15 || that.uniqueItem[0].uom_id_of_delivery_unit == 19) && (that.inventoryItems[i].uom_id_of_delivery_unit == 5 || that.inventoryItems[i].uom_id_of_delivery_unit == 14 || that.inventoryItems[i].uom_id_of_delivery_unit == 15 || that.inventoryItems[i].uom_id_of_delivery_unit == 19)) || ((that.uniqueItem[0].uom_id_of_delivery_unit == 1 || that.uniqueItem[0].uom_id_of_delivery_unit == 2 || that.uniqueItem[0].uom_id_of_delivery_unit == 3 || that.uniqueItem[0].uom_id_of_delivery_unit == 4 || that.uniqueItem[0].uom_id_of_delivery_unit == 5 || that.uniqueItem[0].uom_id_of_delivery_unit == 8) && (that.inventoryItems[i].uom_id_of_delivery_unit == 1 || that.inventoryItems[i].uom_id_of_delivery_unit == 2 || that.inventoryItems[i].uom_id_of_delivery_unit == 3 || that.inventoryItems[i].uom_id_of_delivery_unit == 4 || that.inventoryItems[i].uom_id_of_delivery_unit == 5 || that.inventoryItems[i].uom_id_of_delivery_unit == 8)))
					){
					that.inventoryListSelected.push(that.inventoryItems[i]);
				}
			}
			if(that.inventoryListSelected.length){
				var first = JSON.stringify(that.inventoryListSelected[0]);
				that.inventoryListSelected.unshift(JSON.parse(first));
				that.inventoryListSelected[0]['id'] = null;
				that.inventoryListSelected[0]['vendor_name'] = '--No selection--';
				that.inventoryListSelected[0]['item_name'] = '--No selection--';
			}
			else{
				that.inventoryListSelected.push({});
				that.inventoryListSelected[0]['id'] = null;
				that.inventoryListSelected[0]['vendor_name'] = '--No selection--';
				that.inventoryListSelected[0]['item_name'] = '--No selection--';
			}
        };
		
		that.getInventoriesByVendor = function () {
            that.api.get_active_inventory_by_vendor({
                inventory_type_id: 1,
				caller: 'sub_list'
            }, restaurant_id).then(function (res) {
                that.inventoryItems = res.data.data.sku;
				that.filterItems();
            });
        };
		
		that.addUniqueItem();
		that.getInventoriesByVendor();
		
		that.clear = function () {
			that.src =  '';
			that.uniqueItem = [];
			that.uniqueItem.push({
                vendor_sku: null,
                pack: null,
                uom_id_of_delivery_unit: null,
                item_name: null,
                vendor_cat_id: null,
                vendor_sub_cat_id: null,
                is_active: 1,
                size: null,
                case_cost: null,
                minimum_order_type: 'Case',
                id: null,
				substitute_for: null
            });
		}
		
        that.cancel = function () {
			$uibModalInstance.dismiss('cancel');
        };
    }
	
	function newAlcoholItem_modalController($uibModalInstance, alertService, api, core, restaurant_id, vendor_id, inventory_type_id, SweetAlert, $q) {
        var that = this;

        that.form = {};
        that.uniqueItem = [];

        that.categories = [];
        that.sub_categories = [];


        core.getRefbooks().then(function (res) {
            that.refbooks = res;
            that.categories = res.vendor_cat;
            that.sub_categories = res.vendor_sub_cat;
        });

        that.api = api;

        that.model = {};
		that.src = '';
		
		that.sku_lookup = function (search_for) {
            return that.api.sku_lookup({search_for: search_for, vendor_id: vendor_id}).then(function (res) {
                return res.data.data.sku.slice(0, 10);
            })

        };
		
		that.item_name_lookup = function (search_for) {
            return that.api.item_name_lookup({search_for: search_for, vendor_id: vendor_id}).then(function (res) {
                return res.data.data.name;
            })

        };
		
        that.submit = function (form) {
            var deferred = $q.defer();

            if (!form.$valid) {
                alertService.showError('Please validate all inputs');
                deferred.reject();
                return deferred.promise;
            }

            if (!that.uniqueItem.length) {
                alertService.showError('Please, add at least one item');
                deferred.reject();
                return deferred.promise;
            }

			if(that.uniqueItem[0].vendor_sku != null && that.uniqueItem[0].vendor_sku.length){
				that.api.validateSKU({sku: that.uniqueItem[0].vendor_sku, vendor_id: vendor_id}).then(function (res) {
					if(res.data.data.sku_status.length && res.data.data.sku_status[0].sku_status == 'used'){
						alertService.showError('SKU already used!');
						return;
					}
					else{
						var id = vendor_id;

						var m = {
							inventory_type_id: 2,
							sku_items: []
						};

						for (var i = 0; that.uniqueItem.length > i; i++) {

							m.sku_items.push({
								substitute_for: that.uniqueItem[i].substitute_for ? that.uniqueItem[i].substitute_for : null,
								item_name: that.uniqueItem[i].item_name,
								tare_type_id: that.uniqueItem[i].tare_type_id,  //tare_type_id, refbooks
								size: that.uniqueItem[i].content_weight || that.uniqueItem[i].size || 1,
								content_weight: that.uniqueItem[i].content_weight || that.uniqueItem[i].size || 1,
								full_weight: that.uniqueItem[i].full_weight,
								tare_weight: that.uniqueItem[i].tare_weight,
								total_unit_size: that.uniqueItem[i].case_qty * that.uniqueItem[i].pack * (that.uniqueItem[i].content_weight || that.uniqueItem[i].size || 1),
								manufacturer: that.uniqueItem[i].manufacturer,
								vendor_sku: that.uniqueItem[i].vendor_sku,
								case_qty: that.uniqueItem[i].case_qty,
								pack: that.uniqueItem[i].pack,
								price: that.uniqueItem[i].minimum_order_type == 'Case' ? that.uniqueItem[i].case_cost : that.uniqueItem[i].pack_cost,
								vendor_cat_id: that.uniqueItem[i].vendor_cat_id,
								uom_id_of_delivery_unit: 5,
								vendor_sub_cat_id: that.uniqueItem[i].vendor_sub_cat_id,
								is_active: that.uniqueItem[i].is_active,
								minimum_order_type: that.uniqueItem[i].minimum_order_type,
								id: that.uniqueItem[i].id
							});


						}

						that.api.add_update_own_inventory(id, m).then(function (res) {
							if (res.data.data.code === 1000) {
								alertService.showAlertSave();
								deferred.resolve();
								$uibModalInstance.dismiss('cancel');
							}
						});

						return deferred.promise;
					}
				});
			}
        };

		that.apply_values = function ($item) {
			that.src =  $item.src;
			that.uniqueItem[0].vendor_sku = $item.vendor_sku;
			that.uniqueItem[0].item_name = $item.item_name;
			that.uniqueItem[0].vendor_cat_id = $item.vendor_cat_id;
			that.changeMOT(0);
			that.uniqueItem[0].vendor_sub_cat_id = $item.vendor_sub_cat_id;
			that.uniqueItem[0].tare_type_id = $item.tare_type_id;
			that.uniqueItem[0].full_weight = $item.full_weight;
			that.uniqueItem[0].pack = $item.pack;
			that.uniqueItem[0].case_cost = $item.case_cost;
			that.uniqueItem[0].pack_cost = $item.pack_cost;
			that.setWeights(0, $item.vendor_cat_id, $item.vendor_sub_cat_id, $item.tare_type_id);
			that.calculate(0);
			that.uniqueItem[0].substitute_for = $item.substitute_for;
		}
		
        that.getSizes = function (cat_id, sub_cat_id) {
            if (!cat_id && !sub_cat_id) return [];
            var _a = [];

            for (var i = 0; that.refbooks.default_weights.length > i; i++) {

                if (that.refbooks.default_weights[i].vendor_cat_id === cat_id && that.refbooks.default_weights[i].vendor_sub_cat_id === sub_cat_id) {
                    for (var j = 0; that.refbooks.tare_types.length > j; j++) {
                        if (that.refbooks.tare_types[j].tare_type_id === that.refbooks.default_weights[i].tare_type_id) {

                            if (_a.indexOf(that.refbooks.tare_types[j]) === -1) {
                                _a.push(that.refbooks.tare_types[j])
                            }
                        }
                    }
                }
            }

            return _a;
        };

        that.calculate = function ($index) {
            var t = that.uniqueItem[$index].pack || 1;
            var u = that.uniqueItem[$index].pack_cost || 1;
            var s = 1;
            var c = that.uniqueItem[$index].case_qty || 1;
            that.uniqueItem[$index].case_cost = parseFloat((t * u * s * c).toFixed(2));
        };

        that.setWeights = function ($index, cat_id, sub_cat_id, tare_type_id) {
			//that.uniqueItem[$index].full_weight = null;

            for (var i = 0; that.refbooks.default_weights.length > i; i++) {

                if (that.refbooks.default_weights[i].vendor_sub_cat_id === sub_cat_id
                    && that.refbooks.default_weights[i].vendor_cat_id === cat_id
                    && that.refbooks.default_weights[i].tare_type_id === tare_type_id) {

                    var f = (that.uniqueItem[$index].vendor_cat_id === 71) ? that.refbooks.default_weights[i].full_weight : that.uniqueItem[$index].full_weight;
                    var c = that.refbooks.default_weights[i].content_weight;

                    that.uniqueItem[$index].tare_weight = (f - c) || 0;
                    that.uniqueItem[$index].content_weight = c;
					
					// for Non Alcoholic only, do an additional conversion to Oz
					if(that.uniqueItem[$index].vendor_cat_id === 76){
						that.uniqueItem[$index].tare_weight = 0;
						that.uniqueItem[$index].content_weight = f * c;
					}
                }
            }
			
			if ((cat_id && sub_cat_id) && (cat_id == 74 || cat_id == 75 || cat_id == 99))
			{
				for (var i = 0; that.refbooks.default_weights.length > i; i++) {
					if (that.refbooks.default_weights[i].vendor_cat_id === cat_id && that.refbooks.default_weights[i].vendor_sub_cat_id === sub_cat_id && that.refbooks.default_weights[i].tare_type_id === tare_type_id) {
						that.uniqueItem[$index].full_weight = that.refbooks.default_weights[i].full_weight;
						that.uniqueItem[$index].tare_weight = that.refbooks.default_weights[i].tare_weight;
						that.uniqueItem[$index].content_weight = that.refbooks.default_weights[i].content_weight;
						break;
					}
				}
			}
        };

        that.addUniqueItem = function () {

            that.uniqueItem.push({
                item_name: null,
                size: null,
                full_weight: null,
                content_weight: null,
                tare_weight: null,
                manufacturer: null,
                vendor_sku: null,
                case_qty: 1,
                total_unit_size: null,
                price: null,
                pack_cost: null,
                vendor_cat_id: that.categories.length ? that.categories[0].id : null,
                uom_id_of_delivery_unit: 5,
                vendor_sub_cat_id: that.sub_categories.length ? that.sub_categories[0].id : null,
                is_active: 1,
                minimum_order_type: 'Pack',
                id: null,
				substitute_for: null
            })
        };
		
		that.filterItems = function () {
			that.inventoryListSelected = [];
			for(var i =0; i< that.inventoryItems.length; i++){
				if(that.inventoryItems[i].substitute_for == null && that.inventoryItems[i].vendor_cat_id == that.uniqueItem[0].vendor_cat_id){
					that.inventoryListSelected.push(that.inventoryItems[i]);
				}
			}
			if(that.inventoryListSelected.length){
				var first = JSON.stringify(that.inventoryListSelected[0]);
				that.inventoryListSelected.unshift(JSON.parse(first));
				that.inventoryListSelected[0]['id'] = null;
				that.inventoryListSelected[0]['vendor_name'] = '--No selection--';
				that.inventoryListSelected[0]['item_name'] = '--No selection--';
			}
			else{
				that.inventoryListSelected.push({});
				that.inventoryListSelected[0]['id'] = null;
				that.inventoryListSelected[0]['vendor_name'] = '--No selection--';
				that.inventoryListSelected[0]['item_name'] = '--No selection--';
			}
        };
		
		that.getInventoriesByVendor = function () {
            that.api.get_active_inventory_by_vendor({
                inventory_type_id: 2,
				caller: 'sub_list'
            }, restaurant_id).then(function (res) {
                that.inventoryItems = res.data.data.sku;
				that.filterItems();
            });
        };
		
		that.changeMOT = function ($index) {
			that.uniqueItem[$index].full_weight = null;
			if(that.uniqueItem[$index].vendor_cat_id == 74){
				that.uniqueItem[$index].minimum_order_type = 'Case';
			}
			else{
				that.uniqueItem[$index].minimum_order_type = 'Pack';
			}
			that.filterItems();
		}

        that.addUniqueItem();
		that.getInventoriesByVendor();
		
		that.clear = function () {
			that.uniqueItem = [];
			that.uniqueItem.push({
                vendor_sku: null,
                pack: null,
                uom_id_of_delivery_unit: null,
                item_name: null,
                vendor_cat_id: null,
                vendor_sub_cat_id: null,
                is_active: 1,
                size: null,
                case_cost: null,
                minimum_order_type: 'Case',
                id: null,
				substitute_for: null
            });
			that.src =  '';
		}
		
        that.cancel = function () {
			$uibModalInstance.dismiss('cancel');
        };
    }
	
    function controller($state, $scope, auth, api, core, restaurant, $uibModal, localStorageService, $rootScope, alertService, $window, $q) {

        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

        if ($state.params.id) {
            if (!parseInt($state.params.id)) {
                $state.go('home');
                return
            }
        }

        var that = this;
        that.api = api;
        that.$state = $state;
        that.core = core;
        that.isFood = $state.includes('food.newFoodOrder') || $state.includes('food.editFoodOrder');
        that.isEdit = !!$state.params.id;
        that.isEdit_vendor_id;
        that.vendors = [];
        that.inventories = [];
        that.refbooks = {};
        that.form = {};
        $scope.EditCheck = that.isEdit;
        that.inventory_type_id = that.isFood ? '1' : '2';
		that.OH = [];
		that.current_vendor = null;
		that.order_options = [{id:4, name:'Frequent Items'}, {id:1, name:'Last Order'}, {id:2, name:'New Order'}, {id:3, name:'Suggested Order'}];
		that.order_option = that.order_options[0];

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }


        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });
		
		that.getOH = function () {
			var deferred = $q.defer();
			if(that.isEdit){
				deferred.resolve();
			}
			else{
				//that.loading = true;
				if(that.inventory_type_id === '2'){
					that.api.alcohol({'RestaurantId': that.restaurant_id.restaurant_id, 'Category': '%', 'caller': 'oh_report'}).then(function (res) {
						if(res){
							that.OH = res.data.data.Report;	
							that.resetOH();
						}
						//that.loading = false;
						deferred.resolve();
					});
				}
				else if(that.inventory_type_id === '1'){
					that.api.food_OH({'RestaurantId': that.restaurant_id.restaurant_id, 'Category': '%', 'caller': 'oh_report'}).then(function (res) {
						if(res){
							that.OH = res.data.data.Report;	
							that.resetOH();
						}
						//that.loading = false;
						deferred.resolve();
					});
				}
			}
			return deferred.promise;
		}
		
		that.resetOrderItems = function () {
			that.orderModel = {
				totalItems: 0,
				totalCost: 0,
				inventory_type_id: that.inventory_type_id,
				items: []
			};
		}
		that.resetOrderItems();
		
		that.showInfo = function () {
			//Quick tutorial
			var modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'quick_tutorial.html',
					controller: qt,
					controllerAs: 'qt',
					windowClass: "animated fadeIn modal-lgg",
					size: 'lg',
					resolve: {
					isFood: function () {
						return that.isFood;
                    },
					isEdit: function () {
                        return that.isEdit;
                    }
                }
			});
			//Quick tutorial
		}

        if (that.isEdit) {
            that.api.get_order($state.params.id, {inventory_type_id: that.inventory_type_id}).then(function (res) {

                var order = res.data.data.order;

                if (_.isEmpty(order)) {
                    window.history.go(-1);
                    return
                }

                if (order) {
                    that.orderModel.items = [];
					
                    angular.forEach(order.items, function (v, k) {
                        that.orderModel.items.push({
                            id: v.id,
                            vendor_sku_id: v.vendor_sku_id,
                            vendor_id: v.vendor_id,
                            suggested_amount: v.suggested_amount,
                            suggested_type: v.suggested_order_type,
                            amount: v.amount,
                            order_type: v.order_type,
                            item_cost: v.item_cost,
                            total_cost: v.total_cost,
                            is_approved: 0, //v.is_approved,
                            is_suggested: 0,
                            so_id: -1,
                            is_locked: 1,
                            category: 'Other'
                        });

                    });

                    
                    that.api.get_active_inventory_by_vendor({
                        vendor_id: order.vendor_id,
                        inventory_type_id: that.inventory_type_id
                    }, that.restaurant_id.restaurant_id).then(function (res) {
						that.inventories = res.data.data.sku;

                        angular.forEach(that.orderModel.items, function (v, k) {
                            that.calculate(k, v.vendor_sku_id);
                        });
						
						that.isEdit_vendor_id = order.vendor_id;
						that.current_vendor = that.vendors.filter(function(x){return x.id == that.isEdit_vendor_id})[0];
                    });


                } else {
                    var go = that.isFood ? 'food.orderSummary' : 'alcohol.orderSummary';
                    that.$state.go(go);
                }

            }, function () {
                var go = that.isFood ? 'food.orderSummary' : 'alcohol.orderSummary';
                that.$state.go(go);
            });
        } else {
            
        }
		
		that.getSuggestedOrder = function () {
			that.api.get_suggested_orders({"RestaurantId": that.restaurant_id.restaurant_id, 'inventory_type_id': that.inventory_type_id}).then(function (res) {
                var Report = res.data.data.Report;
                if (res.error) {
                }
                if (Report.length) {
                    var totalCost = 0;
                    var totalItemsCost = 0;
					
					Report = Report.filter(function(x){return x.vendor_id == that.current_vendor.id});
                    angular.forEach(Report, function (v, k) {
                        that.orderModel.items.push({
                            vendor_sku_id: v.vendor_sku_id,
                            vendor_id: v.vendor_id,
                            suggested_amount: v.suggested_amount,
                            suggested_type: v.suggested_order_type,
                            amount: v.actual_amount,
                            order_type: v.actual_order_type == 'Each' ? 'Pack' : v.actual_order_type,
                            item_cost: v.suggested_item_cost,
                            total_cost: v.suggested_total_cost,
                            is_approved: 0,
                            is_suggested: 1,
                            so_id: v.so_id,
                            is_locked: 1,	//default was 1 ????????????
                            category: 'Other'
                        });
                        totalCost += v.suggested_item_cost;
                        totalItemsCost += v.suggested_total_cost;
                        that.orderModel.totalItems = totalCost;
                        that.orderModel.totalCost = totalItemsCost;
                    });
					angular.forEach(that.orderModel.items, function (v, k) {
						that.calculate(k, v.vendor_sku_id);
					});
                }
				else{
					alertService.showError('This vendor does not have any suggested order.');
				}
				that.loading = false;
            });
		}
		
		that.loadOrder = function () {
			that.loading = true;
			that.resetOrderItems();
			if(typeof that.current_vendor != null){
				that.api.get_active_inventory_by_vendor({
					vendor_id: that.current_vendor.id,
					inventory_type_id: that.inventory_type_id
				}, that.restaurant_id.restaurant_id).then(function (res) {
					that.inventories = [];
					that.inventories.push({
						'id': -1,
						'item_name': '(+) Add a new Inventory Item'
					});
					
					that.inventories = that.inventories.concat(res.data.data.sku);
					
					if(that.order_option.id == 1){		//last
						that.getLastOrder();
					}
					else if(that.order_option.id == 2){		//new
						that.pushNewItem();
						that.loading = false;
					}
					else if(that.order_option.id == 3){		//suggested
						that.getSuggestedOrder();
					}
					else if(that.order_option.id == 4){		//frequent 30days
						that.getFrequentOrder();
					}
				});
			}
        };

		that.getLastOrder = function () {
			that.last_order_date = null;
			that.api.get_last_order({"RestaurantId": that.restaurant_id.restaurant_id, 'inventory_type_id': that.inventory_type_id, "vendor_id": that.current_vendor.id, "mode": 'previous'}).then(function (res) {
                var Report = res.data.data.Report;
                if (res.error) {
                }
                if (Report.length) {
                    var totalCost = 0;
                    var totalItemsCost = 0;
					
					//Report = Report.filter(function(x){return x.vendor_id == that.current_vendor.id});
                    angular.forEach(Report, function (v, k) {
						that.last_order_date = v.last_order_date.substr(0, 10);
                        that.orderModel.items.push({
                            vendor_sku_id: v.vendor_sku_id,
                            vendor_id: v.vendor_id,
                            suggested_amount: v.suggested_amount,
                            suggested_type: v.suggested_order_type,
                            amount: v.amount,
                            order_type: !that.isFood ? v.order_type == 'Each' ? 'Pack' : v.order_type : v.order_type,
                            item_cost: v.item_cost,
                            total_cost: v.total_cost,
                            is_approved: 0,
                            is_suggested: 0,
                            is_locked: 1,	//default was 1 ????????????
                            category: 'Other'
                        });
                        totalCost += v.item_cost;
                        totalItemsCost += v.total_cost;
                        that.orderModel.totalItems = totalCost;
                        that.orderModel.totalCost = totalItemsCost;
                    });
					angular.forEach(that.orderModel.items, function (v, k) {
						that.calculate(k, v.vendor_sku_id);
					});
                }
				else{
					alertService.showError('This vendor does not have any recent order.');
				}
				that.loading = false;
            });
		}
		
		that.getFrequentOrder = function () {
			that.api.get_last_order({"RestaurantId": that.restaurant_id.restaurant_id, 'inventory_type_id': that.inventory_type_id, "vendor_id": that.current_vendor.id, "mode": 'frequent'}).then(function (res) {
                var Report = res.data.data.Report;
                if (res.error) {
                }
                if (Report.length) {
                    var totalCost = 0;
                    var totalItemsCost = 0;
					
					//Report = Report.filter(function(x){return x.vendor_id == that.current_vendor.id});
                    angular.forEach(Report, function (v, k) {
                        that.orderModel.items.push({
                            vendor_sku_id: v.vendor_sku_id,
                            vendor_id: v.vendor_id,
                            suggested_amount: 0,
                            suggested_type: "Case",
                            amount: 0,
                            order_type: "Case",
                            item_cost: 0,
                            total_cost: 0,
                            is_approved: 0,
                            is_suggested: 0,
                            is_locked: 1,	//default was 1 ????????????
                            category: 'Other'
                        });
                        totalCost += v.item_cost;
                        totalItemsCost += v.total_cost;
                        that.orderModel.totalItems = totalCost;
                        that.orderModel.totalCost = totalItemsCost;
                    });
					angular.forEach(that.orderModel.items, function (v, k) {
						that.calculate(k, v.vendor_sku_id);
					});
                }
				else{
					alertService.showError('This vendor does not have any recent order.');
				}
				that.loading = false;
            });
		}
		
        that.pushNewItem = function () {
            that.orderModel.items.push({
                vendor_id: that.current_vendor.id,
                vendor_sku_id: null,
                suggested_amount: 0,
                suggested_type: "Case",
                amount: 0,
                order_type: "Case",
                item_cost: 0,
                total_cost: 0,
                is_approved: that.order_option.id == 2 || that.isEdit ? 1 : 0,
                is_suggested: 0,
                so_id: -1,
                is_locked: 0,
                category: 'Other'
            });
        };

        that.delete = function ($index, item, is_approved_flag, is_suggested) {
            if (is_approved_flag == 1)
            {
                return;
            }
			
            if (is_suggested == 0)
            {
				that.orderModel.items.splice($index, 1);
            } else {
                that.api.process_suggested_order_item({"so_id": item.so_id, "process_value": 2, "actual_amount": item.amount, "actual_order_type": item.order_type}).then(function (res) {
                    if (res) {
                        that.orderModel.items.splice($index, 1);
                    } else {
                        console.log("error updating suggested order table");
                        return;
                    }
                });
            }

            angular.forEach(that.orderModel.items, function (v, k) {
                that.calculate(k, v.vendor_sku_id);
            });
        };

		that.cleanup_sug_items = function (slist, i) {
			if(i == slist.length){
				return;
			}
			else{
				that.api.process_suggested_order_item({"so_id": slist[i].so_id, "process_value": 1, "actual_amount": slist[i].amount, "actual_order_type": slist[i].order_type}).then(function (res) {
					if(res.data.data.code == 1000){
						that.cleanup_sug_items(slist, i+1);
					}
					else{
						that.cleanup_sug_items(slist, i+1);
					}
				});
			}
		}
		
		that.getItemOH = function (vendor_sku_id){
			if(that.inventories.length && typeof that.oh_dict != 'undefined'){
				var result_item = that.inventories.filter(function(x){return x.id == vendor_sku_id});
				if(result_item.length){
					var oh_val = typeof that.oh_dict[vendor_sku_id] == 'undefined' ? 'N/A' : that.isFood ? that.oh_dict[vendor_sku_id] + " " + result_item[0].unit_of_delivery : that.oh_dict[vendor_sku_id];
					return oh_val;
				}
			}
			return "N/A";
		}
		
        that.calculate = function ($index, vendor_sku_id, is_cost_edit) {
            if (vendor_sku_id == -1) {
				if(that.orderModel.items[$index].vendor_id == null){
					alertService.showError('Please select a vendor first!');
					that.orderModel.items[$index].vendor_sku_id = null;
					return;
				}
				
				if(that.isFood){
					var modalInstance = $uibModal.open({
						templateUrl: 'add_new_food_inventory_item.html',
						controller: newFoodItem_modalController,
						windowClass: "animated fadeIn modal-lgg",
						controllerAs: '$ctr',
						size: 'lg2x',
						resolve: {
							vendor_id: function () {
								return that.orderModel.items[$index].vendor_id;
							},
							inventory_type_id: function () {
								return that.inventory_type_id;
							},
							restaurant_id: function () {
								return that.restaurant_id.restaurant_id;
							}
						}
					});

				
					modalInstance.result.then(function () {
						that.orderModel.items[$index].vendor_sku_id = null;
						that.api.get_active_inventory_by_vendor({
							vendor_id: that.orderModel.items[$index].vendor_id,
							inventory_type_id: that.inventory_type_id
						}, that.restaurant_id.restaurant_id).then(function (res) {
							that.orderModel.items[$index].vendor_sku_id = null;
							that.inventories[$index] = [];
							that.inventories[$index].push({
								'id': -1,
								'item_name': '(+) Add a new Inventory Item'
							});
							
							that.inventories[$index] = that.inventories[$index].concat(res.data.data.sku);
						});
						
					}, function () {
						that.orderModel.items[$index].vendor_sku_id = null;
						that.api.get_active_inventory_by_vendor({
							vendor_id: that.orderModel.items[$index].vendor_id,
							inventory_type_id: that.inventory_type_id
						}, that.restaurant_id.restaurant_id).then(function (res) {
							that.orderModel.items[$index].vendor_sku_id = null;
							that.inventories[$index] = [];
							that.inventories[$index].push({
								'id': -1,
								'item_name': '(+) Add a new Inventory Item'
							});
							
							that.inventories[$index] = that.inventories[$index].concat(res.data.data.sku);
						});
					});
				}
				else{
					var modalInstance = $uibModal.open({
						templateUrl: 'add_new_alcohol_inventory_item.html',
						controller: newAlcoholItem_modalController,
						windowClass: "animated fadeIn modal-lgg",
						controllerAs: '$ctr',
						size: 'lg2x',
						resolve: {
							vendor_id: function () {
								return that.orderModel.items[$index].vendor_id;
							},
							inventory_type_id: function () {
								return that.inventory_type_id;
							},
							restaurant_id: function () {
								return that.restaurant_id.restaurant_id;
							}
						}
					});
					
					modalInstance.result.then(function () {
						that.orderModel.items[$index].vendor_sku_id = null;
						that.api.get_active_inventory_by_vendor({
							vendor_id: that.orderModel.items[$index].vendor_id,
							inventory_type_id: that.inventory_type_id
						}, that.restaurant_id.restaurant_id).then(function (res) {
							that.orderModel.items[$index].vendor_sku_id = null;
							that.inventories = [];
							that.inventories.push({
								'id': -1,
								'item_name': '(+) Add a new Inventory Item'
							});
							
							that.inventories = that.inventories.concat(res.data.data.sku);
						});
						
					}, function () {
						that.orderModel.items[$index].vendor_sku_id = null;
						that.api.get_active_inventory_by_vendor({
							vendor_id: that.orderModel.items[$index].vendor_id,
							inventory_type_id: that.inventory_type_id
						}, that.restaurant_id.restaurant_id).then(function (res) {
							that.orderModel.items[$index].vendor_sku_id = null;
							that.inventories = [];
							that.inventories.push({
								'id': -1,
								'item_name': '(+) Add a new Inventory Item'
							});
							
							that.inventories = that.inventories.concat(res.data.data.sku);
						});
					});
				}
            } else {
                if (!that.inventories)
                    return;
                if (!_.isArray(that.inventories))
                    return;
				
				if(!that.isFood){
					that.orderModel.items[$index].amount = Math.round(that.orderModel.items[$index].amount);
				}
				else{
					if(that.orderModel.items[$index].order_type == 'Case'){
						that.orderModel.items[$index].amount = Math.round(that.orderModel.items[$index].amount);
					}
				}
				
                if (is_cost_edit == -1)
                {
                    that.orderModel.items[$index].update_sku = 1;
                }

                var totalItemsCost = 0;
                var totalCost = 0;
				
				for(var oi = 0; oi<that.OH.length; oi++){
					if(that.OH[oi].vendor_sku_id == that.orderModel.items[$index].vendor_sku_id){
						if(that.inventory_type_id == '2'){
							that.orderModel.items[$index].OH = that.OH[oi].units_on_hand;
						}
						else if(that.inventory_type_id == '1'){
							that.orderModel.items[$index].OH = that.OH[oi].total_uod_on_hand;
						}
						break;
					}
				}
				
                angular.forEach(that.orderModel.items, function (v, k) {
                    vendor_sku_id = v.vendor_sku_id;
                    var item;

                    for (var i = 0; i < that.inventories.length; i++) {
                        if (that.inventories[i].id === vendor_sku_id) {
                            item = that.inventories[i];
                            break;
                        }
                    }

                    if (!item)
                        return;
					
					var uod;
					var mot;
					for(var i=0; i<that.inventories.length; i++){
						if(that.inventories[i].id === that.orderModel.items[$index].vendor_sku_id){
							if(is_cost_edit != -1){
								that.orderModel.items[$index].total_unit_size = that.inventories[i].total_unit_size;
								that.orderModel.items[$index].unit_of_delivery = that.inventories[i].unit_of_delivery;
							}
							mot = that.inventories[i].minimum_order_type;
							uod = that.inventories[i].uom_id_of_delivery_unit;
							break;
						}
					}
					
					
					if(that.inventory_type_id == 2){
						if (item.category == 'Bottle Beer')
						{
							that.orderModel.items[$index].category = 'Bottle_Beer';
						} else {
							that.orderModel.items[$index].category = 'Other';
						}
						//change order type dropdown
						if(mot == 'Case'){
							that.orderModel.items[$index].otypes = [{name: 'Case', value: 'Case'}];
						}
						else{
							that.orderModel.items[$index].otypes = [{name: 'Case', value: 'Case'}, {name: 'Each', value: 'Pack'}];
						}
						//change order type dropdown
					}
					else{
						//change order type dropdown
						if(mot == 'Case'){
							that.orderModel.items[$index].otypes = [{name: 'Case', value: 'Case'}];
						}
						else if(mot == 'Pack'){
							that.orderModel.items[$index].otypes = [{name: 'Case', value: 'Case'}, {name: 'Pack', value: 'Pack'}];
						}
						else{
							for(var j=0; j<that.refbooks.measurement_units_of_delivery.length; j++){
								if(uod === that.refbooks.measurement_units_of_delivery[j].id){
									var f_ordertype = that.refbooks.measurement_units_of_delivery[j].name;
									that.orderModel.items[$index].otypes = [{name: 'Case', value: 'Case'}, {name: 'Pack', value: 'Pack'}, {name: f_ordertype, value: 'Each'}];
									break;
								}
							}
						}
						//change order type dropdown
					}

                    var temp_cost = v.item_cost;
                    if (is_cost_edit == 0 || angular.isUndefined(v.id))
                        v.item_cost = v.amount ? (v.order_type == 'Case' ? (item.case_cost || 0) : v.order_type == 'Pack' ? (item.pack_cost || 0) : (that.isFood ? item.unit_cost : item.pack_cost || 0)) : 0;
					
					if(that.isEdit){
						v.item_cost = v.amount ? (v.order_type == 'Case' ? (item.case_cost || 0) : v.order_type == 'Pack' ? (item.pack_cost || 0) : (that.isFood ? item.unit_cost : item.pack_cost || 0)) : 0;
					}
					
                    if (is_cost_edit == -1)
                    {
                        v.item_cost = temp_cost;
                    }
                    v.total_cost = (v.item_cost * v.amount) || 0;

                    totalItemsCost += v.item_cost;
                    totalCost += v.total_cost;

                    that.orderModel.totalCost = totalCost;
                    that.orderModel.totalItems = totalItemsCost;

                });
            }

        };
		
		that.resetOH = function () {
			that.oh_dict = {};
			for(var oi = 0; oi<that.OH.length; oi++){
				if(that.inventory_type_id == '2'){
					that.oh_dict[that.OH[oi].vendor_sku_id] = that.OH[oi].units_on_hand;
				}
				else if(that.inventory_type_id == '1'){
					that.oh_dict[that.OH[oi].vendor_sku_id] = that.OH[oi].total_uod_on_hand;
				}
			}
		}
		
        $scope.sendEmail = false;
        $scope.setEmail = function () {
            $scope.sendEmail = true;
        }
		
        $scope.setNoEmail = function () {
            $scope.sendEmail = false;
        }
		
        that.addNewOrder = function (form) {
            if (!form.$valid)
                return;

            var m = {
                inventory_type_id: parseInt(that.inventory_type_id),
                sendEmail: $scope.sendEmail,
                items: []
            };

            //var sku_updates = [];
			var process_sug = [];
            for (var i = 0; that.orderModel.items.length > i; i++) {
                if (that.orderModel.items[i].is_approved == 1)
                {
                    /*if (!angular.isUndefined(that.orderModel.items[i].update_sku))
                    {
                        sku_updates.push(that.orderModel.items[i]);
                    }*/
                    m.items.push({
                        id: that.orderModel.items[i].id,
                        vendor_id: that.orderModel.items[i].vendor_id,
                        vendor_sku_id: that.orderModel.items[i].vendor_sku_id,
                        suggested_amount: that.orderModel.items[i].suggested_amount,
                        suggested_order_type: that.orderModel.items[i].suggested_type,
                        amount: that.orderModel.items[i].amount,
                        order_type: !that.isFood && that.orderModel.items[i].order_type == 'Each' ? 'Pack' : that.orderModel.items[i].order_type,
						total_unit_size: that.orderModel.items[i].total_unit_size,
                        item_cost: that.orderModel.items[i].item_cost,
                        total_cost: that.orderModel.items[i].total_cost,
                        is_approved: that.orderModel.items[i].is_approved
                    });
					
					if(!that.isFood){
						delete m.items[m.items.length - 1].total_unit_size;
					}
					
					if (!that.isEdit) {
						if(that.orderModel.items[i].so_id != -1){
							process_sug.push(that.orderModel.items[i]);
						}
					}
                }
            }

            if (!that.isEdit) {
				if(m.items.length){
					var missing_emails = new Set();
					for(var mi in m.items){
						for(var v in that.vendors){
							if(m.items[mi].vendor_id == that.vendors[v].id){
								if((that.vendors[v].primary_email == null || that.vendors[v].primary_email == 'null' || that.vendors[v].primary_email == '')
									&& (that.vendors[v].secondary_email_1 == null || that.vendors[v].secondary_email_1 == 'null' || that.vendors[v].secondary_email_1 == '')
									&& (that.vendors[v].secondary_email_2 == null || that.vendors[v].secondary_email_2 == 'null' || that.vendors[v].secondary_email_2 == '')){
									missing_emails.add(that.vendors[v]);	
								}
								break;
							}
						}
					}
					missing_emails = Array.from(missing_emails);
					if(missing_emails.length && $scope.sendEmail){
						var conf = {
							title: "Cannot Send Order!",
							text: "Unfortunately "+missing_emails.map(function(x){return x.vendor_name}).join(', ')+" "+(missing_emails.length > 1 ? 'are' : 'is')+" not set up to receive your orders.\nYou may resolve this issue by selecting 'Update Vendor' which will allow you to add the email addresses of the vendors who are not set up to receive orders. Or you may select 'Cancel' and unselect the vendors who are not setup to receive orders and reprocess your orders for the vendors who are setup to receive orders.\nFor the vendors who are not setup to receive orders you may process them separately by selecting 'Confirm and Save' which will only save but not send.",
							type: "warning",
							showCancelButton: true,
							confirmButtonColor: "#ed5565",
							confirmButtonText: "Update Vendor"
						};
						swal(conf, function (res) {
							if (res) {
								if(parseInt(that.inventory_type_id) == 2){
									that.$state.go('alcoholSetup.vendor');
								}
								else{
									that.$state.go('foodSetup.vendor');
								}
							}
						});
					}
					else{
						var conf = {
							title: "Are you sure?",
							text: "Any unapproved items that are not suggested orders will be lost if you proceed.",
							type: "warning",
							showCancelButton: true,
							confirmButtonColor: "#ed5565",
							confirmButtonText: "Confirm"
						};
						swal(conf, function (res) {
							if (res) {	
								that.api.create_order(m).then(function (res) {
									if (res.data.data.code === 1000) {
										
										that.cleanup_sug_items(process_sug, 0);
										
										alertService.showAlertSave();
										if (that.isFood) {
											that.$state.go('foodSubCategories');
										} else {
											$window.location.reload();
										}
									}
								});
							}
						});
					}
				}
				else{
					alertService.showError('Please approve at least one item!');
				}
            }
			else {
				var conf = {
					title: "Are you sure?",
					text: "Any unapproved items will be lost if you proceed.",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#ed5565",
					confirmButtonText: "Confirm"
				};
				swal(conf, function (res) {
					if (res) {
						var um = {
							inventory_type_id: parseInt(that.inventory_type_id),
							items: []
						};
						var new_m = {
							inventory_type_id: parseInt(that.inventory_type_id),
							items: []
						};

						for (var i = 0; m.items.length > i; i++) {
							if (angular.isUndefined(m.items[i].id))
							{
								um.items.push(m.items[i]);
							} else {
								new_m.items.push(m.items[i]);
							}
						}

						var len_um = um.items.length;
						var len_new_m = new_m.items.length;

						that.api.add_extra_order_items(um, that.$state.params.id).then(function (res1) {
							if (res1.data.data.code == 1000) {
								that.api.get_order($state.params.id, {inventory_type_id: that.inventory_type_id}).then(function (res2) {
									if (res2.data.data.code == 1000) {
										for (var i = 0; new_m.items.length > i; i++) {
											for (var j = 0; res2.data.data.order.items.length > j; j++) {
												if (new_m.items[i].id == res2.data.data.order.items[j].id)
												{
													res2.data.data.order.items.splice(j, 1);
													break;
												}
											}
										}
										
										for (var i = 0; um.items.length > i; i++) {
											for (var j = 0; res2.data.data.order.items.length > j; j++) {
												if (um.items[i].vendor_sku_id == res2.data.data.order.items[j].vendor_sku_id && um.items[i].suggested_amount == res2.data.data.order.items[j].suggested_amount && um.items[i].suggested_order_type == res2.data.data.order.items[j].suggested_order_type && um.items[i].amount == res2.data.data.order.items[j].amount && um.items[i].order_type == res2.data.data.order.items[j].order_type && um.items[i].item_cost == res2.data.data.order.items[j].item_cost && um.items[i].total_cost == res2.data.data.order.items[j].total_cost && um.items[i].is_approved == res2.data.data.order.items[j].is_approved && um.items[i].vendor_id == res2.data.data.order.items[j].vendor_id)
												{
													um.items[i].id = res2.data.data.order.items[j].id;
													res2.data.data.order.items.splice(j, 1);
													break;
												}
											}
										}
										
										new_m.items = new_m.items.concat(um.items);

										that.api.update_order(new_m, that.$state.params.id).then(function (res) {
											if (res.data.data.code === 1000) {
												$window.history.go(-1);
											}
										});
									}
								});
							}
						});
					}
				});
            }
        };

		that.getChosenVendors = function () {
			api.get_chosen_vendors(that.restaurant_id.restaurant_id, {vendor_type_id: that.inventory_type_id}).then(function (res) {
                try {
                    that.vendors = [];
                    that.vendors.push({
                        'id': -1,
                        'vendor_name': '(+) Add a new Vendor'
                    });
                    that.vendors = that.vendors.concat(res.data.data.vendors);
                } catch (e) {
                    console.log(e);
                }
            });
        };
		
		that.changeVendor = function (is_init) {
			that.resetOrderItems();
			that.current_vendor_bu = JSON.parse(JSON.stringify(that.current_vendor));
			if (that.current_vendor.id == -1) {
				var modalInstance = $uibModal.open({
					templateUrl: 'add_new_vendor.html',
					controller: modalController,
					windowClass: "animated fadeIn modal-lgg",
					controllerAs: '$ctr',
					resolve: {
						global_Vendors: function () {
							return that.api.get_global_vendors({vendor_type_id: that.inventory_type_id}).then(function (res) {
								try {
									return that.global_Vendors = res.data.data.vendors;
								} catch (e) {
									console.log(e);
								}
							})
						},
						inventory_type_id: function () {
							return that.inventory_type_id;
						},
						get_refbooks: function () {
							if (that.get_refbooks) return that.get_refbooks;
							return that.core.getRefbooks().then(function (res) {
								return that.get_refbooks = res;
							})
						}
					}
				});

			
				modalInstance.result.then(function () {
					that.current_vendor = null;
					that.getChosenVendors();
				}, function () {
					that.current_vendor = null;
					that.getChosenVendors();
				});
			}
			else {
				if (that.isEdit && that.current_vendor.id != that.isEdit_vendor_id)
				{
					alertService.showError('Vendor different from that on invoice!');
					that.current_vendor = null;
				}
				
				if(!that.isEdit){
					that.api.get_active_inventory_by_vendor({
						vendor_id: that.current_vendor.id,
						inventory_type_id: that.inventory_type_id
					}, that.restaurant_id.restaurant_id).then(function (res) {
						that.inventories = [];
						that.inventories.push({
							'id': -1,
							'item_name': '(+) Add a new Inventory Item'
						});
						
						that.inventories = that.inventories.concat(res.data.data.sku);
						//that.calculate($index, that.orderModel.items[$index].vendor_sku_id);	//????? try this?
						that.loadOrder();
					});
				}
			}
		}
		
        that.chooseVendor = function (is_init) {
			if(that.orderModel.items.length){
				var conf = {
					title: "Are you sure?",
					text: "Any progress will be lost if you proceed.",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#ed5565",
					confirmButtonText: "Confirm"
				};
				swal(conf, function (res) {
					if (res) {
						that.changeVendor(is_init);
					}
					else{
						that.current_vendor = JSON.parse(JSON.stringify(that.current_vendor_bu));
					}
				});
			}
			else{
				that.changeVendor(is_init);
			}
        };

        that.$onInit = function () {
            that.getChosenVendors();
			that.getOH();
            that.core.getRefbooks().then(function (res) {
                that.refbooks = res;
            });
        };
    }

    controller.$inject = ['$state', '$scope', 'auth', 'api', 'core', 'restaurant', '$uibModal', 'localStorageService', '$rootScope', 'alertService', '$window', '$q'];

    angular.module('inspinia').component('newOrderComponent', {
        templateUrl: 'js/components/newOrder/newOrder.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();

