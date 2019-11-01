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

        concat: {
            libcss: {
                src: [
                    'src/css/Tr_style.css',
                    'src/css/sourcesanspro.css',
                    'src/css/readium_js.css',
                    'src/css/viewer.css',
                    'src/css/viewer_audio.css'
                ],
                dest: './dist/TreineticEpubReader.css',
            },
        },

        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            minify_css: {
                files: [{
                    expand: true,
                    cwd: './dist/',
                    src: ['TreineticEpubReader.css'],
                    dest: './dist/',
                    ext: '.min.css'
                }]
            }
        },
        copy: {
            main: {
                files: [
                    {cwd: 'build-output/_single-bundle', expand: true, src: ['TreineticEpubReader.js'], dest: 'dist/'},
                    {cwd: 'dev/grunt_build', expand: true, src: ['index.html'], dest: 'dist/'},
                    {cwd: 'dev/grunt_build', expand: true, src: ['Readme.md'], dest: 'dist/'},
                    {
                        cwd: 'epub_content',
                        expand: true,
                        src: ['epub_2/**',],
                        dest: './dist/epub_content/epub_2'
                    },
                    {
                        cwd: 'epub_content',
                        expand: true,
                        src: ['epub_1.epub'],
                        dest: './dist/epub_content/'
                    },
                    {
                        cwd: 'build-output/',
                        expand: true,
                        src: ['deflate.js', 'inflate.js', 'z-worker.js'],
                        dest: './dist/ZIPJS/'
                    },
                ],
            },
        },
    });


    //ZIPJS --> deflate.js inflate.js z-worker.js
    grunt.registerTask("build", ["copy:main", "concat:libcss" , "cssmin:minify_css" , "uglify:minify_js"]);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
};
