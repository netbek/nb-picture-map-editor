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
			if (tool !== id && $scope.overlay.buttons && $scope.overlay.buttons[id]) {
				_.forEach($scope.overlay.buttons, function (value, key) {
					$scope.overlay.buttons[key].$$active = (key === id);
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

				if ($scope.overlay.buttons) {
					// Add ID to buttons.
					_.forEach($scope.overlay.buttons, function (value, key) {
						$scope.overlay.buttons[key].$$id = key;
					});

					// Activate the first button.
					$scope.clickButton(_.keys($scope.overlay.buttons)[0]);
				}
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