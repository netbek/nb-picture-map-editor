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
		})
		.filter('trustedHtml', ['$sce', function ($sce) {
				return function (input) {
					return $sce.trustAsHtml(input);
				};
			}]);
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
		.module('nb.picture')
		.directive('nbPictureMapEditor', nbPictureMapEditorDirective);

	function nbPictureMapEditorDirective () {
		return {
			restrict: 'EA',
			link: function (scope, element, attrs, controller) {
				element.addClass('picture-map-editor');
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
		.controller('nbPictureMapEditorOverlayUiController', nbPictureMapEditorOverlayUiController);

	nbPictureMapEditorOverlayUiController.$inject = ['$scope', '$element', '$attrs', '$timeout', '_', 'nbPictureService', 'nbPictureUtilService'];
	function nbPictureMapEditorOverlayUiController ($scope, $element, $attrs, $timeout, _, nbPictureService, nbPictureUtilService) {
		/*jshint validthis: true */
		var overlayId = 'editorUi'; // {String} Overlay ID as defined in config.
		var flags = {
			init: false, // {Boolean} Whether init() has been fired.
			initTools: false // {Boolean} Whether initTools() has been fired.
		};
		var deregister = [];
		var pictureId;

		var tools; // {Object} Flat copy of `$scope.overlay.tools` keyed by tool ID.
		var shape; // {String} Current shape.

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
		 * @param {String} toolId
		 */
		$scope.clickButton = function (toolId) {
			toggleTool(toolId);
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

				initTools();
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
		function initTools () {
			if (flags.initTools) {
				return;
			}

			flags.initTools = true;

			tools = {};
			var newTools = [];
			var toggleTools = [];

			_.forEach($scope.overlay.tools, function (group, groupsId) {
				if (group.type === 'group') {
					var newGroup = [];

					_.forEach(group.tools, function (tool, toolsId) {
						var toolId = groupsId + '/' + toolsId;
						var newTool = _.pick(tool, ['icon', 'title']);
						newTool.$$id = toolId;
						newTool.$$group = groupsId;
						newTool.type = 'button';

						tools[toolId] = newTool;
						newGroup.push(newTool);

						if (tool.active) {
							toggleTools.push(toolId);
						}
					});

					newTools.push({
						$$id: groupsId,
						type: 'group',
						tools: newGroup
					});
				}
				else {
					var toolId = groupsId;
					var newTool = _.pick(group, ['icon', 'title']);
					newTool.$$id = toolId;
					newTool.$$group = groupsId;
					newTool.type = 'button';

					tools[groupsId] = newTool;
					newTools.push(newTool);

					if (group.active) {
						toggleTools.push(toolId);
					}
				}
			});

			$scope.overlay.tools = newTools;

			_.forEach(toggleTools, function (toolId) {
				toggleTool(toolId);
			});
		}

		/**
		 *
		 * @param {string} toolId Tool ID. Format: "group/tool" for tools in groups, "tool" for tools not in groups.
		 */
		function toggleTool (toolId) {
			var parts = toolId.split('/');

			// @todo Use the following once tools are pluggable.
//			if (parts.length === 1) {
//				toggleSingle();
//			}
//			else if (parts.length === 2) {
//				toggleGroup();
//			}

			if (parts[0] === 'debug') {
				var overlay = nbPictureService.getMapOverlay(pictureId, 'editorDebug');
				var flag = !(overlay.show);
				toggleSingle(toolId, flag);
				nbPictureService[flag ? 'showMapOverlay' : 'hideMapOverlay'](pictureId, 'editorDebug');
			}
			else if (parts[0] === 'shape') {
				shape = parts[1];
				toggleGroup(toolId);
			}
		}

		/**
		 *
		 * @param {String} toolId Tool ID. Format: "tool".
		 * @param {Boolean} flag
		 */
		function toggleSingle (toolId, flag) {
			tools[toolId].$$active = flag;

			var tool = _.find($scope.overlay.tools, {$$id: toolId});
			if (tool) {
				tool.$$active = flag;
			}
		}

		/**
		 *
		 * @param {String} toolId Tool ID. Format: "group/tool".
		 * @param {Boolean} flag
		 */
		function toggleGroup (toolId, flag) {
			var parts = toolId.split('/');
			var siblings = _.where(tools, {$$group: parts[0]});

			_.forEach(siblings, function (sibling) {
				var active;

				if (flag === true || flag === false) {
					if (sibling.$$id === toolId) {
						active = flag;
					}
					else {
						return;
					}
				}
				else {
					active = (sibling.$$id === toolId);
				}

				sibling.$$active = active;

				var parts = sibling.$$id.split('/');
				var group = _.find($scope.overlay.tools, {$$group: parts[0]});
				if (group) {
					var tool = _.find(group.tools, {$$id: toolId});
					if (tool) {
						tool.$$active = flag;
					}
				}
			});
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

			deregister.push($scope.$watch('$parent.$parent.$parent.picture.$$id', function (newValue, oldValue) {
				if (newValue) {
					pictureId = newValue;
				}
			}));

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

	nbPictureMapEditorOverlayDebugController.$inject = ['$scope', '$element', '$attrs', '$timeout', '_', 'nbPictureConfig', 'nbPictureUtilService', 'nbPictureService', 'dialogService', 'PICTURE_SHAPE'];
	function nbPictureMapEditorOverlayDebugController ($scope, $element, $attrs, $timeout, _, nbPictureConfig, nbPictureUtilService, nbPictureService, dialogService, PICTURE_SHAPE) {
		/*jshint validthis: true */
		var overlayId = 'editorDebug'; // {String} Overlay ID as defined in config.
		var flags = {
			init: false // {Boolean} Whether init() has been fired.
		};
		var deregister = [];
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

			deregister.push($scope.$watch('$parent.$parent.picture.$$id', function (newValue, oldValue) {
				if (newValue) {
					pictureId = newValue;
				}
			}));

			var onBaseLoad = function () {
				completeWatch();

				$scope.overlay = nbPictureService.getMapOverlay(pictureId, overlayId);

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
			var buildFn = nbPictureConfig.map.overlays.editorDebug.build;
			var areas = _.cloneDeep(nbPictureService.getMapOverlayAreas(pictureId, overlayId));

			_.forEach(areas, function (area, index) {
				area.$$centerCoords = nbPictureUtilService.getCenter(area.shape, area.$$coords, true);

				var build = buildFn(area);

				area.$$content = build.content;
				area.$$style = build.style;
			});

			$scope.areas = areas;
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
		.directive('nbPictureMapEditorOverlayDebug', nbPictureMapEditorOverlayDebugDirective);

	function nbPictureMapEditorOverlayDebugDirective () {
		return {
			restrict: 'EA',
			replace: true,
			scope: true,
			controller: 'nbPictureMapEditorOverlayDebugController',
			templateUrl: 'templates/nb-picture-map-editor-overlay-debug.html',
			link: function (scope, element, attrs, controller) {
				controller.init();

				scope.$on('$destroy', function () {
					controller.destroy();
				});
			}
		};
	}
})(window, window.angular);
angular.module('nb.pictureMapEditor.templates', ['templates/nb-picture-map-editor-overlay-debug.html', 'templates/nb-picture-map-editor-overlay-ui-areas.html', 'templates/nb-picture-map-editor-overlay-ui.html']);

angular.module("templates/nb-picture-map-editor-overlay-debug.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/nb-picture-map-editor-overlay-debug.html",
    "<span class=\"picture-map-editor-overlay-debug\"\n" +
    "	  ng-show=\"overlay.show\"\n" +
    "	  ng-click=\"click($event)\">\n" +
    "	<span class=\"picture-map-editor-overlay-debug-popup\"\n" +
    "		  ng-repeat=\"area in areas track by area.$$id\"\n" +
    "		  ng-attr-style=\"{{area.$$style|style}}\">\n" +
    "		<span ng-bind-html=\"area.$$content|trustedHtml\"></span>\n" +
    "	</span>\n" +
    "</span>");
}]);

angular.module("templates/nb-picture-map-editor-overlay-ui-areas.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/nb-picture-map-editor-overlay-ui-areas.html",
    "<span class=\"picture-map-editor-overlay-ui-areas\"\n" +
    "	  ng-click=\"click($event)\">\n" +
    "	<span class=\"picture-map-editor-overlay-ui-area\"\n" +
    "		  ng-repeat=\"area in areas track by area.$$id\"\n" +
    "		  ng-attr-style=\"{{area.$$style|style}}\"\n" +
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
    "	<div ng-if=\"overlay.tools\"\n" +
    "		 class=\"picture-map-editor-overlay-ui-bar\"\n" +
    "		 jqyoui-draggable=\"{animate: true, onStop: 'stopBarDrag'}\"\n" +
    "		 data-drag=\"true\">\n" +
    "		<div class=\"picture-map-editor-overlay-ui-tools-handle\"></div>\n" +
    "		<ul class=\"picture-map-editor-overlay-ui-tools-content\">\n" +
    "			<li ng-repeat=\"group in overlay.tools track by group.$$id\">\n" +
    "				<div ng-switch=\"group.type\">\n" +
    "					<ul ng-switch-when=\"group\"\n" +
    "						class=\"picture-map-editor-overlay-ui-tools-group\">\n" +
    "						<li ng-repeat=\"tool in group.tools track by tool.$$id\"\n" +
    "							class=\"picture-map-editor-overlay-ui-tools-group-item\">\n" +
    "							<div ng-switch=\"tool.type\">\n" +
    "								<a ng-switch-when=\"button\"\n" +
    "								   ng-click=\"clickButton(tool.$$id)\"\n" +
    "								   ng-class=\"{'active': tool.$$active}\"\n" +
    "								   class=\"picture-map-editor-overlay-ui-tools-button\"\n" +
    "								   ng-attr-title=\"{{tool.title}}\"\n" +
    "								   ng-switch=\"tool.$$active\">\n" +
    "									<span ng-switch-when=\"true\"\n" +
    "										  nb-icon-once\n" +
    "										  data-title=\"{{tool.title}}\"\n" +
    "										  data-color=\"{{overlay.buttonActiveColor}}\"\n" +
    "										  data-id=\"{{tool.icon.id}}\"\n" +
    "										  data-hover-id=\"{{tool.icon.hoverId}}\"></span>\n" +
    "									<span ng-switch-default\n" +
    "										  nb-icon-once\n" +
    "										  data-title=\"{{tool.title}}\"\n" +
    "										  data-color=\"{{overlay.buttonColor}}\"\n" +
    "										  data-id=\"{{tool.icon.id}}\"\n" +
    "										  data-hover-id=\"{{tool.icon.hoverId}}\"></span>\n" +
    "								</a>\n" +
    "							</div>\n" +
    "						</li>\n" +
    "					</ul>\n" +
    "					<div ng-switch-default\n" +
    "						 class=\"picture-map-editor-overlay-ui-tools-single\">\n" +
    "						<div ng-switch=\"group.type\">\n" +
    "							<a ng-switch-when=\"button\"\n" +
    "							   ng-click=\"clickButton(group.$$id)\"\n" +
    "							   ng-class=\"{'active': group.$$active}\"\n" +
    "							   class=\"picture-map-editor-overlay-ui-tools-button\"\n" +
    "							   ng-attr-title=\"{{group.title}}\"\n" +
    "							   ng-switch=\"group.$$active\">\n" +
    "								<span ng-switch-when=\"true\"\n" +
    "									  nb-icon-once\n" +
    "									  data-title=\"{{group.title}}\"\n" +
    "									  data-color=\"{{overlay.buttonActiveColor}}\"\n" +
    "									  data-id=\"{{group.icon.id}}\"\n" +
    "									  data-hover-id=\"{{group.icon.hoverId}}\"></span>\n" +
    "								<span ng-switch-default\n" +
    "									  nb-icon-once\n" +
    "									  data-title=\"{{group.title}}\"\n" +
    "									  data-color=\"{{overlay.buttonColor}}\"\n" +
    "									  data-id=\"{{group.icon.id}}\"\n" +
    "									  data-hover-id=\"{{group.icon.hoverId}}\"></span>\n" +
    "							</a>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "			</li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "	<div nb-picture-map-editor-overlay-ui-areas></div>\n" +
    "</div>\n" +
    "");
}]);
