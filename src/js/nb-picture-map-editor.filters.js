/**
 * AngularJS image map editor
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.pictureMapEditor')
		.filter('style', function () {
			return function (input) {
				var str = '';
				_.forEach(input, function (value, key) {
					str += key + ': ' + value + ';';
				});
				return str;
			};
		})
		.filter('trustedHtml', ['$sce', function ($sce) {
				return function (input) {
					return $sce.trustAsHtml(input);
				};
			}]);
})(window, window.angular);