/**
 * nb-picture-map-editor demo
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.pictureMapEditor.demo')
		.directive('nbPictureMapEditorDemoInput', nbPictureMapEditorDemoInputDirective);

	nbPictureMapEditorDemoInputDirective.$inject = ['_'];
	function nbPictureMapEditorDemoInputDirective (_) {
		return {
			restrict: 'EA',
			replace: false,
			link: function (scope, element, attrs, controller) {
				scope.model = {};

				scope.$on('nbPicture:mapAreasChanged', function (e, areas) {
					var clone = [];

					_.forEach(areas, function (area) {
						clone.push(_.pick(area, ['shape', 'coords', 'data']));
					});

					scope.model.value = angular.toJson(clone);
				});
			}
		};
	}
})(window, window.angular);