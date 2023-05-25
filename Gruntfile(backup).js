'use strict';

module.exports = function (grunt) {

    var plugins = [
        'js/plugins/jquery-ui/jquery-ui.js', 'js/bootstrap/bootstrap.min.js',
        'js/plugins/metisMenu/jquery.metisMenu.js', 'js/plugins/slimscroll/jquery.slimscroll.min.js', 'js/plugins/pace/pace.min.js',
        'js/inspinia.js', 'js/angular/angular-sanitize.min.js', 'js/plugins/oclazyload/dist/ocLazyLoad.min.js',
        'js/ui-router/angular-ui-router.min.js', 'js/bootstrap/ui-bootstrap-tpls-1.1.2.min.js', 'js/plugins/angular-idle/angular-idle.js', 'js/plugins/datetime-picker.js',
        'js/plugins/angular-local-storage.min.js', 'js/plugins/sweetalert/sweetalert.min.js', 'js/plugins/sweetalert/angular-sweetalert.min.js', 'js/controllers/homeMenuController.js',
        'js/controllers/alcoholDetailController.js',
        'js/plugins/stickyHeder.js',
        'node_modules/chart.js/dist/Chart.min.js',
        'node_modules/angular-chart.js/dist/angular-chart.min.js',
        'js/angular-payments.min.js'
    ];

    var uglify_all = ['js/jquery/jquery-2.1.1.min.js', 'js/angular/angular.min.js', 'dist/app.js', 'dist/plugins.js', 'dist/services.js', 'dist/directives.js', 'dist/components.js', 'dist/filters.js'];

    // var styles = ['css/bootstrap.min.css', 'font-awesome/css/font-awesome.css', 'css/plugins/sweetalert/sweetalert.css', 'css/animate.css', 'css/style.css', 'css/Artecsan.css'];

    var argv = require('yargs').argv;

    var ENV = argv.env || 'development';

    grunt.initConfig({
        replace: {
            build_replace: {
                options: {
                    variables: {
                        // Generate a truly random number by concatenating the current date with a random number
                        // The variable name corresponds with the same in our HTML file
                        'hash': '<%= ((new Date()).getTime()) %>'
                    }
                },
                // Source and destination files
                files: [
                    {
                        src: ['index.production'],
                        dest: 'index.html'
                    }
                ]
            },
            CONFIG_ENV: {
                options: {
                    variables: {
                        'CONFIG_ENV': ENV
                    }
                },
                // Source and destination files
                files: [
                    {
                        src: ['dist/main.js'],
                        dest: 'dist/main.js'
                    }
                ]
            }
        },
        uglify: {
            all: {
                options: {
                    mangle: false,
                    sourceMap: false,
                    banner: '/* Artecsan */'
                },
                files: {
                    'dist/main.js': uglify_all
                }
            },
            dist: {
                options: {
                    mangle: false,
                    sourceMap: false,
                    banner: '/* Artecsan */'
                },
                files: {
                    'dist/app.js': ['js/app.js', 'js/config.js', 'js/directives.js', 'js/controllers.js'],
                    'dist/components.js': ['js/components/**/*.js', 'js/components/**/*.*.js'],
                    'dist/directives.js': ['js/directives/**/*.js', 'js/directives/**/*.*.js'],
                    'dist/services.js': ['js/services/**/*.js', 'js/services/**/*.*.js'],
                    'dist/filters.js': ['js/filters/**/*.js', 'js/filters/**/*.*.js']
                }
            }
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '/* Artecsan */'
            },
            all: {
                src: ['dist/app.js', 'dist/plugins.js', 'dist/services.js', 'dist/directives.js', 'dist/components.js', 'dist/filters.js'],
                dest: 'dist/main.js'
            },
            dist: {
                src: plugins,
                dest: 'dist/plugins.js'
            }
        },
        clean: {
            js: ['dist/*.js', '!dist/main.js']
        },
        watch: {
            scripts: {
                files: ['js/**/*.js'],
                tasks: ['default'],
                options: {
                    spawn: false,
                    interrupt: true,
                    event: ['changed', 'added', 'deleted']
                }
            }
        },
        express: {
            dev: {
                options: {
                    script: 'server.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.registerTask('default', ['uglify:dist', 'concat:dist', 'concat:all', 'uglify:all', 'replace', 'clean']);

    grunt.registerTask('dev', ['uglify:dist', 'concat:dist', 'concat:all', 'uglify:all', 'replace', 'clean', 'express', 'watch']);

};
