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