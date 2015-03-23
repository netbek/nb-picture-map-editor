/**
 * nb-picture-map-editor
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: ['/*',
				' * <%= pkg.name %>',
				' * <%= pkg.homepage %>',
				' *',
				' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>',
				' * @copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>',
				' * @license <%= pkg.license.url %> <%= pkg.license.type %>',
				' */\n'].join('\n')
		},
		jshint: {
			options: {
				jshintrc: true
			},
			all: ['Gruntfile.js', 'tasks/**/*.js', 'tests/tests/*.js', 'src/**/*.js', 'demo/**/*.js']
		},
		clean: {
			init: ['build', 'dist'],
			exit: ['build'],
		},
		html2js: {
			dist: {
				options: {
					module: 'nb.pictureMapEditor.templates',
				},
				files: [{
						src: ['src/templates/*.html'],
						dest: 'build/js/<%= pkg.name %>-templates.js',
					}]
			}
		},
		concat: {
			distCss: {
				src: ['src/css/**/*.css'],
				dest: 'dist/css/<%= pkg.name %>.css'
			},
			distJs: {
				src: [
					'src/js/nb-picture-map-editor.module.js',
					'src/js/nb-picture-map-editor.filters.js',
					'src/js/nb-picture-map-editor.directive.js',
					'src/js/nb-picture-map-editor-overlay-ui.controller.js',
					'src/js/nb-picture-map-editor-overlay-ui.directive.js',
					'src/js/nb-picture-map-editor-overlay-ui-areas.controller.js',
					'src/js/nb-picture-map-editor-overlay-ui-areas.directive.js',
					'build/js/<%= pkg.name %>-templates.js'
				],
				dest: 'dist/js/<%= pkg.name %>.js'
			}
		},
		cssmin: {
			options: {
				banner: '<%= meta.banner %>'
			},
			dist: {
				files: [{
						src: ['src/css/**/*.css'],
						dest: 'dist/css/<%= pkg.name %>.min.css'
					}]
			}
		},
		uglify: {
			options: {
				banner: '<%= meta.banner %>'
			},
			dist: {
				src: ['dist/js/<%= pkg.name %>.js'],
				dest: 'dist/js/<%= pkg.name %>.min.js'
			}
		},
		svgstore: {
			options: {
				includeTitleElement: false,
				preserveDescElement: false
			},
			src: {
				files: {
					'src/svg/icon.svg': 'src/svg/icon/*.svg'
				}
			}
		},
		svg2png_colorfy: {
			dist: {
				options: {
					colors: {
						black: '#000',
						white: '#FFF',
						grey: '#AAA'
					}
				},
				files: [{cwd: 'src/svg/icon/', src: ['*.svg'], dest: 'src/img/'}]
			}
		},
		copy: {
			dist: {
				files: [
					{expand: true, cwd: 'src/img', src: ['**'], dest: 'dist/img/'},
					{expand: true, cwd: 'src/svg', src: ['**'], dest: 'dist/svg/'}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-svg2png-colorfy');
	grunt.loadNpmTasks('grunt-svgstore');

	grunt.registerTask('default', [
		'jshint',
		'clean:init',
		'html2js',
		'concat',
		'cssmin',
		'uglify',
		'svgstore',
		'svg2png_colorfy',
		'copy',
		'clean:exit',
	]);

};