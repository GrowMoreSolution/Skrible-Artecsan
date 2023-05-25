var appConfig = {
    apiDomain: 'http://dev-api.artecsan.com/',
	// apiDomain: 'https://api.artecsan.com/',
    token: null,
    apiAuthorization: 'Basic T2ZmZXJCb3hXRUJDbDFlbnQ6T2ZmZXJCb3hXRUJTM2NyM3Q=',
    googleCaptcha: '6Lc17RIUAAAAACKwIeV24O6S51nMWvzNqRxX8tm_',
    sessionExpires: 9, // hours
    apiBincodesDomain: 'https://api.bincodes.com/'
    
};

var ENV = '@@CONFIG_ENV';

if (ENV === 'production') {
    appConfig.apiDomain = 'http://dev-api.artecsan.com/';
    // appConfig.apiDomain = 'https://api.artecsan.com/';
} else if (ENV === 'staging') {

}


function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, IdleProvider, localStorageServiceProvider, $httpProvider, $locationProvider) {

    // Configure Idle settings
    IdleProvider.idle(5); // in seconds
    IdleProvider.timeout(120); // in seconds
    localStorageServiceProvider.setPrefix('artecsan');
    $httpProvider.interceptors.push('interceptorService');
    $locationProvider.html5Mode(false).hashPrefix('!');

    $urlRouterProvider.otherwise("/home");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider
        .state('admin', {
            abstract: true,
            url: "/admin",
            templateUrl: "views/common/content.html"
        })
        .state('admin.homeMenu', {
            url: "/home_menu",
            templateUrl: "views/homeMenu.html",
            controller: 'homeMenuController',
			controllerAs: '$ctr',
            data: {pageTitle: 'Home'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                        },
                        {
                            name: 'ui.footable',
                            files: ['js/plugins/footable/angular-footable.js']
                        },
                        {
                            serie: true,
                            files: ['css/plugins/c3/c3.min.css', 'js/plugins/d3/d3.min.js', 'js/plugins/c3/c3.min.js']
                        },
                        {
                            serie: true,
                            name: 'gridshore.c3js.chart',
                            files: ['js/plugins/c3/c3-angular.min.js']
                        }
                    ]);
                }
            }
        })
        .state('admin.managementCategories', {
            url: "/management_categories",
            templateUrl: "views/managementCategories.html",
            data: {pageTitle: 'Management Categories'}
        })
        .state('admin.inventoryAuditAsk', {
            url: "/inventory-audit-ask",
            templateUrl: "views/inventoryAuditAsk.html",
            data: {pageTitle: 'Inventory Audit'}
        })
        .state('admin.inventoryCategories', {
            url: "/inventory_categories",
            templateUrl: "views/inventoryCategories.html",
            data: {pageTitle: 'Inventory Categories'}
        })
        .state('admin.comingSoon', {
            url: "/coming_soon",
            templateUrl: "views/comingSoon.html",
            data: {pageTitle: 'Coming Soon'}
        })
        .state('food', {
            abstract: true,
            url: "/food",
            templateUrl: "views/common/content.html",
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                        },
                        {
                            name: 'ui.footable',
                            files: ['js/plugins/footable/angular-footable.js']
                        }
                    ]);
                }
            }
        })
        .state('alcohol', {
            abstract: true,
            url: "/alcohol",
            templateUrl: "views/common/content.html",
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                        },
                        {
                            name: 'ui.footable',
                            files: ['js/plugins/footable/angular-footable.js']
                        }
                    ]);
                }
            }
        })
        .state('foodSubCategories', {
            url: "/food_sub_categories",
            templateUrl: "views/foodSubCategories.html",
            data: {pageTitle: 'Food Sub Categories'}
        })
		.state('foodAuditCategories', {
            url: "/food_audit_categories",
            templateUrl: "views/foodAuditCategories.html",
            data: {pageTitle: 'Food Audit Categories'}
        })
        .state('alcoholSubCategories', {
            url: "/alcohol_sub_categories",
            templateUrl: "views/alcoholSubCategories.html",
            data: {pageTitle: 'Alcohol Sub Categories'}
        })
        // .state('food.orderSummary', {
        //     url: "/order_summary",
        //     templateUrl: "views/orderSummary.html",
        //     data: {pageTitle: 'Order Summary'}
        // })
        .state('reports.food', {
            url: "/food",
            template: "<ui-view></ui-view>",
            abstract: true
        })
        .state('reports.alcohol', {
            url: "/alcohol",
            template: "<ui-view></ui-view>",
            abstract: true
        })
        .state('reports.alcohol.alcoholDetail', {
            url: "/alcohol_detail",
            templateUrl: "views/alcoholDetail.html",
			controller: 'alcoholDetailController',
            data: {pageTitle: 'Alcohol Detail'},
			resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                        },
                        {
                            name: 'ui.footable',
                            files: ['js/plugins/footable/angular-footable.js']
                        },
                        {
                            serie: true,
                            files: ['css/plugins/c3/c3.min.css', 'js/plugins/d3/d3.min.js', 'js/plugins/c3/c3.min.js']
                        },
                        {
                            serie: true,
                            name: 'gridshore.c3js.chart',
                            files: ['js/plugins/c3/c3-angular.min.js']
                        }
                    ]);
                }
            }
        })
        /*.state('reports.food.foodDetail', {
            url: "/food_detail",
            templateUrl: "views/foodDetail.html",
            data: {pageTitle: 'Food Detail'}
        })*/
        .state('food.inventoryPurchases', {
            url: "/inventory_purchases",
            templateUrl: "views/inventoryPurchases.html",
            data: {pageTitle: 'Inventory Purchases'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/moment/moment.min.js']
                        },
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                        }

                    ]);
                }
            }
        })
        .state('food.costOfSales', {
            url: "/cost_of_sales",
            templateUrl: "views/costOfSales.html",
            data: {pageTitle: 'Cost Of Sales'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/moment/moment.min.js']
                        },
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                        }

                    ]);
                }
            }
        })
		.state('setupFirstAudit', {
            url: "/setup_first_audit",
            templateUrl: "views/setupFirstAudit.html",
            data: {pageTitle: 'First Audit'}
        })
        // .state('performanceScore', {
        //     url: "/performance_score",
        //     templateUrl: "views/performanceScore.html",
        //     data: {pageTitle: 'Performance Score'}
        // })
}

angular
    .module('inspinia')
    .config(config)
    .constant('appConfig', appConfig)
    .run(function ($rootScope, $state, core, auth) {
        $rootScope.$state = $state;
		$rootScope.$on("$stateChangeSuccess", function (event, currentRoute, previousRoute) {
            $("html, body").animate({scrollTop: 1});
        });
        core.init();
        auth.fillAuthData();
    });
