(function() {

    'use strict';

    /**
     * @desc Datepicker directive
     * @example <ng-datepicker></ng-datepicker>
     */

    angular
        .module('ngDatepicker', [])
        .directive('ngDatepicker', ngDatepickerDirective);

    function ngDatepickerDirective($templateCache, $compile, $document, datesCalculator) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                allowFuture: '&',
                maxDate: '&',
                minDate: '&'
            },
            link: function(scope, element, attrs, ngModel) {

                var today = moment.utc();
                var dateSelected = '';

                // Data
                scope.calendarCursor  = today;
                scope.currentWeeks    = [];
                scope.daysNameList    = [];
                scope.monthsList      = moment.months();
                scope.yearsList       = [];

                // Display
                scope.pickerDisplayed = false;

                // List all days name in the current locale
                for (var i = 0; i < 7 ; i++) {
                    scope.daysNameList  .push(moment().weekday(i).format('ddd'));
                }

                for (var i = 2005; i <= moment().year(); i++) {
                    scope.yearsList.push(i);
                }

                scope.$watch(function(){ return ngModel.$modelValue; }, function(value){
                    if(moment.isDate(value)){
                        dateSelected = scope.calendarCursor = moment.utc(value);
                    }
                });

                // Ng change enabled ?
                // ngModelCtrl.$viewChangeListeners.push(function() {
                //     scope.$eval(attrs.ngChange);
                // });

                element.bind('click', function() {
                    scope.$apply(function(){
                        scope.pickerDisplayed = true;
                        // $document.on('click', function (e) {
                        //     if (element !== e.target && !element[0].contains(e.target)) {
                        //         scope.$apply(function () {
                        //             scope.pickerDisplayed = false;
                        //         });
                        //      }
                        // });
                    });
                });

                scope.$watch('pickerDisplayed', function(val){
                    if(val){
                        var isHover = false;
                        element.bind('mouseenter mouseleave', function(){
                            isHover = !isHover;
                        });
                    }
                });

                init();

                /**
                 * Display the previous month in the datepicker
                 * @return {}
                 */
                scope.prevMonth = function() {
                    scope.calendarCursor = moment(scope.calendarCursor).subtract(1, 'months');
                    scope.currentWeeks = getWeeks(scope.calendarCursor);
                };

                /**
                 * Display the next month in the datepicker
                 * @return {}
                 */
                scope.nextMonth = function nextMonth() {
                    scope.calendarCursor = moment(scope.calendarCursor).add(1, 'months');
                    scope.currentWeeks = getWeeks(scope.calendarCursor);
                };

                /**
                 * Select a month and display it in the datepicker
                 * @param  {string} month The month selected in the select element
                 * @return {}
                 */
                scope.selectMonth = function selectMonth(month) {
                    scope.calendarCursor = moment(scope.calendarCursor).month(month);
                    scope.currentWeeks = getWeeks(scope.calendarCursor);
                };

                /**
                 * Select a year and display it in the datepicker depending on the current month
                 * @param  {string} year The year selected in the select element
                 * @return {}
                 */
                scope.selectYear = function selectYear(year) {
                    scope.calendarCursor = moment(scope.calendarCursor).year(year);
                    scope.currentWeeks = getWeeks(scope.calendarCursor);
                };

                /**
                 * Select a day
                 * @param  {[type]} day [description]
                 * @return {[type]}     [description]
                 */
                scope.selectDay = function(day) {
                    console.log('Hello', day);
                    ngModel.$setViewValue(day.date);
                    ngModel.$render();
                    scope.pickerDisplayed = false;
                };

                /**
                 * Init the directive
                 * @return {}
                 */
                function init() {
                    var template = angular.element($templateCache.get('datepicker.html'));
                    $compile(template)(scope);
                    element.after(template);

                    if (angular.isDefined(ngModel.$modelValue) && moment.isDate(ngModel.$modelValue)) {
                        scope.calendarCursor = ngModel.$modelValue;
                    }

                    scope.currentWeeks = getWeeks(scope.calendarCursor);
                }

                /**
                 * Get all weeks needed to display a month on the Datepicker
                 * @return {array} list of weeks objects
                 */
                function getWeeks (date) {

                    var weeks = [];
                    var date = moment.utc(date);
                    var firstDayOfMonth = moment(date).date(1);
                    var lastDayOfMonth  = moment(date).date(date.daysInMonth());

                    var startDay = moment(firstDayOfMonth);
                    var endDay   = moment(lastDayOfMonth);
                    // NB: We use weekday() to get a locale aware weekday
                    startDay = firstDayOfMonth.weekday() === 0 ? startDay : startDay.weekday(0);
                    endDay   = lastDayOfMonth.weekday()  === 6 ? endDay   : endDay.weekday(6);

                    var currentWeek = [];

                    for (var start = moment(startDay); start.isBefore(moment(endDay).add(1, 'days')); start.add(1, 'days')) {

                        var day = {
                            date: moment(start).toDate(),
                            isToday: start.isSame(today, 'day'),
                            isInMonth: start.isSame(firstDayOfMonth, 'month'),
                            isSelected: start.isSame(dateSelected, 'day'),
                            isFuture: start.isAfter(today)
                        };

                        currentWeek.push(day);

                        if (start.weekday() === 6 || start === endDay) {
                            weeks.push(currentWeek);
                            currentWeek = [];
                        }
                    }

                    return weeks;
                }
            }
        };
    }
    ngDatepickerDirective.$inject = ["$templateCache", "$compile", "$document", "datesCalculator"];

})();

(function(){

    'use strict';

    /**
     * @desc Dates calculator factory
     */

     angular
         .module('ngDatepicker')
         .factory('datesCalculator', datesCalculator);

    function datesCalculator () {

        function getWeeks () {

        }

        return {
            getWeeks: getWeeks
        };
    }

})();

(function() {

    'use strict';

    /**
     * @desc ClickOutside directive: Resolve expression when a click outside an element is fired
     * @example <div clickOutside="fn()"></div>
     */

    angular
        .module('ngDatepicker')
        .directive('outsideClick', clickOutside);

    function clickOutside () {
        return {
            link: function(scope, element, attrs) {

                
                // var closest = function(el, fn) {
                //     return el && (fn(el) ? el : closest(el.parentNode, fn));
                // };
                //
                // $document.bind('click', function(event) {
                //     var elem;
                //     elem = closest(event.target, function(el) {
                //         return el.isSameNode($element[0]);
                //     });
                //     if (!elem) { $scope.$apply($attributes.outsideClick); }
                // });
            }
        };
    }

})();

angular.module("ngDatepicker").run(["$templateCache", function($templateCache) {$templateCache.put("datepicker.html","<div class=\"ng-datepicker\" ng-show=\"pickerDisplayed\">\n    <div class=\"mb-table-header-bckgrnd\"></div>\n    <table>\n        <caption>\n            <div class=\"header-year-wrapper\">\n                <span style=\"display: inline-block; float: left; cursor: pointer\" class=\"noselect\" ng-click=\"prevMonth()\"><svg class=\"icon-select-arrow-right\"><symbol id=\"icon-select-arrow-right\" viewBox=\"0 0 1024 1024\">\n	<title>select-arrow-right</title>\n	<path class=\"path1\" d=\"M350.293 707.627l195.627-195.627-195.627-195.627 60.373-60.373 256 256-256 256z\"></path>\n</symbol></svg></span>\n                <div class=\"header-year noselect\" ng-class=\"noselect\">\n                    <div class=\"mb-custom-select-box\" outside-click=\"showMonthsList = false\">\n                        <span class=\"ng-custom-select-title mb-month-name\" ng-click=\"showMonthsList = !showMonthsList; showYearsList = false\" ng-class=\"{selected: showMonthsList }\">{{ calendarCursor.format(\'MMMM\') }}</span>\n                        <div class=\"mb-custom-select\" ng-show=\"showMonthsList\">\n                            <span ng-repeat=\"monthName in monthsList\" ng-click=\"selectMonth(monthName)\">{{ monthName }}</span>\n                        </div>\n                    </div>\n                    <div class=\"mb-custom-select-box\" outside-click=\"showYearsList = false\">\n                        <span class=\"ng-custom-select-title\" ng-click=\"showYearsList = !showYearsList; showMonthsList = false\" ng-class=\"{selected: showYearsList }\">{{ calendarCursor.format(\'YYYY\') }}</span>\n                        <div class=\"mb-custom-select\" ng-show=\"showYearsList\">\n                            <span ng-repeat=\"yearNumber in yearsList\" ng-click=\"selectYear(yearNumber)\">{{ yearNumber }}</span>\n                        </div>\n                    </div>\n                </div>\n                <span style=\"display: inline-block; float: right; cursor: pointer\" class=\"noselect\" ng-click=\"nextMonth()\">></span>\n            </div>\n        </caption>\n        <tbody>\n            <tr class=\"days-head\">\n                <td class=\"day-head\" ng-repeat=\"dayName in daysNameList\">{{ dayName }}</td>\n            </tr>\n            <tr class=\"days\" ng-repeat=\"week in currentWeeks\">\n                <td ng-repeat=\"day in week\" ng-click=\"selectDay(day)\" ng-class=\"[\'day-item\', { \'isToday\': day.isToday, \'isInMonth\': day.isInMonth, \'isFuture\': day.isFuture && !allowFuture, \'day-selected\': day.isSelected }]\">{{ day.date | date:\'dd\' }}</td>\n            </tr>\n        </tbody>\n    </table>\n</div>\n");}]);