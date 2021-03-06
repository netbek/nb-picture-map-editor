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
		.directive('nbPictureMapEditorOverlayUiAreas', nbPictureMapEditorOverlayUiAreasDirective);

	function nbPictureMapEditorOverlayUiAreasDirective () {
		return {
			restrict: 'EA',
			replace: true,
			scope: true,
			controller: 'nbPictureMapEditorOverlayUiAreasController',
			templateUrl: 'templates/nb-picture-map-editor-overlay-ui-areas.html',
			link: function (scope, element, attrs, controller) {
				controller.init();

				scope.$on('$destroy', function () {
					controller.destroy();
				});
			}
		};
	}
})(window, window.angular);