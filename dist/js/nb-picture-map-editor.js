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
		.module('nb.pictureMapEditor', [
			'dialogService',
			'ngDragDrop',
			'nb.icon',
			'nb.lodash',
			'nb.picture',
			'nb.pictureMapEditor.templates'
		]);
})(window, window.angular);
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
		});
})(window, window.angular);
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
		.controller('nbPictureMapEditorOverlayUiController', nbPictureMapEditorOverlayUiController);

	nbPictureMapEditorOverlayUiController.$inject = ['$scope', '$element', '$attrs', '$timeout', '_', 'nbPictureService', 'nbPictureUtilService'];
	function nbPictureMapEditorOverlayUiController ($scope, $element, $attrs, $timeout, _, nbPictureService, nbPictureUtilService) {
		/*jshint validthis: true */
		var overlayId = 'ui'; // {String} Overlay ID as defined in config.
		var flags = {
			init: false, // {Boolean} Whether init() has been fired.
			render: false // {Boolean} Whether render() has been fired.
		};
		var deregister = [];
		var pictureId;

		var tool; // {String} Active tool.

		/**
		 * Fired after the toolbar is dropped.
		 *
		 * @param {Event} event
		 * @param {Object} ui
		 */
		$scope.stopBarDrag = function (event, ui) {
			var $target = jQuery(event.target);
			var position = contain($target);
			$target.css(position);
		};

		/**
		 * Fired after a button in the toolbar is clicked.
		 *
		 * @param {String} id Button ID.
		 */
		$scope.clickButton = function (id) {
			if (tool !== id) {
				_.forEach($scope.overlay.buttons, function (value, key) {
					$scope.overlay.buttons[key].$active = (key === id);
				});
				tool = id;
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

			deregister.push($scope.$watch('$parent.$parent.picture.$$id', function (newValue, oldValue) {
				if (newValue) {
					pictureId = newValue;
				}
			}));

			var onBaseLoad = function () {
				completeWatch();

				$scope.overlay = nbPictureService.getMapOverlay(pictureId, overlayId);

				render();
			};
			var completeWatch = angular.noop;

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
			if (!flags.render) {
				flags.render = true;

				// Add ID to buttons.
				_.forEach($scope.overlay.buttons, function (value, key) {
					$scope.overlay.buttons[key].$$id = key;
				});

				// Activate the first button.
				$scope.clickButton(_.keys($scope.overlay.buttons)[0]);
			}
		}

		/**
		 * Ensures an element is positioned inside the bounds of the overlay.
		 *
		 * @param {jQuery} $target
		 * @returns {Object}
		 */
		function contain ($target) {
			var position = $target.position();
			var x = position.left;
			var y = position.top;
			var width = $target.outerWidth();
			var height = $target.outerHeight();

			var parentWidth = $element.outerWidth();
			var parentHeight = $element.outerHeight();

			if (x < 0) {
				x = 0;
			}
			else if (x + width > parentWidth) {
				x = parentWidth - width;
			}

			if (y < 0) {
				y = 0;
			}
			else if (y + height > parentHeight) {
				y = parentHeight - height;
			}

			return {
				top: y,
				left: x
			};
		}
	}
})(window, window.angular);
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
		.directive('nbPictureMapEditorOverlayUi', nbPictureMapEditorOverlayUiDirective);

	function nbPictureMapEditorOverlayUiDirective () {
		return {
			restrict: 'EA',
			replace: true,
			scope: true,
			controller: 'nbPictureMapEditorOverlayUiController',
			templateUrl: 'templates/nb-picture-map-editor-overlay-ui.html',
			link: function (scope, element, attrs, controller) {
				controller.init();

				scope.$on('$destroy', function () {
					controller.destroy();
				});
			}
		};
	}
})(window, window.angular);
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
		var overlayId = 'uiAreas'; // {String} Overlay ID as defined in config.
		var flags = {
			init: false // {Boolean} Whether init() has been fired.
		};
		var deregister = [];
		var pictureId;

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

			var $parent = $target.parent();
			var parentOffset = $parent.offset();
			var parentWidth = $parent.outerWidth();
			var parentHeight = $parent.outerHeight();

			var absX = event.clientX - parentOffset.left;
			var absY = event.clientY - parentOffset.top;
			var relX = absX / parentWidth;
			var relY = absY / parentHeight;

			var map = nbPictureService.getMap(pictureId);
			var defaultArea = nbPictureConfig.map.overlays.ui.defaultArea;

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

			// Add the area to the map.
			area = nbPictureService.setMapArea(pictureId, area);

			if (area === false) {
				// @todo Handle error
			}
			else {
				// Add the area to the overlay.
				if (nbPictureService.setMapOverlayArea(pictureId, overlayId, area)) {
					dirty = true;
					openAreaDialog(area);
				}
				else {
					// @todo Handle error
				}
			}

			if (dirty) {
				$timeout(function () {
					$scope.$emit('nbPictureMapEditor:mapAreas', nbPictureService.getMapAreas(pictureId));

					render();
					$scope.$apply();
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
					$scope.$emit('nbPictureMapEditor:mapAreas', nbPictureService.getMapAreas(pictureId));

					render();
					$scope.$apply();
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

			deregister.push($scope.$watch('$parent.$parent.$parent.picture.$$id', function (newValue, oldValue) {
				if (newValue) {
					pictureId = newValue;
				}
			}));

			var onBaseLoad = function () {
				completeWatch();

				$scope.overlay = nbPictureService.getMapOverlay(pictureId, overlayId);

				$scope.$emit('nbPictureMapEditor:mapAreas', nbPictureService.getMapAreas(pictureId));

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

			deregister.push($scope.$on('nbPicture:resize', function (e) {
				if (nbPictureService.onResize(pictureId, overlayId)) {
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
		function render () {
			var areas = nbPictureService.getMapOverlayAreas(pictureId, overlayId);

			_.forEach(areas, function (area, index) {
				var center = nbPictureUtilService.getCenter(area.shape, area.$$coords, true);
				var size = nbPictureUtilService.getSize(area.shape, area.$$coords);
				var avgSize = Math.round((size.width + size.height) / 2);

				areas[index].style = {
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
			var config = nbPictureConfig.map.overlays.ui.areaDialog;
			var model;

			if (angular.isFunction(config.model)) {
				model = config.model(area);
			}
			else {
				model = config.model;
			}

			dialogService.open(config.id, config.templateUrl, model, config.options)
				.then(function (result) {
					nbPictureService.setMapArea(pictureId, _.merge({}, area, result));

					$timeout(function () {
						$scope.$emit('nbPictureMapEditor:mapAreas', nbPictureService.getMapAreas(pictureId));

						render();
						$scope.$apply();
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
angular.module('nb.pictureMapEditor.templates', ['templates/nb-picture-map-editor-overlay-ui-areas.html', 'templates/nb-picture-map-editor-overlay-ui.html']);

angular.module("templates/nb-picture-map-editor-overlay-ui-areas.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/nb-picture-map-editor-overlay-ui-areas.html",
    "<span class=\"picture-map-editor-overlay-ui-areas\"\n" +
    "	  ng-click=\"click($event)\">\n" +
    "	<span class=\"picture-map-editor-overlay-ui-area\"\n" +
    "		  ng-repeat=\"area in areas track by area.$$id\"\n" +
    "		  ng-attr-style=\"{{area.style|style}}\"\n" +
    "		  ng-dblclick=\"clickArea(area.$$id)\"\n" +
    "		  jqyoui-draggable=\"{animate: true, onStop: 'stopAreaDrag'}\"\n" +
    "		  data-drag=\"true\">\n" +
    "		<span nb-icon\n" +
    "			  data-id=\"{{overlay.icon.id}}\"\n" +
    "			  data-hover-id=\"{{overlay.icon.hoverId}}\"></span>\n" +
    "	</span>\n" +
    "</span>");
}]);

angular.module("templates/nb-picture-map-editor-overlay-ui.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/nb-picture-map-editor-overlay-ui.html",
    "<div class=\"picture-map-editor-overlay-ui\">\n" +
    "	<div class=\"picture-map-editor-overlay-ui-bar\"\n" +
    "		 jqyoui-draggable=\"{animate: true, onStop: 'stopBarDrag'}\"\n" +
    "		 data-drag=\"true\">\n" +
    "		<div class=\"picture-map-editor-overlay-ui-bar-handle\"></div>\n" +
    "		<ul>\n" +
    "			<li ng-repeat=\"button in overlay.buttons track by button.$$id\">\n" +
    "				<button ng-click=\"clickButton(button.$$id)\"\n" +
    "						ng-class=\"{'active': button.$active}\"\n" +
    "						ng-attr-title=\"{{button.title}}\"\n" +
    "						ng-switch=\"button.$active\">\n" +
    "					<span ng-switch-when=\"true\"\n" +
    "						  nb-icon-once\n" +
    "						  data-title=\"{{button.title}}\"\n" +
    "						  data-color=\"{{overlay.buttonActiveColor}}\"\n" +
    "						  data-id=\"{{button.icon.id}}\"\n" +
    "						  data-hover-id=\"{{button.icon.hoverId}}\"></span>\n" +
    "					<span ng-switch-default\n" +
    "						  nb-icon-once\n" +
    "						  data-title=\"{{button.title}}\"\n" +
    "						  data-color=\"{{overlay.buttonColor}}\"\n" +
    "						  data-id=\"{{button.icon.id}}\"\n" +
    "						  data-hover-id=\"{{button.icon.hoverId}}\"></span>\n" +
    "				</button>\n" +
    "			</li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "	<div nb-picture-map-editor-overlay-ui-areas></div>\n" +
    "</div>\n" +
    "");
}]);
