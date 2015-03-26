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
		.controller('nbPictureMapEditorOverlayUiAreasController', nbPictureMapEditorOverlayUiAreasController);

	nbPictureMapEditorOverlayUiAreasController.$inject = ['$scope', '$element', '$attrs', '$timeout', '_', 'nbPictureConfig', 'nbPictureUtilService', 'nbPictureService', 'dialogService', 'PICTURE_SHAPE'];
	function nbPictureMapEditorOverlayUiAreasController ($scope, $element, $attrs, $timeout, _, nbPictureConfig, nbPictureUtilService, nbPictureService, dialogService, PICTURE_SHAPE) {
		/*jshint validthis: true */
		var overlayId = 'editorUiAreas'; // {String} Overlay ID as defined in config.
		var flags = {
			init: false // {Boolean} Whether init() has been fired.
		};
		var deregister = [];
		var pictureId;
		var $body = jQuery('body');

		$scope.areas = []; // {Array} Array of highlighted map areas (not necessarily all).

		/**
		 * Fired after clicking on the markers element.
		 *
		 * @param {Event} event
		 */
		$scope.click = function (event) {
			var $target = jQuery(event.target);

			if (!$target.scope || $target.scope() !== $scope) {
				return;
			}

			var dirty = false;

			var scrollTop = $body.scrollTop() || 0;
			var scrollLeft = $body.scrollLeft() || 0;

			var $parent = $target.parent();
			var parentOffset = $parent.offset();
			var parentWidth = $parent.outerWidth();
			var parentHeight = $parent.outerHeight();

			var absX = scrollLeft + event.clientX - parentOffset.left;
			var absY = scrollTop + event.clientY - parentOffset.top;
			var relX = absX / parentWidth;
			var relY = absY / parentHeight;

			var map = nbPictureService.getMap(pictureId);
			var defaultArea = nbPictureConfig.map.overlays.editorUi.defaultArea;

			// Build the area.
			var area = {
				shape: _.cloneDeep(defaultArea.shape)
			};

			if (angular.isFunction(defaultArea.coords)) {
				if (map.relCoords) {
					area.coords = defaultArea.coords(relX, relY);
				}
				else {
					area.coords = defaultArea.coords(absX, absY);
				}
			}
			else {
				area.coords = _.cloneDeep(defaultArea.coords);
			}

			if (map.relCoords) {
				area.$$coords = nbPictureUtilService.relToAbsCoords(area.shape, area.coords, parentWidth, parentHeight, true);
			}
			else {
				area.$$coords = _.cloneDeep(area.coords);
			}

			area.coords = _.map(area.coords, precision);
			area.$$coords = _.map(area.$$coords, precision);

			// Add the area to the map and overlays.
			area = nbPictureService.setMapArea(pictureId, area);

			if (area === false) {
				// @todo Handle error
			}
			else {
				dirty = true;
				openAreaDialog(area);
			}

			if (dirty) {
				$timeout(function () {
					$scope.$emit('nbPicture:mapAreasChanged', nbPictureService.getMapAreas(pictureId));
				});
			}
		};

		/**
		 *
		 * @param {String} areaId
		 */
		$scope.clickArea = function (areaId) {
			var area = nbPictureService.getMapArea(pictureId, areaId);

			if (area) {
				openAreaDialog(area);
			}
		};

		/**
		 * Fired at end of dragging a marker.
		 *
		 * @param {Event} event
		 * @param {Object} ui
		 */
		$scope.stopAreaDrag = function (event, ui) {
			var dirty = false;

			var $marker = jQuery(event.target);
			var position = $marker.position();
			var areaId = $marker.scope().area.$$id;

			var $parent = $marker.parent();
			var parentWidth = $parent.outerWidth();
			var parentHeight = $parent.outerHeight();

			var absX = position.left;
			var absY = position.top;
			var relX = absX / parentWidth;
			var relY = absY / parentHeight;

			var map = nbPictureService.getMap(pictureId);
			var area = nbPictureService.getMapArea(pictureId, areaId);
			var contains = nbPictureUtilService.contains(PICTURE_SHAPE.RECTANGLE, [0, 0, parentWidth, parentHeight], [absX, absY]);

			if (map && area && contains) {
				if (map.relCoords) {
					area.coords[0] = relX;
					area.coords[1] = relY;
				}
				else {
					area.coords[0] = absX;
					area.coords[1] = absY;
				}

				if (map.relCoords) {
					area.$$coords = nbPictureUtilService.relToAbsCoords(area.shape, area.coords, parentWidth, parentHeight, true);
				}
				else {
					area.$$coords = _.cloneDeep(area.coords);
				}

				area.coords = _.map(area.coords, precision);
				area.$$coords = _.map(area.$$coords, precision);

				dirty = nbPictureService.setMapArea(pictureId, area);
			}
			else {
				dirty = nbPictureService.deleteMapArea(pictureId, areaId);
			}

			if (dirty) {
				$timeout(function () {
					$scope.$emit('nbPicture:mapAreasChanged', nbPictureService.getMapAreas(pictureId));
				});
			}
		};

		/**
		 *
		 */
		this.init = function () {
			if (flags.init) {
				return;
			}

			flags.init = true;

			(function () {
				var watch = $scope.$watch('$parent.$parent.$parent.picture.$$id', function (newValue, oldValue) {
					if (newValue) {
						pictureId = newValue;
						watch();
					}
				});
				deregister.push(watch);
			})();

			var onBaseLoad = function () {
				completeWatch();

				$scope.overlay = nbPictureService.getMapOverlay(pictureId, overlayId);

				$scope.$emit('nbPicture:mapAreasChanged', nbPictureService.getMapAreas(pictureId));

				if (nbPictureService.onBaseLoad(pictureId, overlayId)) {
					render();
				}
			};
			var completeWatch = angular.noop;

			// Create a one-time watcher for `picture.$$complete`. This is needed
			// because the directive might fire its controller's `init()` after
			// the image has been loaded. If this happened, then the controller
			// would not see the `nbPicture:baseLoad` event.
			(function () {
				completeWatch = $scope.$watch('$parent.$parent.$parent.picture.$$complete', function (newValue, oldValue) {
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

			deregister.push($scope.$on('nbPicture:resize', render));
			deregister.push($scope.$on('nbPicture:render', render));
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
		function render () {
			var areas = _.cloneDeep(nbPictureService.getMapOverlayAreas(pictureId, overlayId));

			_.forEach(areas, function (area, index) {
				var center = nbPictureUtilService.getCenter(area.shape, area.$$coords, true);
				var size = nbPictureUtilService.getSize(area.shape, area.$$coords);
				var avgSize = Math.round((size.width + size.height) / 2);

				area.$$style = {
					'top': center[1] + 'px',
					'left': center[0] + 'px',
					'font-size': avgSize + 'px'
				};
			});

			$scope.areas = areas;
		}

		/**
		 *
		 * @param {Object} area
		 */
		function openAreaDialog (area) {
			var config = nbPictureConfig.map.overlays.editorUi.areaDialog;
			var model;

			if (angular.isFunction(config.model)) {
				model = config.model(area);
			}
			else {
				model = config.model;
			}

			model.$$map = nbPictureService.getMap(pictureId);

			dialogService.open(config.id, config.templateUrl, model, config.options)
				.then(function (result) {
					nbPictureService.setMapArea(pictureId, _.merge({}, area, result));

					$timeout(function () {
						$scope.$emit('nbPicture:mapAreasChanged', nbPictureService.getMapAreas(pictureId));
					});
				});
		}

		/**
		 *
		 * @param {Number} value
		 * @returns {Number}
		 */
		function precision (value) {
			return Number(Number(value).toFixed(3));
		}
	}
})(window, window.angular);