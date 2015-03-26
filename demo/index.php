<!doctype html>
<html xmlns:ng="http://angularjs.org" lang="en" id="ng-app" ng-app="nb.pictureMapEditor.demo">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>nb-picture-map-editor demo</title>

		<link rel="stylesheet" href="../bower_components/nb-foundation/src/css/nb-foundation-base.css" />
		<link rel="stylesheet" href="../bower_components/normalize-css/normalize.css" />
		<link rel="stylesheet" href="../bower_components/jquery-ui/themes/flick/jquery-ui.css" />
		<link rel="stylesheet" href="../bower_components/nb-icon/dist/css/nb-icon.css" />
		<link rel="stylesheet" href="../bower_components/nb-picture/dist/css/nb-picture.css" />
		<link rel="stylesheet" href="../src/css/nb-picture-map-editor.css" />
		<link rel="stylesheet" href="../demo/css/nb-picture-map-editor-demo.css" />

		<script src="../bower_components/jquery/dist/jquery.js"></script>
		<script src="../bower_components/jquery-ui/jquery-ui.js"></script>

		<script src="../bower_components/angularjs/angular.js"></script>
		<script src="../bower_components/angular-dragdrop/src/angular-dragdrop.js"></script>
		<script src="../bower_components/angular-jquery-dialog-service/dialog-service.js"></script>
		<script src="../bower_components/lodash/lodash.js"></script>
		<script src="../bower_components/picturefill/dist/picturefill.js"></script>
		<script src="../bower_components/ng-stats/dist/ng-stats.js"></script>
		<script src="../bower_components/ng-debounce/angular-debounce.js"></script>
		<script src="../bower_components/nb-i18n/dist/js/nb-i18n.js"></script>
		<script src="../bower_components/nb-lodash/dist/js/nb-lodash.js"></script>
		<script src="../bower_components/nb-icon/dist/js/nb-icon.js"></script>
		<script src="../bower_components/nb-picture/dist/js/nb-picture.js"></script>

		<script src="../dist/js/nb-picture-map-editor.js"></script>
<!--
		<script src="../src/js/nb-picture-map-editor.module.js"></script>
		<script src="../src/js/nb-picture-map-editor.filters.js"></script>
		<script src="../src/js/nb-picture-map-editor.directive.js"></script>
		<script src="../src/js/nb-picture-map-editor-overlay-ui.controller.js"></script>
		<script src="../src/js/nb-picture-map-editor-overlay-ui.directive.js"></script>
		<script src="../src/js/nb-picture-map-editor-overlay-ui-areas.controller.js"></script>
		<script src="../src/js/nb-picture-map-editor-overlay-ui-areas.directive.js"></script>
		<script src="../src/js/nb-picture-map-editor-overlay-debug.controller.js"></script>
		<script src="../src/js/nb-picture-map-editor-overlay-debug.directive.js"></script>
		<script src="../src/js/nb-picture-map-editor-templates.js"></script>
-->
		<script src="js/nb-picture-map-editor-demo.module.js"></script>
		<script src="js/nb-picture-map-editor-demo-config.service.js"></script>
		<script src="js/nb-picture-map-editor-demo-input.directive.js"></script>
		<script src="js/nb-picture-map-editor-demo-area-dialog.controller.js"></script>
		<script src="js/nb-picture-map-editor-demo-main.controller.js"></script>
	</head>
	<body>
		<div class="visuallyhidden"><?php print(file_get_contents(dirname(__FILE__) . '/../src/svg/icon.svg')); ?></div>

		<div ng-controller="nbPictureMapEditorDemoMainController">
			<div>
				<input type="hidden" nb-picture-map-editor-demo-input ng-value="model.value" />
			</div>

			<div class="container">
				<div nb-picture-map
					 nb-picture-map-editor
					 ng-attr-map="{{demoData.map}}"
					 ng-attr-default-source="{{demoData.styles.small + ', ' + demoData.styles.medium + ' 2x'}}"
					 ng-attr-sources="{{'[[\'' + demoData.styles.medium + ', ' + demoData.styles.large + ' 2x\', \'medium\'], [\'' + demoData.styles.large + ', ' + demoData.styles.xlarge + ' 2x\', \'large\']]'}}">
					<div nb-picture-map-editor-overlay-ui></div>
					<div nb-picture-map-editor-overlay-debug></div>
				</div>
			</div>
		</div>

		<div>
			<table id="field-birds-values">
				<thead>
					<tr>
						<th class="field-label">
							<label>Birds</label>
						</th>
					</tr>
				</thead>
				<tr>
					<td>
						<input checked="checked" id="edit-field-birds-und-0" data-delta="0" type="checkbox" name="field_birds[und][0][target_id]" value="5" class="form-checkbox">
						<label class="option" for="edit-field-birds-und-0">
							<div class="field field-name-field-cover"></div>
							<div>One</div>
						</label>
					</td>
				</tr>
				<tr>
					<td>
						<input checked="checked" id="edit-field-birds-und-1" data-delta="1" type="checkbox" name="field_birds[und][1][target_id]" value="1" class="form-checkbox">
						<label class="option" for="edit-field-birds-und-1">
							<div class="field field-name-field-cover"></div>
							<div>Two</div>
						</label>
					</td>
				</tr>
			</table>
		</div>
	</body>
</html>
