(function () {

    'use strict';

    function controller(api, $state, auth, localStorageService, $rootScope, restaurant, core,$window) {

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

        that.restaurant_id = localStorageService.get('restaurant_id'); // {restaurant_id : 323}
        that.model = {};
        that.model.res_scores = [];
        that.model.selected_date = "";

        that.timeConverter = function (UNIX_timestamp) {
            /*var a = new Date(UNIX_timestamp);
            var year = a.getFullYear();
            var month = a.getMonth() + 1;
            var date = a.getDate();
            if (date < 10)
            {
                date = '0' + date;
            }
            var time = year + '-' + month + '-' + date;
            return time;*/
			return UNIX_timestamp.substring(0, 10);
        };

        that.model.alcohol_industry_benchmark = 0;
        that.model.res_scores_xform = [];

        that.updateScoreTable = function (sd) {
            if (that.model.reres_scores.length > 0)
            {
                var count = 0;
                var fetch_flag = false;
                that.model.res_scores_xform = [];
                for (var i = 0; i < that.model.reres_scores.length; i++)
                {
                    if (sd == that.model.reres_scores[i].date)
                    {
                        fetch_flag = true;
                    }
                    if (fetch_flag && count < 4)
                    {
                        that.model.res_scores_xform.push({
                            'date': that.model.reres_scores[i].date,
                            'ascore': that.model.reres_scores[i].ascore,
							'fscore': that.model.reres_scores[i].fscore,
                            'industry_benchmark': that.model.reres_scores[i].industry_benchmark
                        });
                        count++;
                    }
                }

                that.model.res_scores_xform = that.model.res_scores_xform.reverse();
                that.model.alcohol_industry_benchmark = that.model.res_scores_xform[count - 1].industry_benchmark;
            }
        };

        that.showScoreDetails = function (s_ele, type) {
            $rootScope.performanceDate = s_ele.date;
			$rootScope.detail_type = type;
            $window.location.href = '#!/admin/performanceScoreDetail';
            //console.log("this is recieve data", $rootScope.performanceDate);
        };


        that.$onInit = function () {
            var resId = that.restaurant_id.restaurant_id;
            that.api.get_scores(resId).then(function (res) {
                that.model.res_scores = res.data.data.scores.scores;
                if (that.model.res_scores.length > 0)
                {
					var ascores = [];
					var fscores = [];
                    for (var i = 0; i < that.model.res_scores.length; i++)
                    {
                        that.model.res_scores[i].date = that.timeConverter(that.model.res_scores[i].date);
						if(that.model.res_scores[i].type == 'Alcohol Cost'){
							ascores.push(that.model.res_scores[i]);
						}
						else if(that.model.res_scores[i].type == 'Food Cost'){
							fscores.push(that.model.res_scores[i]);
						}
                    }
					that.model.reres_scores = [];
					for (var i = 0; i < ascores.length; i++)
                    {
						that.model.reres_scores[i] = {};
                        that.model.reres_scores[i].date = ascores[i].date;
						that.model.reres_scores[i].ascore = ascores[i].score;
						var foundfood = false;
						for (var j = 0; j < fscores.length; j++)
						{
							if(fscores[j].date == ascores[i].date){
								foundfood = true;
								that.model.reres_scores[i].fscore = fscores[i].score;
								break;
							}
						}
						if(!foundfood){
							that.model.reres_scores[i].fscore = null;
						}
                    }
					
                    that.model.selected_date = that.model.reres_scores[0].date;
                    $rootScope.performanceDate = that.model.selected_date;
                    that.updateScoreTable(that.model.selected_date);
                }
            });

            that.api.calc_scores(resId).then(function (res) {
				if(res){
					that.model.res_scores.unshift({date: res.data.data.scores.sd, score: res.data.data.scores.ffs, type: 'Food Cost'});
					that.model.res_scores.unshift({date: res.data.data.scores.sd, score: res.data.data.scores.fs, type: 'Alcohol Cost'});
					var ascores = [];
					var fscores = [];
                    for (var i = 0; i < that.model.res_scores.length; i++)
                    {
                        that.model.res_scores[i].date = that.timeConverter(that.model.res_scores[i].date);
						if(that.model.res_scores[i].type == 'Alcohol Cost'){
							ascores.push(that.model.res_scores[i]);
						}
						else if(that.model.res_scores[i].type == 'Food Cost'){
							fscores.push(that.model.res_scores[i]);
						}
                    }
					that.model.reres_scores = [];
					for (var i = 0; i < ascores.length; i++)
                    {
						that.model.reres_scores[i] = {};
                        that.model.reres_scores[i].date = ascores[i].date;
						that.model.reres_scores[i].ascore = ascores[i].score;
						var foundfood = false;
						for (var j = 0; j < fscores.length; j++)
						{
							if(fscores[j].date == ascores[i].date){
								foundfood = true;
								that.model.reres_scores[i].fscore = fscores[i].score;
								break;
							}
						}
						if(!foundfood){
							that.model.res_scores[i].fscore = null;
						}
                    }
					that.model.selected_date = that.model.res_scores[0].date;
					that.updateScoreTable(that.model.selected_date);
				}
            });

        };
    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$rootScope', 'restaurant', 'core','$window'];

    angular.module('inspinia').component('performanceScoreComponent', {
        templateUrl: 'js/components/performanceScore/performanceScore.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
