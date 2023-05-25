(function () {

    'use strict';

    function controller(api, $state,$window, auth, localStorageService, $rootScope, SweetAlert, restaurant, core) {

        // if (!auth.authentication.isLogged) {
        //     $state.go('home');
        //     return;
        // }

        var that = this;

        that.form = {};
        that.state = $state;
        that.core = core;
        that.api = api;
        that.auth = auth;

		that.printDiv = function () {
			var printWindow = window.open('', '_blank', 'top=0,left=0');//window.open('', '');
			var htmlContent = '<html><head><title>Print</title>' +
							  '</head><body>' + 
							  document.getElementById('divToPrint').innerHTML + 
							  '</body></html>';
			printWindow.document.open();
			 printWindow.document.write(htmlContent);
			 printWindow.document.close();
			 //window.close()
			printWindow.print();

			// window.open('', '_blank', 'top=0,left=0,height='+this.actualHeight+',width='+this.actualWidth);
			// this.popupWin.document.open();
			// this.popupWin.document.write(``)
			// this.popupWin.document.close();
		  };
		  
		
		
		  
		
        that.$onInit = function () {
			// that.page = 1;
			// that.core.getRefbooks().then(function (res1) {
			// 	that.all_analytics_questionare = res1.analytics_questionare;
			// 	that.change_qns(true);		
			// });
        };
    }

    controller.$inject = ['api', '$window','$state', 'auth', 'localStorageService', '$rootScope', 'SweetAlert', 'restaurant', 'core'];

    angular.module('inspinia').component('accounting', {
        templateUrl: 'js/components/accounting/accounting.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
