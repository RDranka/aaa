module.exports = function (grunt) {


    grunt.initConfig({
        uglify: {
            options: {
                mangle: false
            },
            minify_js: {
                files: {
                    './dist/TreineticEpubReader.min.js': [
                        'build-output/_single-bundle/TreineticEpubReader.js'
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
                    './dist/TreineticEpubReader.min.css': [
                        'src/css/Tr_style.css',
                        'src/css/sourcesanspro.css',
                        'src/css/readium_js.css',
                        'src/css/viewer.css',
                        'src/css/viewer_audio.css',
                    ]
                }
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, src: ['dev/grunt_build/index.html'], dest: 'dist/'},
                    {expand: true, src: ['dev/grunt_build/Readme.md'], dest: 'dist/'},
                    {
                        cwd : 'epub_content',
                        expand: true,
                        src: ['accessible_epub_3/**', ],
                        dest: './dist/epub_content/accessible_epub_3'
                    },
                    {
                        cwd : 'epub_content',
                        expand: true,
                        src: ['robinhood.epub'],
                        dest: './dist/epub_content/'
                    },
                    {
                        cwd : 'build-output/',
                        expand: true,
                        src: ['deflate.js', 'inflate.js', 'z-worker.js'],
                        dest: './dist/ZIPJS/'
                    },
                ],
            },
        },
    });


    //ZIPJS --> deflate.js inflate.js z-worker.js
    grunt.registerTask("build", ["uglify:minify_js", "cssmin:minify_css", "copy:main"]);


    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
};
