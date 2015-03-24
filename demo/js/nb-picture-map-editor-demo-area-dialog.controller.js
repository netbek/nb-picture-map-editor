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
		.controller('nbPictureMapEditorDemoAreaDialogController', nbPictureMapEditorDemoAreaDialogController);

	nbPictureMapEditorDemoAreaDialogController.$inject = ['$scope', 'dialogService', '_', 'nbPictureConfig'];
	function nbPictureMapEditorDemoAreaDialogController ($scope, dialogService, _, nbPictureConfig) {
		/*jshint validthis: true */
		var config = nbPictureConfig.map.overlays.editorUi.areaDialog;

		this.targetIdOptions = getTargetIdOptions();

		$scope.submit = function () {
			dialogService.close('nbPictureMapEditorDemoAreaDialog', $scope.model);
		};

		function getTargetIdOptions () {
			var options = [];
			var checkboxes = jQuery('input[id^=edit-' + _.kebabCase(config.targetIdField) + '-und]:checked');

			jQuery.each(checkboxes, function (index, checkbox) {
				var child = jQuery('label[for="' + checkbox.id + '"]').children().get(1);

				if (child) {
					var label = _.trim(jQuery(child).text());

					if (label.length) {
						options.push({
							value: Number(checkbox.value),
							label: label
						});
					}
				}
			});

			return options;
		}
	}
})(window, window.angular);