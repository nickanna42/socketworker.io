module.exports = function(grunt) {
    grunt.initConfig({
        browserify : {
            worker : {
                src : ['src/worker_main.js'],
                dest : 'src/worker_main.temp.js'
            }
        },
        'string-replace' : {
            default : {
                files : {
                    'index.js' : ['src/browser_file.js']
                },
                options : {
                    replacements : [{
                        pattern : 'reallyUniqueName',
                        replacement : function() {
                            return encodeURI(grunt.file.read('src/worker_main.temp.js', {encoding: 'utf8'}));
                        }
                    }]
                }
            }
        },
        uglify : {
            browser : {
                src : ['index.js'],
                dest : 'index.js',
                options : {
                    mangle : {
                        reserved : ['require', 'module', 'exports', 'onmessage', 'postMessage']
                    }
                }
            },
            worker : {
                src : ['src/worker_main.temp.js'],
                dest : 'src/worker_main.temp.js',
                options : {
                    mangle : {
                        reserved : ['require', 'module', 'exports', 'onmessage', 'postMessage']
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');

    grunt.registerTask('compile', ['browserify:worker', 'uglify:worker', 'string-replace', 'uglify:browser', 'delete:worker']);

    grunt.registerTask(
        'delete',
        'Deletes the worker_main.temp.js file created by browserify',
        function(subtask) {
            subtask = subtask || 'default'
            switch (subtask) {
                case 'worker':
                    grunt.file.delete('src/worker_main.temp.js');
                    break;
                default:
                    break;
            }
        }
    );
};
