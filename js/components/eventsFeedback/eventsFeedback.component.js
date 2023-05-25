(function() {

    'use strict';

    function controller(api, $state, auth, localStorageService, $rootScope, restaurant, core) {

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

        var uxt = +new Date();
        that.locn_details = {};
        that.yes_no = [{
            "name": "Yes"
        }, {
            "name": "No"
        }];
        that.event_types = [];
        that.event_types.push({
            'type': '(+) Add new category'
        });
        that.event_list = [];
        that.repeat_type = [{
            "name": "Daily"
        }, {
            "name": "Weekly"
        }, {
            "name": "Monthly"
        }, {
            "name": "Yearly"
        }, {
            "name": "One time only event"
        }];
        that.repeat_options = [{
            "Sunday": false,
            "Monday": false,
            "Tuesday": false,
            "Wednesday": false,
            "Thursday": false,
            "Friday": false,
            "Saturday": false
        }];
        that.repeat_every_options = [];
        for (var i = 1; i <= 7; i += 1) {
            that.repeat_every_options.push(i);
        }
        that.ends = [{
            "name": "Never"
        }, {
            "name": "On"
        }];
        that.end_n_options = [];
        var pref = 'This event affects ';
        that.locn_type = [{
            "name": pref + "just my restaurant"
        }, {
            "name": pref + "restaurants in my area"
        }, {
            "name": pref + "restaurants throughout my city"
        }, {
            "name": pref + "restaurants throughout my county"
        }, {
            "name": pref + "restaurants throughout my state"
        }, {
            "name": pref + "restaurants throughout across the country"
        }];

        that.restaurant_id = localStorageService.get('restaurant_id'); // {restaurant_id : 323}
        that.model = {};
        that.model.events_feedback_stack = [];
        that.model.curr_stack_id = "";
        that.model.curr_date = "";
        that.model.curr_deviation = "";
        that.resetModel = function() {
            that.model.true_event = that.yes_no[1].name;
            that.model.share = that.yes_no[1].name;
            that.model.selected_event_type = "";
            that.model.is_new_category = false;
            that.model.new_category = "";
            that.model.is_new_event = false;
            that.model.new_event = "";
            that.model.selected_event_name = "";
            that.model.selected_repeat_type = that.repeat_type[0].name;
            that.model.repeat_every = "";
            that.model.selected_locn_type = that.locn_type[0].name;
            that.model.converted_locn_type = 'Self';
            that.model.converted_locn = that.restaurant_id.restaurant_id;
            that.model.ends_n_count = 1;
            that.model.ends_on = "";
            that.model.selected_ends = "";
            that.model.selected_weekly_repeat_option = that.repeat_options;
            that.model.selected_monthly_repeat_option = [{
                name: 'Date of the month',
                selected: true
            }, {
                name: 'Day of the month',
                selected: false
            }];
            that.model.selected_yearly_repeat_option = [{
                name: 'Date of the year',
                selected: true
            }, {
                name: 'Day of the year',
                selected: false
            }];
            that.model.final_repeat_options_string = "";
            that.model.final_ends_string = "";
        }
        that.resetModel();

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

        that.getFeedbackStack = function(resId) {
            console.log("Getting stack");
            that.api.get_feedback_stack(resId).then(function(res) {
                var stack = res.data.data.feedback_stack.feedback_stack;
                var new_stack = [];
                for (i = 0; i < stack.length; i++) {
                    new_stack.push({
                        'id': stack[i].id,
                        'date': that.timeConverter(stack[i].date),
                        'deviation': stack[i].deviation
                    });
                }
                that.model.events_feedback_stack = new_stack;
            });
            that.resetModel();
        }


        that.timeConverter = function(UNIX_timestamp) {
            var a = new Date(UNIX_timestamp);
            var year = a.getFullYear();
            var month = a.getMonth() + 1;
            var date = a.getDate();
            var time = year + '-' + month + '-' + date;
            return time;
        }

        that.getEventCategories = function() {
            that.api.get_event_categories(that.restaurant_id.restaurant_id).then(function(res) {
                that.event_types = [];
                that.event_types.push({
                    'type': '(+) Add new category'
                });
                that.event_types = that.event_types.concat(res.data.data.events.event_categories);
            });
        }

        that.switchFeedback = function(item) {
            //console.log(item);
            that.model.curr_stack_id = item.id;
            that.model.curr_date = item.date;
            that.model.curr_deviation = item.deviation;
            that.resetModel();
        }

        that.updateEvents = function() {
            if (that.model.selected_event_type == '(+) Add new category') {
                that.model.is_new_category = true;
                that.model.is_new_event = true;
                that.model.selected_repeat_type = that.repeat_type[0].name;
                that.updateEnds();
            } else {
                that.model.is_new_category = false;
                if (that.model.selected_event_name == '(+) Add new event') {
                    that.model.is_new_event = true;
                    that.model.selected_repeat_type = that.repeat_type[0].name;
                    that.updateEnds();
                } else {
                    that.model.is_new_event = false;
                    that.model.selected_repeat_type = "";
                    that.model.repeat_every = "";
                    that.model.final_repeat_options_string = "";
                    that.model.final_ends_string = "";
                }

                that.api.get_events(that.restaurant_id.restaurant_id + "&" + that.model.selected_event_type).then(function(res) {
                    that.event_list = [];
                    that.event_list.push({
                        'name': '(+) Add new event'
                    });
                    that.event_list = that.event_list.concat(res.data.data.events.events);
                });
            }
        }

        that.updateForm = function() {
            if (that.model.selected_event_name == '(+) Add new event') {
                that.model.is_new_event = true;
                that.model.selected_repeat_type = that.repeat_type[0].name;
            } else {
                that.model.is_new_event = false;
                that.model.selected_repeat_type = "";
                that.model.repeat_every = "";
                that.model.final_repeat_options_string = "";
                that.model.final_ends_string = "";
            }
        }

        that.updateEnds = function() {
            if (that.model.selected_repeat_type == that.repeat_type[0].name) {
                that.ends = [];
                that.ends = [{
                    "name": "Never"
                }, {
                    "name": "On"
                }];
                that.repeat_every_options = [];
                for (var i = 1; i <= 7; i += 1) {
                    that.repeat_every_options.push(i);
                }
            } else if (that.model.selected_repeat_type == that.repeat_type[4].name) {
                that.ends = [];
                that.ends = [{
                    "name": "On"
                }];
                that.repeat_every_options = [];
                that.model.repeat_every = "";
            } else {
                that.ends = [];
                that.ends = [{
                    "name": "Never"
                }, {
                    "name": "After n occurrences"
                }, {
                    "name": "On"
                }];
                that.repeat_every_options = [];
                that.end_n_options = [];
                if (that.model.selected_repeat_type == that.repeat_type[1].name) {
                    for (var i = 1; i <= 52; i += 1) {
                        that.repeat_every_options.push(i);
                    }
                } else if (that.model.selected_repeat_type == that.repeat_type[2].name) {
                    for (var i = 1; i <= 12; i += 1) {
                        that.repeat_every_options.push(i);
                    }
                } else if (that.model.selected_repeat_type == that.repeat_type[3].name) {
                    for (var i = 1; i <= 10; i += 1) {
                        that.repeat_every_options.push(i);
                    }
                }
                that.end_n_options = that.repeat_every_options;
            }
        }

        that.processRadio = function(obj, sm) {
            var indexOfCheckedRadioInTheKindObject = sm.indexOf(obj);
            angular.forEach(sm, function(value, key) {
                if (indexOfCheckedRadioInTheKindObject != key) {
                    value.selected = false;
                }
            });
        }

        that.convertLocn_Type = function() {
            if (that.model.selected_locn_type == that.locn_type[0].name) {
                that.model.converted_locn_type = 'Self';
                that.model.converted_locn = that.restaurant_id.restaurant_id;
            } else if (that.model.selected_locn_type == that.locn_type[1].name) {
                that.model.converted_locn_type = 'Zip Code';
                that.model.converted_locn = that.locn_details.zip;
            } else if (that.model.selected_locn_type == that.locn_type[2].name) {
                that.model.converted_locn_type = 'City';
                that.model.converted_locn = that.locn_details.city + '_' + that.locn_details.state;
            } else if (that.model.selected_locn_type == that.locn_type[3].name) {
                that.model.converted_locn_type = 'County';
                that.model.converted_locn = that.locn_details.county + '_' + that.locn_details.state;
            } else if (that.model.selected_locn_type == that.locn_type[4].name) {
                that.model.converted_locn_type = 'State';
                that.model.converted_locn = that.locn_details.state;
            } else if (that.model.selected_locn_type == that.locn_type[5].name) {
                that.model.converted_locn_type = 'Country';
                that.model.converted_locn = that.locn_details.country;
            }
        }

        that.next = function(form) {
            if (!form.$valid) return;

            var m = {
                restaurant_id: that.restaurant_id.restaurant_id,
                event_details: []
            };

            if (that.model.is_new_event) {
                if (that.model.selected_repeat_type == 'Daily' || that.model.selected_repeat_type == 'Weekly') {
                    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var sm = that.model.selected_weekly_repeat_option[0];
                    var dwo = [];
                    for (var i in sm) {
                        if (sm[i]) {
                            dwo.push(i);
                        }
                    }
                    if (dwo.length == 0) {
                        dwo.push(days[new Date().getDay()]); //by default will be the day of the date when the prediction was off
                    }
                    that.model.final_repeat_options_string = dwo.join();
                } else if (that.model.selected_repeat_type == 'Monthly') {
                    var sm = that.model.selected_monthly_repeat_option;
                    angular.forEach(sm, function(value, key) {
                        if (value.selected) {
                            that.model.final_repeat_options_string = sm[key].name;
                        }
                    });
                } else if (that.model.selected_repeat_type == 'Yearly') {
                    var sm = that.model.selected_yearly_repeat_option;
                    angular.forEach(sm, function(value, key) {
                        if (value.selected) {
                            that.model.final_repeat_options_string = sm[key].name;
                        }
                    });
                }

                if (that.model.selected_ends == 'Never') {
                    that.model.final_ends_string = 'Never';
                } else if (that.model.selected_ends == 'After n occurrences') {
                    that.model.final_ends_string = 'After ' + that.model.ends_n_count;
                } else if (that.model.selected_ends == 'On') {
                    that.model.final_ends_string = 'On ' + that.model.ends_on;
                }
            }


            m.event_details.push({
                name: that.model.is_new_event ? that.model.new_event : that.model.selected_event_name,
                type: that.model.is_new_category ? that.model.new_category : that.model.selected_event_type,
                date: that.timeConverter(uxt), //this will be the date when the prediction was off
                location_type: 'Self',
                location: that.restaurant_id.restaurant_id,
                suggested_locn_type: that.model.converted_locn_type,
                suggested_locn: that.model.converted_locn,
                repeat_type: that.model.selected_repeat_type,
                repeat_every: that.model.repeat_every,
                repeat_options: that.model.final_repeat_options_string,
                ends: that.model.final_ends_string,
                stack_id: that.model.curr_stack_id

            });



            that.api.set_events(m).then(function(res) {
                try {
                    if (res.data.data.code === 1000) {
                        swal({
                            title: "Thank you!",
                            timer: 1500,
                            showConfirmButton: false,
                            type: "success"
                        });

                                    var s = {
                                        restaurant_id: that.restaurant_id.restaurant_id,
                                        stack_id: that.model.curr_stack_id
                                    };

                                    //console.log("gona update with this");
                                    //console.log(s);
                                    that.api.set_feedback(s).then(function(res) {
                                        try {
                                            if (res.data.data.code === 1000) {
                                                that.model.curr_stack_id = "";
                                                console.log("done?");
                                                that.getFeedbackStack();
                                                //that.$state.go('inventory.inventoryCategories');
                                              }
                                          } catch (e) {
                                              console.log(e)
                                          }
                                      });
                    }
                } catch (e) {
                    console.log(e)
                }
            });


        };


        that.proceed_without_form = function() {
            try {

                swal({
                        title: "Are you sure?",
                        text: "This feedback will really help Artecsan understand your restaurant better.",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#ed5565",
                        confirmButtonText: "Confirm"
                    },
                    function(res) {
                        if (res) {
                            that.$state.go('inventory.inventoryCategories');
                        }
                    });


            } catch (e) {
                console.log(e)
            }
        }


        that.$onInit = function() {
            var resId = that.restaurant_id.restaurant_id;
            that.getFeedbackStack(resId);
            that.api.get_restaurant_location_details(resId).then(function(res) {
                var res_locn = res.data.data.locn_details.locn_details[0];
                that.locn_details.country = res_locn.country;
                that.locn_details.state = res_locn.state;
                that.locn_details.county = res_locn.county;
                that.locn_details.city = res_locn.city;
                that.locn_details.zip = res_locn.zip;
            });

        };
    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$rootScope', 'restaurant', 'core'];

    angular.module('inspinia').component('eventsFeedbackComponent', {
        templateUrl: 'js/components/eventsFeedback/eventsFeedback.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
