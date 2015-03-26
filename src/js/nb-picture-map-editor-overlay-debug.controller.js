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
		.controller('nbPictureMapEditorOverlayDebugController', nbPictureMapEditorOverlayDebugController);

	nbPictureMapEditorOverlayDebugController.$inject = ['$scope', '$element', '$attrs', '$timeout', '$q', '_', 'nbPictureConfig', 'nbPictureUtilService', 'nbPictureService', 'dialogService', 'PICTURE_SHAPE'];
	function nbPictureMapEditorOverlayDebugController ($scope, $element, $attrs, $timeout, $q, _, nbPictureConfig, nbPictureUtilService, nbPictureService, dialogService, PICTURE_SHAPE) {
		/*jshint validthis: true */
		var overlayId = 'editorDebug'; // {String} Overlay ID as defined in config.
		var flags = {
			init: false, // {Boolean} Whether init() has been fired.
			initOverlay: false // {Boolean} Whether initOverlay() has been fired.
		};
		var deregister = [];
		var completeWatch = angular.noop;
		var pictureId;

		$scope.areas = []; // {Array} Array of highlighted map areas (not necessarily all).

		/**
		 *
		 */
		this.init = function () {
			if (flags.init) {
				return;
			}

			flags.init = true;

			(function () {
				var watch = $scope.$watch('$parent.$parent.picture.$$id', function (newValue, oldValue) {
					if (newValue) {
						pictureId = newValue;
						watch();
					}
				});
				deregister.push(watch);
			})();

			// Create a one-time watcher for `picture.$$complete`. This is needed
			// because the directive might fire its controller's `init()` after
			// the image has been loaded. If this happened, then the controller
			// would not see the `nbPicture:baseLoad` event.
			(function () {
				completeWatch = $scope.$watch('$parent.$parent.picture.$$complete', function (newValue, oldValue) {
					if (newValue) {
						onBaseLoad();
					}
				});
				deregister.push(completeWatch);
			})();

			deregister.push($scope.$on('nbPicture:baseLoad', function (e) {
				onBaseLoad();
			}));

			deregister.push($scope.$on('nbPicture:baseError', function (e) {
				completeWatch();

				if (nbPictureService.onBaseError(pictureId, overlayId)) {
					render();
				}
			}));
		};

		/**
		 *
		 */
		this.destroy = function () {
			_.forEach(deregister, function (fn) {
				fn();
			});
		};

		/**
		 *
		 */
		function onBaseLoad () {
			completeWatch();

			initOverlay();

			if (nbPictureService.onBaseLoad(pictureId, overlayId)) {
				render();
			}
		}

		/**
		 *
		 */
		function initOverlay () {
			if (flags.initOverlay) {
				return;
			}

			flags.initOverlay = true;

			$scope.overlay = nbPictureService.getMapOverlay(pictureId, overlayId);

			if ($scope.overlay.debounceRender) {
				deregister.push($scope.$on('nbPicture:resize', debounce(render, $scope.overlay.debounceRender)));
			}
			else {
				deregister.push($scope.$on('nbPicture:resize', render));
			}

			deregister.push($scope.$on('nbPicture:render', render));
		}

		/**
		 *
		 */
		function render () {
			var buildFn = nbPictureConfig.map.overlays.editorDebug.build;
			var areas = _.cloneDeep(nbPictureService.getMapOverlayAreas(pictureId, overlayId));

			_.forEach(areas, function (area, index) {
				area.$$centerCoords = nbPictureUtilService.getCenter(area.shape, area.$$coords, true);

				var build = buildFn(area);

				$q.when(build.content)
					.then(
						function (data) {
							area.$$content = data;
						},
						function (err) {
							area.$$content = err;
						}
					);
				$q.when(build.style)
					.then(
						function (data) {
							area.$$style = data;
						},
						function (err) {
							area.$$style = err;
						}
					);
			});

			$scope.areas = areas;
		}
	}
})(window, window.angular);