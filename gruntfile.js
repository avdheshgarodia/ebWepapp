module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.initConfig({
    // copy: {
    //   html: {
    //     files: [
    //       // includes files within path
    //       {expand: true, flatten: true, src: ['source_html/*.html'], dest: 'public/', filter: 'isFile'},
    //     ],
    //   },
    // },
    uglify: {
      my_target: {
        files: [{
          expand: true,
          cwd: 'js',
          src: '**/*.js',
          dest: 'public/js',
        }]
      } //my_target
    }, //uglify
    compass: {
      dev: {
        options: {
          config: 'compass_config.rb'
        } //options
      } //dev
    }, //compass
    watch: {
      options: { livereload: true },
      scripts: {
        files: ['js/*.js'],
        tasks: ['uglify']
      }, //script
      sass: {
        files: ['sass/*.scss'],
        tasks: ['compass:dev']
      }, //sass
      html: {
        files: ['public/*.html'],
        // tasks: ['copy:html']
      },
      jade: {
        files: "views/**/*.jade",
        tasks: "pug"
      }
    }, //watch
    pug: {
        compile: {
            options: {
                client: false,
                pretty: true
            },
            files: [ {
              cwd: "views",
              src: "**/*.jade",
              dest: "public",
              expand: true,
              ext: ".html"
            } ]
        }
    }, //jade
    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'app.js'
        }
      }
  }
  }) //initConfig
  grunt.registerTask('serve', ['express:dev', 'watch']);
  grunt.registerTask('default', ['uglify', 'compass:dev', 'serve']);
} //exports