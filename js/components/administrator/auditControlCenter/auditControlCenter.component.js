(function () {
    'use strict';

	function modalControllerAuditors($uibModalInstance, audit_schedule_item, budget, skrible_auditors, is_admin, user_id, alertService, api) {
        var that = this;
        that.auditor_form = {};
        that.api = api;
		that.audit_schedule_item = audit_schedule_item;
		//that.auditors = JSON.parse(JSON.stringify(audit_schedule_item.auditors));
		that.budget = JSON.parse(JSON.stringify(budget));
		that.budget_copy = JSON.parse(JSON.stringify(budget));
		that.skrible_auditors = skrible_auditors;
		that.is_admin = is_admin;
		that.user_id = user_id;
		var req_auditors_slots = {};
		var auditor_slots = {};
		var schedule_id = audit_schedule_item.id;
		var surcharge_percent = audit_schedule_item.surcharge_percent;
		//		
		
		that.generateAuditorSlots = function () {
			//recall the getdetails API to fetch the latest status of the auditors in case of staleness inactivity
			that.api.get_audit_details({'audit_schedule_id': schedule_id, 'caller': 'admin'}).then(function (res) {
				
				that.auditors = res.data.data.Report.audit_list[0].auditors;
				if(that.is_admin){
					that.audit_status = res.data.data.Report.audit_list[0].status;
					//
					for(var b=0; b<that.budget.length; b++){
						if(!req_auditors_slots.hasOwnProperty(that.budget[b].assigned)){
							req_auditors_slots[that.budget[b].assigned] = [that.budget[b]];
						}
						else{
							req_auditors_slots[that.budget[b].assigned].push(that.budget[b]);
						}
					}
					
					for(var a in req_auditors_slots){
						var total_budget = 0;
						for(var aa in req_auditors_slots[a]){
							total_budget += req_auditors_slots[a][aa].budget_minutes;
						}
						req_auditors_slots[a][0].budget_minutes = total_budget;
					}

					//group together auditors based on assigned
					for(var a=0; a<that.auditors.length; a++){
						if(!auditor_slots.hasOwnProperty(that.auditors[a].assigned)){
							auditor_slots[that.auditors[a].assigned] = [that.auditors[a]];
						}
						else{
							auditor_slots[that.auditors[a].assigned].push(that.auditors[a]);
						}
					}
					
					for(var a in auditor_slots){
						var total_rate = 0, total_minutes = 0;
						for(var aa in auditor_slots[a]){
							total_rate += auditor_slots[a][aa].budget_rate;
							total_minutes += auditor_slots[a][aa].budget_minutes;
						}
						auditor_slots[a][0].budget_rate = total_rate;
						auditor_slots[a][0].budget_minutes = total_minutes;
					}
				}
				
				if(that.is_admin){
					that.auditors = [];
					for(var ra in req_auditors_slots){
						
						/*for(var a in auditor_slots){
							//schedule_id = auditor_slots[a][0].audit_schedule_id;
							break;
						}*/
						if(!auditor_slots.hasOwnProperty(req_auditors_slots[ra][0].assigned)){
							that.auditors.push({'assigned': req_auditors_slots[ra][0].assigned, 'audit_schedule_id': schedule_id, 'auditor_user_id': null, 'budget_rate': null, 'budget_minutes': req_auditors_slots[ra][0].budget_minutes, 'status': 'Pending'});
						}
						else{
							if(auditor_slots[req_auditors_slots[ra][0].assigned][0].auditor_user_id != that.user_id){
								auditor_slots[req_auditors_slots[ra][0].assigned][0].budget_rate = '-';
							}
							that.auditors.push(auditor_slots[req_auditors_slots[ra][0].assigned][0]);
						}
					}
				}
				else{
					var aud_dict = {};
					for(var a in that.auditors){
						if(that.auditors[a].auditor_user_id != that.user_id){
							that.auditors[a].budget_rate = "-";
						}
					}
				}
				//
			});			
		}
		that.generateAuditorSlots();
		
		that.selectAuditor = function (selected_auditor) {
			if(selected_auditor){
				for(var s=0; s<that.skrible_auditors.length; s++){
					if(that.skrible_auditors[s].id == selected_auditor.auditor_user_id){
						selected_auditor.budget_rate = that.skrible_auditors[s].hourly_rate * (selected_auditor.budget_minutes/60);
						selected_auditor.budget_rate *= surcharge_percent / 100; //apply surcharge
						selected_auditor.status = 'Pending';
						break;
					}
				}
			}
		}
		
		that.submit = function (form) {
            if (!form.$valid) {
                return
            }

			var to_save_auditors = [];
			for(var a in that.auditors){
				if(that.auditors[a].auditor_user_id != null){
					var aud_hourly_rate = 0;
					for(var s=0; s<that.skrible_auditors.length; s++){
						if(that.skrible_auditors[s].id == that.auditors[a].auditor_user_id){
							aud_hourly_rate = that.skrible_auditors[s].hourly_rate;
							aud_hourly_rate *= surcharge_percent / 100;	//apply surcharge
							break;
						}
					}
				
					for(var b=0; b<that.budget_copy.length; b++){
						if(that.auditors[a].assigned == that.budget_copy[b].assigned){
							to_save_auditors.push({'audit_schedule_id': schedule_id, 'auditor_user_id': that.auditors[a].auditor_user_id, 'category': that.budget_copy[b].category, 'budget_minutes': that.budget_copy[b].budget_minutes, 'budget_rate': aud_hourly_rate * (that.budget_copy[b].budget_minutes/60), 'assigned': that.auditors[a].assigned, 'status': that.auditors[a].status});
						}
					}
				}
			}
			
			that.api.update_audit_details({'audit_details': {id: schedule_id, auditors: to_save_auditors}}).then(function (res) {
                if (res && res.data.data.code == 1000) {
					alertService.showAlertSave();
                }
				else{
					alertService.showError('Something went wrong!');
				}
            });
		}
		
		that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
	
	function modalControllerNotes($uibModalInstance, audit_schedule_item, alertService, api) {
        var that = this;

        that.notes_form = {};
        that.api = api;
		that.audit_schedule_item = audit_schedule_item;
		
		that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
	
    function auditControlCenterController(api, $state, auth, core, localStorageService, alertService, SweetAlert, $uibModal, restaurant, $rootScope, $scope, $q) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;
        that.core = core;
        that.auth = auth;
		that.form = {};
		that.audit_form = {};
		that.InvType = 'Alcohol';
		that.rest_aud_profile = {};

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });
		
        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions;
        }

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return;
        }

		that.getModes = function () {
			var m_arr = [];
			if(that.subscription_type_id == 1 || that.subscription_type_id == 3 || that.subscription_type_id == 5 || that.subscription_type_id == 7){
				m_arr.push('Alcohol');
			}
			if(that.subscription_type_id == 2 || that.subscription_type_id == 3 || that.subscription_type_id == 6 || that.subscription_type_id == 7){
				m_arr.push('Food');
			}
			return m_arr;
		}
		
		that.changeInvType = function () {
			//reload cc
			that.mode = 'profile';
			that.trans_start_date = new Date();
			that.trans_start_date.setMonth(that.trans_start_date.getMonth() - 1);
			that.trans_end_date = new Date();
			
			that.timesheet_start_date = new Date();
			that.timesheet_end_date = new Date();
			that.timesheet_end_date.setMonth(that.timesheet_end_date.getMonth() + 1);
			that.timesheet_filter_list = ['--All--', 'Pending'];
			that.timesheet_filter = '--All--';
			Promise.all([that.checkEmpType(), that.get_restaurants_list(), that.getSkribleAuditors('performance')]).then(function(response) {
				if(!that.showCCData){
					$state.go('home');
					return;
				}
				if(that.user.userid != 1){
					that.getRestaurantAuditProfile();	//only to produce rates of auditors
					that.changeMode('schedule');
					that.current_auditor = that.user.userid;
				}
				else{
					that.current_auditor = -1;
					that.getRestaurantAuditProfile();
					that.getActiveCategories();
				}
			});
		}
		
		that.saveRestaurantAuditProfile = function () {
			that.api.update_restaurant_audit_profile({'restaurant_id': that.restaurant_id.restaurant_id, 'inventory_type_id': that.InvType == 'Food' ? 1 : 2, audit_profile: that.rest_aud_profile}).then(function (res) {
                if (res && res.data.data.code == 1000) {
					that.getRestaurantAuditProfile();
					alertService.showAlertSave();
                }
				else{
					that.getRestaurantAuditProfile();
					alertService.showError('Something went wrong!');
				}
            });
		}
		
		that.addBudgetEntry = function () {
			that.rest_aud_profile.budget.push({category: null, budget_minutes: null, assigned: null});
		}
		
		that.delBudgetEntry = function ($index) {
			that.rest_aud_profile.budget.splice($index, 1);
			that.recalcTotalBudget();
		}
		
		that.recalcTotalBudget = function () {
			that.total_est_hrs = (that.rest_aud_profile.budget.reduce(function(a, b){return a + b['budget_minutes'];}, 0)) / 60;
		}

        that.getRestaurantAuditProfile = function () {
            that.api.get_restaurant_audit_profile({'restaurant_id': that.restaurant_id.restaurant_id, 'inventory_type_id': that.InvType == 'Food' ? 1 : 2, 'is_admin': that.user.userid == 1 ? true : false}).then(function (res) {
                if (res && typeof res.data.data.Report != 'undefined') {
					that.rest_aud_profile = res.data.data.Report;
					that.recalcTotalBudget();
                }
				else{
					that.rest_aud_profile = {};
					that.rest_aud_profile.contacts = [];
					that.rest_aud_profile.contacts.push({full_name: null, title: null, phone: null}, {full_name: null, title: null, phone: null});
					that.rest_aud_profile.budget = [];
					that.rest_aud_profile.audit_enabled = 0;
					that.rest_aud_profile.replacement_auditor_allowed = 1;
					that.rest_aud_profile.replacement_date_allowed = 1;
					that.rest_aud_profile.wifi_password = null;
					that.rest_aud_profile.internal_notes = null;
				}
            });
        };

		that.getActiveCategories = function () {
			that.api.get_active_SKU_categories({'inventory_type_id': that.InvType == 'Food' ? 1 : 2}).then(function (res) {
				that.SKU_categories = res.data.data.categories;
			});
		}
		
		that.getScheduledAudits = function () {
			that.loading = true;
			if(that.user.userid == 1){
				that.api.get_restaurant_audit_schedule({'restaurant_id': that.restaurant_id.restaurant_id, 'inventory_type_id': that.InvType == 'Food' ? 1 : 2, 'caller': 'admin'}).then(function (res) {
					that.audit_schedule = res.data.data.Report.audit_list;
					that.loading = false;
				});
			}
			else{
				var dayfd = that.timesheet_start_date.getDate();
				var monthfd = that.timesheet_start_date.getMonth() + 1;
				var fd = that.timesheet_start_date.getFullYear() + '-' +
					(('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
					(('' + dayfd).length < 2 ? '0' : '') + dayfd;
					
				var daytd = that.timesheet_end_date.getDate();
				var monthtd = that.timesheet_end_date.getMonth() + 1;
				var td = that.timesheet_end_date.getFullYear() + '-' +
					(('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
					(('' + daytd).length < 2 ? '0' : '') + daytd;
				
				that.api.get_auditor_schedule({'inventory_type_id': that.InvType == 'Food' ? 1 : 2
				, 'user_id': that.user.userid
				, 'start_date': fd, 'end_date': td, 'caller': 'timesheet', 'aud_status':  that.timesheet_filter == '--All--' ? 'All' : 'Upcoming'}).then(function (res) {
					that.audit_schedule = res.data.data.Report.audit_list;
					if(that.current_rest != -1){
						that.audit_schedule = that.audit_schedule.filter(function(x){return x.restaurant_id == that.current_rest});
					}
					for(var aud_s in that.audit_schedule){
						var ast = that.audit_schedule[aud_s];
						ast.budget_rate = ast.auditors.filter(function(x){return x.auditor_user_id == that.user.userid}).reduce(function(x,y){return x+y.budget_rate}, 0);
					}
					that.loading = false;
				});
			}
		}
		
		that.getSkribleAuditors = function (caller) {
			that.api.get_auditors({'restaurant_id': that.restaurant_id.restaurant_id, 'inventory_type_id': that.InvType == 'Food' ? 1 : 2}).then(function (res) {
				that.skrible_auditors = JSON.parse(JSON.stringify(res.data.data.Report));
				if(caller == 'performance'){
					that.skrible_auditor_emps = JSON.parse(JSON.stringify(res.data.data.Report));
					if(that.user.userid == 1){
						that.skrible_auditor_emps.unshift({id: 1, first_name:'Skrible ', last_name:'Admin'});
						that.skrible_auditor_emps.unshift({id: -1, first_name:'--All ', last_name:'Auditors--'});
					}
					else{
						that.skrible_auditor_emps = that.skrible_auditor_emps.filter(function(x){return x.id == that.user.userid});
					}
					
				}

				that.skrible_auditors.unshift({id: null});
			});
		}
		
		that.get_restaurants_list = function () {
			var m = {
				order_by: "name",
				order_way: "ASC",
				paginationOffset: 0
			};

			api.get_restaurants(m).then(function (res) {
				that.rest_list = res.data.data.restaurants_list;
				if(that.rest_list.length){
					that.rest_list = that.rest_list.filter(function(x){return x.subscription_type_id == 5 || x.subscription_type_id == 6 || x.subscription_type_id == 7;});
					that.rest_list.unshift({id: -1, restaurant_name: '--All Restaurants--'});
					that.current_rest = that.rest_list[0].id;
				}
			});
        };
		
		that.getAuditorTransactionSummary = function () {
			that.loading = true;
			that.trans_summary = [];
			that.avg_efficiency = 0;
			var dayfd = that.trans_start_date.getDate();
			var monthfd = that.trans_start_date.getMonth() + 1;
            var fd = that.trans_start_date.getFullYear() + '-' +
                (('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
                (('' + dayfd).length < 2 ? '0' : '') + dayfd;
				
			var daytd = that.trans_end_date.getDate();
			var monthtd = that.trans_end_date.getMonth() + 1;
            var td = that.trans_end_date.getFullYear() + '-' +
                (('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
                (('' + daytd).length < 2 ? '0' : '') + daytd;
				
			var ts_params = {'restaurant_id': that.current_rest, 'auditor_user_id': that.current_auditor, 'inventory_type_id': that.InvType == 'Food' ? 1 : 2, 'start_date': fd, 'end_date': td};
			if(ts_params.restaurant_id == -1){
				delete ts_params.restaurant_id;
			}
			if(ts_params.auditor_user_id == -1){
				delete ts_params.auditor_user_id;
			}
			that.api.get_auditor_transaction_summary(ts_params).then(function (res) {
				that.trans_summary = res.data.data.trans_summary.transactions;
				that.trans_summary = that.trans_summary.filter(function(x){return x.is_adjustment == 0});
				that.company_eff = res.data.data.trans_summary.company_eff;
				that.total_duration = 0;
				var total_efficiency = 0;
				for(var i = 0; i < that.trans_summary.length; i++){
					that.trans_summary[i].review_duration = 0;
					if(that.trans_summary[i].efficiency >= 1.4){
						if(that.trans_summary[i].duration > 0.25 && that.trans_summary[i].duration <= 2){
							that.trans_summary[i].review_duration = 0.25;
						}
						else if(that.trans_summary[i].duration > 2){
							that.trans_summary[i].review_duration = 0.5;
						}
					}
					that.total_duration += (that.trans_summary[i].duration + that.trans_summary[i].review_duration);
					total_efficiency += that.trans_summary[i].efficiency;
				}
				that.avg_efficiency = total_efficiency / (that.trans_summary.length ? that.trans_summary.length : 1);
				that.loading = false;
			});
		}
		
		that.viewAuditors = function (audit_schedule_item) {
            var modalInstance = $uibModal.open({
                templateUrl: 'view_edit_auditors.html',
                controller: modalControllerAuditors,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                resolve: {
                    audit_schedule_item: function () {
                        return audit_schedule_item;
                    },
					budget: function () {
                        return that.rest_aud_profile.budget;
                    },
					skrible_auditors: function () {
                        return that.skrible_auditors;
                    },
					is_admin: function () {
                        return that.user.userid == 1;
                    },
					user_id: function () {
                        return that.user.userid;
                    }
                }
            });

            modalInstance.result.then(function () {
                that.getScheduledAudits();
            }, function () {
               that.getScheduledAudits();
            });
			
        };
		
		that.acceptDenyAudit = function (audit_schedule_item, action_status) {
            var popup_text = "Do you want to "+action_status+" this audit?";

			var title = action_status+"?";
			SweetAlert.swal({
				title: title,
				text: popup_text,
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#337ab7",
				confirmButtonText: "Confirm"
			},
			function (res) {
				if (res) {
					that.api.accept_deny_audit({'audit_schedule_id_list': [audit_schedule_item.id], 'auditor_user_id': that.user.userid, 'update_status' : action_status == 'Accept' ? 'Accepted' : 'Denied'}).then(function (res) {
						alertService.showAlertSave();
						that.mode = '';
						that.changeMode('schedule');
					});
				} 
				else {
					return;
				}
			});
        };
		
		that.viewNotes = function (audit_schedule_item) {
            var modalInstance = $uibModal.open({
                templateUrl: 'view_edit_notes.html',
                controller: modalControllerNotes,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                resolve: {
                    audit_schedule_item: function () {
                        return audit_schedule_item;
                    }
                }
            });

            /*modalInstance.result.then(function () {
                alertService.showAlertSave();
                that.getAllMenu();
            }, function () {
                that.getAllMenu();
            });*/
			
        };
		
		that.checkEmpType = function () {
			var emps = restaurant.data.info.employees;
			that.user = {userid: null, user_type_id: null};
			that.user.userid = that.auth.authentication.user.id;
			if(that.user.userid == 1){
				that.showCCData = true;
				that.showProfileData = true;
			}
			else{
				that.showProfileData = false;
				for (var i = 0; emps.length > i; i++) {
					if(emps[i].id == that.user.userid){
						that.user.user_type_id = emps[i].type_ids;
						if(emps[i].type_ids == 9 || emps[i].type_ids == 10){
							that.showCCData = true;
						}
						else{
							that.showCCData = false;
						}
						break;
					}
				}
			}
		}

		that.changeMode = function (mode) {
			if(that.mode != mode){	//avoid unnecessary calls
				that.mode = mode;
				if(that.mode == 'profile'){
					that.getRestaurantAuditProfile();
				}
				else if(that.mode == 'schedule'){
					that.getScheduledAudits();
					that.getSkribleAuditors();
				}
				else if(that.mode == 'auditor'){
					that.getAuditorTransactionSummary();
				}
			}
		}
		
		this.exportReport = function(type){
			if(type == 'auditor'){
				this.downloadCSV();
			}
		}
		
		this.downloadCSV = function() {
			that.export_loading = true;
            const getData = [];

            that.trans_summary.forEach(function(data) {
                getData.push({
					Restaurant: data.restaurant_name,
                    AuditDate: data.audit_date,
                    Auditor: data.auditor_name,
                    StartTime: data.start_time,
                    EndTime: data.end_time,
                    Duration: data.duration,
                    Budget: (data.budget_in_hrs == null ? 0 : data.budget_in_hrs),
                    Variance: (data.duration - (data.budget_in_hrs == null ? 0 : data.budget_in_hrs)),
					ReviewInMin: data.review_duration * 60,
                    Efficiency: data.efficiency,
                    ErrorRate: data.error_rate,
                    AuditClosedAt: data.audit_closed_at,
                });
            });


            const headers = ['Restaurant', 'AuditDate', 'Auditor', 'StartTime', 'EndTime', 'Duration', 'Budget', 'Variance', 'ReviewInMin', 'Efficiency', 'ErrorRate', 'AuditClosedAt'];
            var csv = (headers.join(',') + '\r\n');

            getData.forEach(function(row) {
                const values = headers.map(function(header) {
                    return row[header];
                })
                csv += (values.join(',') + '\r\n')
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Auditor Performance.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
        that.$onInit = function () {
			that.subscription_type_id = $rootScope.subscription_type_id;
			that.loading = false;
			that.export_loading = false;
			that.changeInvType();
        };
    }

    auditControlCenterController.$inject = ['api', '$state', 'auth', 'core', 'localStorageService', 'alertService', 'SweetAlert', '$uibModal', 'restaurant', '$rootScope', '$scope', '$q'];

    angular.module('inspinia').component('auditControlCenterComponent', {
        templateUrl: 'js/components/administrator/auditControlCenter/auditControlCenter.html',
        controller: auditControlCenterController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
