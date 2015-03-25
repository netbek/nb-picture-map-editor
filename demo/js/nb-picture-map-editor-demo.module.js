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
		.module('nb.pictureMapEditor.demo', [
			'angularStats',
			'nb.pictureMapEditor'
		])
		.config(['nbIconConfigProvider',
			function (nbIconConfigProvider) {
				nbIconConfigProvider.set({
					colors: {
						black: '#000',
						white: '#FFF',
						grey: '#999'
					},
					prefix: 'icon',
					pngUrl: '../demo/img/',
					size: 256
				});
			}])
		.config(['nbPictureConfigProvider',
			function (nbPictureConfigProvider) {
				nbPictureConfigProvider.set({
					map: {
						overlays: {
							editorUi: {
								defaultArea: {
									shape: 'circle',
									coords: function (x, y) {
										return [x, y, 0.05];
									}
								},
								areaDialog: {
									id: 'nbPictureMapEditorDemoAreaDialog',
									templateUrl: 'templates/nb-picture-map-editor-demo-area-dialog.html?_=' + Date.now(),
									model: function (area) {
										return {
											data: {
												target_id: area.data && area.data.target_id ? Number(area.data.target_id) : undefined
											}
										};
									},
									options: {
										autoOpen: false,
										modal: true
									},
									targetIdField: 'field_birds'
								}
							},
							editorDebug: {
								build: function (area) {
									return {
										content: area.shape + '<br />Target: ' + area.data.target_id,
										style: {
											left: area.$$centerCoords[0] + 'px',
											top: area.$$centerCoords[1] + 'px'
										}
									};
								}
							}
						}
					}
				});
			}])
		.directive('childScope', childScopeDirective);

	function childScopeDirective () {
		return {
			scope: true
		};
	}
})(window, window.angular);