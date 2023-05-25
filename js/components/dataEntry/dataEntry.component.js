(function () {

    'use strict';

	
	function modalController($uibModalInstance, subscription_type_id, localStorageService, get_refbooks, api) {
        var that = this;

        that.form = {};
        that.api = api;
        that.get_refbooks = get_refbooks;
        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}
						
        that.model = {};
        that.vendor_types = subscription_type_id == 5 ? [{id: 2, name: 'Alcohol'}] : subscription_type_id == 6 ? [{id: 1, name: 'Food'}] : [{id: 1, name: 'Food'}, {id: 2, name: 'Alcohol'}];
		
        var initModel = function () {
            that.model = {
				restaurant_id: null,
                vendor_name: null,
				primary_vendor: null,
                vendor_type_id: null,
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

		that.getGlobalVendors = function(){
			that.api.get_global_vendors({vendor_type_id: that.model.vendor_type_id}).then(function (res) {
				try {
					that.global_Vendors = res.data.data.vendors;
				} catch (e) {
					console.log(e);
				}
			})
		}
		
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
	
	var save_invoice = function ($uibModalInstance) {
        var that = this;

		that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
		
        that.save = function (is_last) {
			var choice = is_last;
            $uibModalInstance.close(choice);
        }
    };
	
	function newFoodItem_modalController($uibModalInstance, alertService, api, core, restaurant_id, vendor_id, SweetAlert, $q) {
		var that = this;
		
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
	
	function newAlcoholItem_modalController($uibModalInstance, alertService, api, core, restaurant_id, vendor_id, SweetAlert, $q) {
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
				if(that.inventoryItems[i].vendor_cat_id == that.uniqueItem[0].vendor_cat_id){
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

    function viewInvoices_modalController($uibModalInstance, api) {
        var that = this;
        that.invoices = [];
        that.start_date = new Date();
        that.end_date = new Date();

        that.search = function () {
             api.get_added_invoices({start_date: that.start_date, end_date: that.end_date}).then(function (res) {
                try {
                    that.invoices = res.data.data.invoices;
                } catch (e) {
                    console.log(e);
                }
            });
        }
       
        that.search();

        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
	
    function controller($state, auth, api, core, restaurant, $uibModal, localStorageService, $rootScope, alertService, SweetAlert, $window) {
		
        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

        var that = this;
        that.api = api;
        that.$state = $state;
        that.core = core;
        that.inventories = [];
        that.refbooks = {};
        that.form = {};

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });
		
		that.subscription_type_id = restaurant.data.info.subscription_type_id;
		that.prev_selected_vendor = null;
		that.selected_vendor = null;
		//that.invoice_date = new Date();
        that.invoice_number = null;
        that.invoice_total = null;
		
		that.resetOrderModel = function () {
			that.orderModel = {
				totalItems: 0,
				totalCost: 0,
				inventory_type_id: null,
				items: []
			};
		}
		that.resetOrderModel();
		
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

        that.addNewOrder = function (form) {
            if (!form.$valid)
                return;

			if(that.orderModel.items.length < 1){
				alertService.showError('Invoice has no order items!');
				return;
			}
			
			if(that.invoice_total != that.orderModel.totalCost){
				alertService.showError('Invoice total doesnt match!');
				return;
			}

			//Save
			var modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'save_invoice.html',
					controller: save_invoice,
					controllerAs: 'save_invoice',
					windowClass: "animated fadeIn modal-lgg"
			});
			modalInstance.result.then(function(choice) {
				var dayfd = that.invoice_date.getDate();
				var monthfd = that.invoice_date.getMonth() + 1;
				var fd = that.invoice_date.getFullYear() + '-' +
					(('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
					(('' + dayfd).length < 2 ? '0' : '') + dayfd;
				
				var m = {
					inventory_type_id: parseInt(that.selected_vendor.vendor_type_id),
					items: [],
					data_entry: {	data_entry: true,
									is_final_invoice: choice,
									invoice_number: that.invoice_number,
									invoice_total: that.invoice_total,
									delivery_date : fd,
									delivery_time: '00:00:00'
								}
				};

				//var sku_updates = [];
				for (var i = 0; that.orderModel.items.length > i; i++) {
					/*if (!angular.isUndefined(that.orderModel.items[i].update_sku))
					{
						sku_updates.push(that.orderModel.items[i]);
					}*/
					m.items.push({
						id: that.orderModel.items[i].id,
						vendor_id: that.selected_vendor.id,
						vendor_sku_id: that.orderModel.items[i].vendor_sku_id,
						suggested_amount: 0,
						suggested_order_type: 'Case',
						amount: that.orderModel.items[i].amount,
						order_type: !that.isFood && that.orderModel.items[i].order_type == 'Each' ? 'Pack' : that.orderModel.items[i].order_type,
						total_unit_size: that.orderModel.items[i].total_unit_size,
						item_cost: that.orderModel.items[i].item_cost,
						total_cost: that.orderModel.items[i].total_cost,
						is_approved: 1
					});
				}
				
				that.api.create_order(m).then(function (res) {
					if (res.data.data.code === 1000) {
						var mode = that.isFood ? 'dual' : 'single';
						/*if(sku_updates.length){
							that.api.update_SKU_item_cost({'sku_updates':sku_updates, 'mode': mode}).then(function (resx) {
								if (resx.data.data.code == 1000) {
									alertService.showAlertSave();
									that.prev_selected_vendor = null;
									that.selected_vendor = null;
									//that.invoice_date = new Date();
									that.invoice_number = null;
									that.invoice_total = null;
									that.resetOrderModel();
								}
							});
						}
						else{*/
							alertService.showAlertSave();
							that.prev_selected_vendor = null;
							that.selected_vendor = null;
							//that.invoice_date = new Date();
							that.invoice_number = null;
							that.invoice_total = null;
							that.resetOrderModel();
						//}
					}
				});
			});
			//Save
        };

		that.pushNewItem = function () {
            that.orderModel.items.push({
                vendor_sku: null,
                item_name: null,
                amount: null,
                order_type: "Case",
				case_size: 0,
                item_cost: 0,
				discount: 0,
                total_cost: 0
            });
        };

        that.delete = function ($index) {
			that.orderModel.items.splice($index, 1);
            angular.forEach(that.orderModel.items, function (v, k) {
                that.calculate(k, v.vendor_sku_id);
            });
        }

		that.calculate = function ($index, vendor_sku_id, is_cost_edit) {
			if(!that.orderModel.items[$index].locked){
				alertService.showError('Please search the Item SKU again!');
				return;
			}
			if (!vendor_sku_id)
				return;
			
			if(!that.isFood){
				that.orderModel.items[$index].amount = Math.round(that.orderModel.items[$index].amount);
			}
			
			if (is_cost_edit == -1)
			{
				that.orderModel.items[$index].update_sku = 1;
			}

			var totalItemsCost = 0;
			var totalDiscount = 0;
			var totalCost = 0;
			
			angular.forEach(that.orderModel.items, function (v, k) {

				var uod = v.uom_id_of_delivery_unit;
				var mot = v.minimum_order_type;
				
				if(that.selected_vendor.vendor_type_id == 2){
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
								v.otypes = [{name: 'Case', value: 'Case'}, {name: 'Pack', value: 'Pack'}, {name: f_ordertype, value: 'Each'}];
								//that.orderModel.items[$index].otypes = [{name: 'Case', value: 'Case'}, {name: 'Pack', value: 'Pack'}, {name: f_ordertype, value: 'Each'}];
								break;
							}
						}
					}
					//change order type dropdown
				}

				var temp_cost = v.item_cost;
				if (is_cost_edit == 0 && v.update_sku != 1)
					v.item_cost = v.amount ? (v.order_type == 'Case' ? (v.case_cost || 0) : v.order_type == 'Pack' ? (v.case_cost/v.pack || 0) : ((v.case_cost / (v.pack * v.size)) || 0)) : 0;

				if (is_cost_edit == -1)
				{
					v.item_cost = temp_cost;
				}
				
				v.item_cost =  Math.round(v.item_cost * 10000) / 10000;
				v.total_cost = ((v.item_cost * v.amount) - v.discount) || 0;
				v.total_cost =  Math.round(v.total_cost * 100) / 100;

				totalItemsCost += v.item_cost;
				totalDiscount += v.discount;
				totalCost += v.total_cost;

				that.orderModel.totalItems = totalItemsCost;
				that.orderModel.totalDiscount = totalDiscount;
				that.orderModel.totalCost = totalCost;
				that.orderModel.totalCost =  Math.round(that.orderModel.totalCost * 100) / 100;
				
			});
        };
		
        that.apply_values = function ($index, $item) {
			that.pushNewItem();
			that.orderModel.items[$index].locked = true;
			that.orderModel.items[$index].vendor_sku_id = $item.vendor_sku_id;
            that.orderModel.items[$index].vendor_sku = $item.vendor_sku;
            that.orderModel.items[$index].item_name = $item.item_name;
            that.orderModel.items[$index].vendor_cat_id = $item.vendor_cat_id;
            that.orderModel.items[$index].vendor_sub_cat_id = $item.vendor_sub_cat_id;
            that.orderModel.items[$index].uom_id_of_delivery_unit = $item.uom_id_of_delivery_unit;
            that.orderModel.items[$index].pack = $item.pack;
            that.orderModel.items[$index].size = $item.size;
			that.orderModel.items[$index].total_unit_size = ($item.pack * $item.size);
			that.orderModel.items[$index].case_size = ($item.pack * $item.size) + " "+$item.uod;
            that.orderModel.items[$index].case_cost = $item.case_cost;
            that.orderModel.items[$index].minimum_order_type = $item.minimum_order_type;
			that.calculate($index, $item.vendor_sku_id, 0);
        }
		
		that.sku_lookup = function ($index, search_for) {
			if(that.selected_vendor.vendor_type_id == 1){
				return that.api.sku_lookup({search_for: search_for, vendor_id: that.selected_vendor.id}).then(function (res) {
					var local_results = [];
					for(var i=0; i<res.data.data.sku.length; i++){
						if(res.data.data.sku[i].src == 'l'){
							local_results.push(res.data.data.sku[i]);
						}
					}
					if(local_results.length === 0) {
						var modalInstance = $uibModal.open({
							templateUrl: 'add_new_food_inventory_item.html',
							controller: newFoodItem_modalController,
							windowClass: "animated fadeIn modal-lgg",
							controllerAs: '$ctr',
							size: 'lg',
							resolve: {
								vendor_id: function () {
									return that.selected_vendor.id;
								},
								restaurant_id: function () {
									return that.restaurant_id.restaurant_id;
								}
							}
						});
						modalInstance.result.then(function () {
							that.orderModel.items[$index].vendor_sku = null;
						}, function () {
							that.orderModel.items[$index].vendor_sku = null;
						});
					} else {
						return local_results.slice(0, 10);
					}
				})
			}
			else if (that.selected_vendor.vendor_type_id == 2){
				return that.api.sku_lookup({search_for: search_for, vendor_id: that.selected_vendor.id}).then(function (res) {
					var local_results = [];
					for(var i=0; i<res.data.data.sku.length; i++){
						if(res.data.data.sku[i].src == 'l'){
							local_results.push(res.data.data.sku[i]);
						}
					}
					if(local_results.length === 0) {
						var modalInstance = $uibModal.open({
							templateUrl: 'add_new_alcohol_inventory_item.html',
							controller: newAlcoholItem_modalController,
							windowClass: "animated fadeIn modal-lgg",
							controllerAs: '$ctr',
							size: 'lg',
							resolve: {
								vendor_id: function () {
									return that.selected_vendor.id;
								},
								restaurant_id: function () {
									return that.restaurant_id.restaurant_id;
								}
							}
						});
						modalInstance.result.then(function () {
							that.orderModel.items[$index].vendor_sku = null;
						}, function () {
							that.orderModel.items[$index].vendor_sku = null;
						});
					} else {
						return local_results.slice(0, 10);
					}
				})
			}
        };
		
		that.checkDetails = function () {
			if(that.invoice_date > new Date())
			{
				alertService.showError('Delivery date cannot be greater than now!');
				that.invoice_date = new Date();
			}
        };
		
        that.check_Invoice = function () {
            if(!that.selected_vendor){
                alertService.showError('Please select a vendor!');
				that.invoice_number = null;
                return;
            } else if(!that.invoice_number) {
                alertService.showError('Invoice number cannot be empty!');
				that.invoice_number = null;
                return;
            } else {
                api.check_if_invoice_exists(that.restaurant_id.restaurant_id+'&'+that.invoice_number+'&'+that.selected_vendor.id).then(function (res) {
                    try {
						if(res.data.data.does_exist.does_exist[0].invoice_exists == 'true'){
							alertService.showError('Invoice number already exists in the records!');
							that.invoice_number = null;
							return;
						}
                    } catch (e) {
						that.invoice_number = null;
                        console.log("error");
                    }
                });
            }            
        };

        that.viewInvoices = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'view_invoice.html',
                controller: viewInvoices_modalController,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr'
            });
        }

		that.chooseVendorConfirm = function () {
			if(that.selected_vendor.id == -1) {
				var modalInstance = $uibModal.open({
					templateUrl: 'add_new_vendor.html',
					controller: modalController,
					windowClass: "animated fadeIn modal-lgg",
					controllerAs: '$ctr',
					resolve: {
						subscription_type_id: function () {
							return that.subscription_type_id;
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
					that.selected_vendor = null;
					that.prev_selected_vendor = that.selected_vendor;
					that.getChosenVendors();
				}, function () {
					that.selected_vendor = null;
					that.prev_selected_vendor = that.selected_vendor;
					that.getChosenVendors();
				});
			} else {
				that.prev_selected_vendor = that.selected_vendor;
				that.isFood = that.selected_vendor.vendor_type_id == 1 ? 1 : 0;
			}
			that.invoice_number = null;
			that.invoice_total = null;
			that.resetOrderModel();
			that.pushNewItem();
		}
		
        that.chooseVendor = function () {
			if(that.orderModel.items.length > 0 && that.orderModel.items[0].locked){
				SweetAlert.swal({
					title: "Change vendor?",
					text: "You will lose your current work if you confirm.",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#337ab7",
					confirmButtonText: "Confirm"
				},
				function (res) {
					if (res) {
						that.chooseVendorConfirm();
					} else {
						that.selected_vendor = that.prev_selected_vendor;
					}
				});
			}
			else{
				that.chooseVendorConfirm();
			}
        };
		
		that.getChosenVendors = function () {
			if(that.subscription_type_id == 7){		//full service (a+f)
				api.get_chosen_vendors(that.restaurant_id.restaurant_id, {vendor_type_id: 1}).then(function (res) {
					try {
						that.vendors = [];
						that.vendors.push({
							'id': -1,
							'vendor_name': '(+) Add a new Vendor'
						});
						that.vendors = that.vendors.concat(res.data.data.vendors);
						
						api.get_chosen_vendors(that.restaurant_id.restaurant_id, {vendor_type_id: 2}).then(function (res) {
							try {
								that.vendors = that.vendors.concat(res.data.data.vendors);
							} catch (e) {
								console.log(e);
							}
						});
					} catch (e) {
						console.log(e);
					}
				});
			}
			else if(that.subscription_type_id == 5 || that.subscription_type_id == 6){		//6: food (inv=1), 5: alcohol(inv=2)
				api.get_chosen_vendors(that.restaurant_id.restaurant_id, {vendor_type_id: that.subscription_type_id == 5 ? 2 : 1}).then(function (res) {
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
			}
        };
		
        that.$onInit = function () {
            that.getChosenVendors();

            that.core.getRefbooks().then(function (res) {
                that.refbooks = res;
            });
        };
    }

    controller.$inject = ['$state', 'auth', 'api', 'core', 'restaurant', '$uibModal', 'localStorageService', '$rootScope', 'alertService', 'SweetAlert', '$window'];

    angular.module('inspinia').component('dataentry', {
        templateUrl: 'js/components/dataEntry/dataEntry.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();


