module.exports = function (grunt) {


    grunt.initConfig({
        uglify: {
            options: {
                mangle: false
            },
            minify_js: {
                files: {
                    './dist/treinetic_readium_viewer.min.js': [
                        '../../build-output/_single-bundle/readium-js-viewer_all_LITE.js',
                        '../RequireJS_config.js',
                        '../../src/js/mobile_commands/Mobile_commands.js',
                        '../../src/js/mobile_commands/DealWIthMobileDevices.js',
                        '../../src/js/mobile_commands/init_reader.js'
                    ]
                }
            }
        },

        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            minify_css: {
                files: {
                    './dist/treinetic_readium_viewer.min.css': [
                        '../../node_modules/bootstrap/dist/css/bootstrap.css',
                        '../../node_modules/bootstrap-accessibility-plugin/plugins/css/bootstrap-accessibility.css',
                        '../../src/css/Tr_style.css',
                        '../../src/css/sourcesanspro.css',
                        '../../src/css/readium_js.css',
                        '../../src/css/viewer.css',
                        '../../src/css/viewer_audio.css',
                        '../../src/css/settings.css'
                    ]
                }
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, src: ['index.html'], dest: 'dist/'},
                    {expand: true, src: ['Readme.md'], dest: 'dist/'},
                    {expand: true, src: ['../../epub_content/accessible_epub_3/**'], dest: 'dist/epub_content/epub'},
                ],
            },
        },
    });

    grunt.registerTask("build", ["uglify:minify_js", "cssmin:minify_css", "copy:main"]);


    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
};
