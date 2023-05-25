(function () {
    'use strict';

    function addUniqueItemsController($uibModalInstance, alertService, api, core, searchParams, SweetAlert, $q) {


        var that = this;

        that.form = {};
        that.uniqueItem = [];
        that.searchParams = searchParams;

        var INVENTORIES = []; // const for compare, that model was changed, -- copy from that.uniqueItem

        var checkChanges = function () {
            return _.isEqual(INVENTORIES, JSON.parse(angular.toJson(that.uniqueItem)))
        };

        that.vendorsName = that.searchParams.vendors_name;
        for (var i = 0; that.vendorsName.length > i; i++) {
            if (that.vendorsName[i].is_selected == true) {
                that.vendorsName = that.vendorsName[i].vendor_name;
            }
        }

        that.searchModel = {
            order_by: 'item_name', // "upc", "vendor_sku", "item_name", "item_desc", 'pack', 'size','unit_of_delivery', 'brand', 'category', 'sub_category', 'case_cost', 'minimum_order_type'
            order_way: "ASC",  //ASC/DESC
            paginationOffset: 0, // 0 by default
            paginationCount: 25,
            inRequest: false,
            paginationTotal: 0,

            city: null,
            item_name: null,
            sub_category: null,
            vendor_sku: null,
            filter: 'own',
            category: null
        };

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
            return that.api.sku_lookup({
                search_for: search_for,
                vendor_id: that.searchParams.vendor_id
            }).then(function (res) {
                return res.data.data.sku.slice(0, 10);
            })

        };

        that.chkIfSubSelected = function ($index) {			
			var e_type = 0;
			var parent_name = "";
			var child_list = [];
			for (var i = 0; that.uniqueItem.length > i; i++) {
				if((that.uniqueItem[i].id == that.uniqueItem[$index].substitute_for) && that.uniqueItem[i].substitute_for != null){
					e_type = 1;
					child_list.push(that.uniqueItem[i]);
					that.uniqueItem[$index].substitute_for = null;
					break;
				}
			}
			if(e_type == 0 && that.uniqueItem[$index].id != null){
				for (var i = 0; that.inventoryItemsForSubCheck.length > i; i++) {
					if(that.uniqueItem[$index].id == that.inventoryItemsForSubCheck[i].substitute_for)
					{
						e_type = 2;
						parent_name = that.uniqueItem[$index].item_name;
						child_list.push(that.inventoryItemsForSubCheck[i]);
						that.uniqueItem[$index].substitute_for = null;
					}
				}
			}
			
			
			if(e_type == 0){
				for (var i =0; i< that.inventoryItems.length; i++) {
					if(that.uniqueItem[$index].substitute_for == that.inventoryItems[i].id){
						if(that.uniqueItem[$index].uom_id_of_delivery_unit == 10 || that.uniqueItem[$index].uom_id_of_delivery_unit == 11 || that.uniqueItem[$index].uom_id_of_delivery_unit == 12 || that.uniqueItem[$index].uom_id_of_delivery_unit == 13 || that.uniqueItem[$index].uom_id_of_delivery_unit == 16 || that.uniqueItem[$index].uom_id_of_delivery_unit == 17 || that.uniqueItem[$index].uom_id_of_delivery_unit == 18){
							if(!(that.inventoryItems[i].uom_id_of_delivery_unit == 10 || that.inventoryItems[i].uom_id_of_delivery_unit == 11 || that.inventoryItems[i].uom_id_of_delivery_unit == 12 || that.inventoryItems[i].uom_id_of_delivery_unit == 13 || that.inventoryItems[i].uom_id_of_delivery_unit == 16 || that.inventoryItems[i].uom_id_of_delivery_unit == 17 || that.inventoryItems[i].uom_id_of_delivery_unit == 18)){
								e_type = 3;
								that.uniqueItem[$index].substitute_for = null;
							}
						}
						else{
							if(that.inventoryItems[i].uom_id_of_delivery_unit == 10 || that.inventoryItems[i].uom_id_of_delivery_unit == 11 || that.inventoryItems[i].uom_id_of_delivery_unit == 12 || that.inventoryItems[i].uom_id_of_delivery_unit == 13 || that.inventoryItems[i].uom_id_of_delivery_unit == 16 || that.inventoryItems[i].uom_id_of_delivery_unit == 17 || that.inventoryItems[i].uom_id_of_delivery_unit == 18){
								e_type = 3;
								that.uniqueItem[$index].substitute_for = null;
							}
						}
						break;
					}
				}
			}
			if(e_type == 1){
				swal({
					title: "Error! "+child_list.map(function(x){return x.item_name}).join("\n")+ " is already a substitute item.",
					type: "error"
				});
			}
			else if(e_type == 2){
				swal({
					title: "Error! "+parent_name+ " is already a primary item of the following.",
					text: child_list.map(function(x){return x.vendor_name+" - "+x.item_name+" - "+(x.is_used == 1 ? "(Active)" : "(Inactive)")}).join("\n"),
					type: "error"
				});
			}
			else if(e_type == 3){
				swal({
					title: "Error! Delivery types of the items are incompatible.",
					type: "error"
				});
			}
        }

        that.submit = function (form, get_list) {

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

            var id = that.searchParams.vendor_id;

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
                    if (get_list) {
                        that.search();
                    }
                }
            });

            return deferred.promise;

        };

        that.checkForUniqueSKU = function ($index) {
            for (var i = 0; that.uniqueItem.length > i; i++) {
                if ($index != i && that.uniqueItem[i].vendor_sku == that.uniqueItem[$index].vendor_sku) {
                    that.uniqueItem[$index].vendor_sku = null;
                }
            }
        }

        that.apply_values = function ($index, $item) {
            that.uniqueItem[$index].src = $item.src;
            that.uniqueItem[$index].vendor_sku = $item.vendor_sku;
            that.checkForUniqueSKU($index);
            that.uniqueItem[$index].item_name = $item.item_name;
            that.uniqueItem[$index].vendor_cat_id = $item.vendor_cat_id;
            that.uniqueItem[$index].vendor_sub_cat_id = $item.vendor_sub_cat_id;
            that.uniqueItem[$index].uom_id_of_delivery_unit = $item.uom_id_of_delivery_unit;
            that.uniqueItem[$index].pack = $item.pack;
            that.uniqueItem[$index].size = $item.size;
            that.uniqueItem[$index].case_cost = $item.case_cost;
            that.uniqueItem[$index].minimum_order_type = $item.minimum_order_type;
            that.uniqueItem[$index].substitute_for = $item.substitute_for;
        }

        that.filterItems = function (id, cat_id) {
			if (!cat_id) return [];

            var _a = [];
			
			for (var i = 0; i < that.inventoryItems.length; i++) {
                if (that.inventoryItems[i].id != id && that.inventoryItems[i].vendor_cat_id == cat_id) {
                    _a.push(that.inventoryItems[i])
                }
            }
			
            if (_a.length) {
                var first = JSON.stringify(_a[0]);
                _a.unshift(JSON.parse(first));
                _a[0]['id'] = null;
                _a[0]['vendor_name'] = '--No selection--';
                _a[0]['item_name'] = '--No selection--';
            }
			else{
				_a.push({});
				_a[0]['id'] = null;
                _a[0]['vendor_name'] = '--No selection--';
                _a[0]['item_name'] = '--No selection--';
			}
			
            return _a;
        };

        that.addUniqueItem = function () {

            that.uniqueItem.push({
                src: '',
                vendor_sku: null,
                pack: null,
                uom_id_of_delivery_unit: null,
                brand: null,
                item_name: null,
                vendor_cat_id: that.categories.length ? that.categories[0].id : null,
                vendor_sub_cat_id: that.sub_categories.length ? that.sub_categories[0].id : null,
                is_active: 1,
                size: null,
                case_cost: null,
                minimum_order_type: 'Each',
                id: null,
                substitute_for: null,
				sub_dd_options: that.filterItems(null, that.categories.length ? that.categories[0].id : null)
            })
        };

        that.removeUniqueItem = function ($index, item) {
            if (!that.uniqueItem[$index].id) {
                that.uniqueItem.splice($index, 1);
            } else {

                var vendor_id = that.searchParams.vendor_id;

                that.api.delete_my_sku(vendor_id, that.uniqueItem[$index].id).then(function (res) {
                        if (res.data.data.code === 1000) {
                            for (var i = 0; that.uniqueItem.length > i; i++) {
                                if (item.id === that.uniqueItem[i].id) {
                                    that.uniqueItem.splice(i, 1);
                                    break;
                                }
                            }
                            that.search();
                        }
                    }
                )
            }
        };


        that.search = function (keyword) {
            that.api.get_active_inventory_by_vendor({
                inventory_type_id: 1,
                caller: 'sub_list'
            }, that.searchParams.restaurant_id).then(function (res) {
                that.inventoryItemsForSubCheck = res.data.data.sku;
                that.inventoryItems = JSON.parse(JSON.stringify(that.inventoryItemsForSubCheck));
                that.inventoryItems = that.inventoryItems.filter(function (x) {
                    return x.substitute_for == null
                });

                that.searchModel.inRequest = true;

                var m = {
                    order_by: that.searchModel.order_by,
                    order_way: that.searchModel.order_way,
                    paginationOffset: that.searchModel.paginationOffset,
                    paginationCount: that.searchModel.paginationCount,
                    filter: that.searchModel.filter,
                    inventory_type_id: 1,

                    city: that.searchModel.city,
                    item_name: that.searchModel.item_name,
                    sub_category: that.searchModel.sub_category,
                    vendor_sku: that.searchModel.vendor_sku,
                    category: that.searchModel.category
                };

                for (var i in m) {
                    if (m[i] == null) {
                        delete m[i]
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

                var vendorId = that.searchParams.vendor_id;

                that.api.get_inventory_by_vendor(m, vendorId).then(function (res) {
                    try {
                        $('.modal').animate({scrollTop:0},200);
                        that.uniqueItem = res.data.data.sku;
                        that.searchModel.paginationTotal = res.data.data.total;
                        INVENTORIES = angular.copy(that.uniqueItem);
						that.uniqueItem = that.uniqueItem.map(function(x){x.sub_dd_options = that.filterItems(x.id, x.vendor_cat_id); return x;});
                        that.searchModel.inRequest = false;
                    } catch (e) {
                        console.log(e);
                        that.searchModel.inRequest = false;
                    }
                }, function () {
                    that.searchModel.inRequest = false;
                });
            });
        };

        that.getMyItems = function (keyword) {

            if (!checkChanges()) {
                SweetAlert.swal({
                        title: "Save changes?",
                        text: "Changes not been saved yet!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#337ab7",
                        confirmButtonText: "Save"
                    },
                    function (res) {
                        if (res) {
                            that.form.$setSubmitted();
                            that.submit(that.form).then(function () {
                                that.search(keyword);
                            })
                        } else {
                            that.search(keyword);
                        }
                    });
            } else {
                that.search(keyword);
            }
        };

        that.getMyItems();


        that.cancel = function () {
            if (!checkChanges()) {
                SweetAlert.swal({
                        title: "Save changes?",
                        text: "Changes not been saved yet!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#337ab7",
                        confirmButtonText: "Save"
                    },
                    function (res) {
                        if (res) {
                            that.form.$setSubmitted();
                            that.submit(that.form).then(function () {
                                $uibModalInstance.dismiss('cancel');
                            })
                        } else {
                            $uibModalInstance.dismiss('cancel');
                        }
                    });
            } else {
                $uibModalInstance.dismiss('cancel');
            }
        };
    }

    addUniqueItemsController.$inject = ['$uibModalInstance', 'alertService', 'api', 'core', 'searchParams', 'SweetAlert', '$q'];
    angular
        .module('inspinia')
        .controller('addUniqueItemsController', addUniqueItemsController)

})();