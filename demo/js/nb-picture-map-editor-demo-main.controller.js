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
		.controller('nbPictureMapEditorDemoMainController', nbPictureMapEditorDemoMainController);

	nbPictureMapEditorDemoMainController.$inject = ['$scope', '$timeout'];
	function nbPictureMapEditorDemoMainController ($scope, $timeout) {
		var ngStats = showAngularStats({
			position: 'topright'
		});
		ngStats.listeners.digestLength.log = function (digestLength) {
			console.log('Digest: ' + digestLength);
		};
//		ngStats.listeners.watchCount.log = function (watchCount) {
//			console.log('Watches: ' + watchCount);
//		};

		$scope.demoData = {
			map: {
				areas: [
					{
						shape: 'circle',
						coords: [0.456, 0.297, 0.05],
						data: {
							target_id: 5
						}
					},
					{
						shape: 'circle',
						coords: [0.537, 0.589, 0.05],
						data: {
							target_id: 1
						}
					}
				],
				resize: true,
				relCoords: true,
				overlays: {
					editorUiAreas: {
						alwaysOn: true,
						icon: {
							id: 'marker-glow'
						}
					},
					editorUi: {
						alwaysOn: true,
						buttonColor: 'grey',
						buttonActiveColor: 'white',
						tools: {
//							shape: {
//								type: 'group',
//								tools: {
//									circle: {
//										active: true,
//										icon: {
//											id: 'circle'
//										},
//										title: 'Switch to circle marker'
//									}
//								}
//							},
							debug: {
								icon: {
									id: 'wrench'
								},
								title: 'Debug'
							}
						}
					},
					editorDebug: {
						show: false,
						alwaysOn: true
					}
				}
			},
			width: 720,
			height: 960,
			styles: {
				small: 'img/diphyllodes-chrysoptera-120.jpg',
				medium: 'img/diphyllodes-chrysoptera-240.jpg',
				large: 'img/diphyllodes-chrysoptera-480.jpg',
				xlarge: 'img/diphyllodes-chrysoptera-960.jpg'
			}
		};
	}
})(window, window.angular);