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
            that.refbooks = res;
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

        that.item_name_lookup = function (search_for) {
            return that.api.item_name_lookup({
                search_for: search_for,
                vendor_id: that.searchParams.vendor_id
            }).then(function (res) {
                return res.data.data.name;
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
            that.changeMOT($index);
            that.uniqueItem[$index].vendor_sub_cat_id = $item.vendor_sub_cat_id;
            that.uniqueItem[$index].tare_type_id = $item.tare_type_id;
            that.uniqueItem[$index].full_weight = $item.full_weight;
            that.uniqueItem[$index].pack = $item.pack;
            that.uniqueItem[$index].case_cost = $item.case_cost;
            that.uniqueItem[$index].pack_cost = $item.pack_cost;
            that.setWeights($index, $item.vendor_cat_id, $item.vendor_sub_cat_id, $item.tare_type_id);
            that.calculate($index);
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
                    if (that.uniqueItem[$index].vendor_cat_id === 76) {
                        that.uniqueItem[$index].tare_weight = 0;
                        that.uniqueItem[$index].content_weight = f * c;
                    }
                }
            }

            if ((cat_id && sub_cat_id) && (cat_id == 74 || cat_id == 75 || cat_id == 99)) {
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
                src: '',
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
                substitute_for: null,
				sub_dd_options: that.filterItems(null, that.categories.length ? that.categories[0].id : null)
            })
        };

        that.changeMOT = function ($index) {
            that.uniqueItem[$index].full_weight = null;
            if (that.uniqueItem[$index].vendor_cat_id == 74) {
                that.uniqueItem[$index].minimum_order_type = 'Case';
            } else {
                that.uniqueItem[$index].minimum_order_type = 'Pack';
            }
        }

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
                inventory_type_id: 2,
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
                    inventory_type_id: 2,

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
        .controller('alcoholAddUniqueItemsController', addUniqueItemsController)

})();