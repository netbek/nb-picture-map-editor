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
		var debug; // {Boolean}

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
			var tool = tools[toolId];

			// @todo Use the following once tools are pluggable.
//			if (parts.length === 1) {
//				toggleSingle();
//			}
//			else if (parts.length === 2) {
//				toggleGroup();
//			}

			if (parts[0] === 'debug') {
				if (tool.$$active) {
					debug = false;
					toggleSingle(toolId, false);
				}
				else {
					debug = true;
					toggleSingle(toolId, true);
				}

				// @todo
				console.log('toggle debug ' + debug);
			}
			else if (parts[0] === 'shape') {
				shape = parts[1];
				toggleGroup(toolId);

				console.log('toggle shape ' + shape);
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