module.exports = function(grunt) {
    grunt.initConfig({
        browserify : {
            worker : {
                files : {
                    'src/worker_main.temp.js' : ['src/worker_main.js']
                }
            }
        },
        "string-replace" : {
            browser : {
                files : {
                    'index.js' : ['src/browser_file.js']
                },
                options : {
                    replacements : [{
                        pattern : 'reallyUniqueName',
                        replacement : function() {
                            return grunt.file.read('src/worker_main.temp.js');
                        }
                    }]
                }
            },
            worker : {
                files : {
                    'src/worker_main.temp.js' : ['src/worker_main.temp.js']
                },
                options : {
                    replacements : [{
                        pattern : /\"/g ,
                        replacement :  '\\\"'
                    }]
                }
            }
        },
        uglify : {
            worker : {
                files : {
                    'src/worker_main.temp.js' : ['src/worker_main.temp.js']
                },
                options : {
                    mangle : {
                        reserved : ['require', 'module', 'exports', 'postMessage', 'onmessage']
                    }
                }
            },
            browser : {
                files : {
                    'index.js' : ['index.js']
                },
                options : {
                    mangle : {
                        reserved : ['require', 'module', 'exports', 'postMessage', 'onmessage']
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');

    grunt.registerTask('compile', ['browserify:worker', 'uglify:worker', 'string-replace:worker', 'string-replace:browser', 'uglify:browser', 'delete:worker-temp']);

    grunt.registerTask(
        'delete',
        'Deletes the worker_main.temp.js file created by browserify',
        function(subtask) {
            subtask = subtask || 'default'
            switch (subtask) {
                case 'worker-temp':
                    grunt.file.delete('src/worker_main.temp.js');
                    break;
                default:
                    break;
            }
        }
    );
};
