module.exports = function(grunt) {
    grunt.initConfig({
        'string-replace' : {
            default : {
                files : {
                    'index.js' : ['src/browser_file.js']
                },
                options : {
                    replacements : [{
                        pattern : 'reallyUniqueName',
                        replacement : encodeURI(grunt.file.read('src/worker_main.temp.js', {encoding: 'utf8'}))
                    }]
                }
            }
        },
        browserify : {
            worker : {
                files : {
                    './src/worker_main.temp.js' : ['src/worker_main.js']
                }
            }
        },
        uglify : {
            src : ['index.js'],
            dest : 'index.js',
            options : {
                mangle : {
                    reserved : ['require', 'module', 'exports', 'onmessage', 'postMessage']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    //grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.registerTask('compile', ['browserify:worker', 'string-replace', 'uglify', 'delete:worker']);
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
