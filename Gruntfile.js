module.exports = function(grunt) {

  'use strict';

  require('time-grunt')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          port: 9000,
          base: 'dist',
          hostname: 'localhost',
          livereload: true,
          open: false
        }
      }
    },

    watch: {
      handlebars: {
        files: ['src/templates/**/*.hbs', 'src/templates/**/*.json', 'src/templates/layout.html '],
        tasks: ['build-HTML']
      },
      sass: {
        files: ['src/styles/**/*.scss'],
        tasks: ['build-CSS']
      },
      js: {
        files: ['src/js/**/*.js'],
        tasks: ['build-JS']
      },
      assets: {
        files: ['src/public/**/*'],
        tasks: ['copy']
      },
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['build']
      },
      options: {
        livereload: true,
      }
    },

    handlebarslayouts: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src/templates/',
          src: ['**/*.hbs', '!partials/*'],
          dest: 'dist/',
          ext: '.html',
        }],
        options: {
          partials: ['src/templates/partials/*.hbs', 'src/templates/layout.html'],
          basePath: 'src/templates/',
          modules: ['src/templates/helpers/helpers-*.js'],
          context: {
            partners: [{
              name: 'Hannah Sutton Design',
              logo: 'hannah-sutton-design.png',
              intro: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            }, {
              name: 'Nabu Websites',
              logo: 'nabu.svg',
              intro: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            }, {
              name: 'Richardson Fried Chickens',
              logo: 'richardson-fried-chickens.jpg',
              intro: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            }]
          }
        }
      }
    },

    sass: {
      options: {
        sourcemap: 'none',
        noCache: true
      },
      raw: {
        options: {
          style: 'expanded',
        },
        files: {
          'dist/assets/css/main.css': ['src/styles/main.scss']
        }
      },
      minified: {
        options: {
          style: 'compressed',
        },
        files: {
          'dist/assets/css/main.min.css': ['src/styles/main.scss']
        }
      }
    },

    postcss: {
      options: {
        map: false,
        processors: [
          require('autoprefixer')({
            browsers: ['> 1% in AU', 'IE > 9']
          })
        ]
      },
      raw: {
        src: 'dist/assets/css/main.css'
      },
      minified: {
        src: 'dist/assets/css/main.min.css'
      }
    },

    jshint: {
      files: ['src/js/main.js'],
      options: {
        force: true,
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },

    uglify: {
      dist: {
        files: {
          'temp/js/main.min.js': ['src/js/main.js'],
          'temp/js/localstorage_safari_private_shim.min.js': ['src/js/localstorage_safari_private_shim.js'],
          'dist/assets/js/outdated-browser.min.js': ['src/js/outdated-browser.js']
        }
      }
    },

    concat: {
      options: {
        separator: ';\n\n',
      },
      raw: {
        files: {
          'dist/assets/js/main.js': [
            'bower_components/jquery/dist/jquery.min.js',
            'src/js/localstorage_safari_private_shim.js',
            'src/js/main.js'
          ]
        }
      },
      minified: {
        files: {
          'dist/assets/js/main.min.js': [
            'bower_components/jquery/dist/jquery.min.js',
            'temp/js/localstorage_safari_private_shim.min.js',
            'temp/js/main.min.js'
          ]
        }
      }
    },

    clean: {
      dist: {
        src: ['dist/']
      },
      temp: {
        src: ['temp/']
      }
    },

    copy: {
      main: {
        files: [{
          expand: true,
          cwd: 'src/public/',
          src: ['**'],
          dest: 'dist/'
        }]
      }
    },

    // BUG: Adds /dist to every URL...
    xml_sitemap: {
      custom_options: {
        options: {
          siteRoot: 'http://www.finsecptx.com.au/',
          changefreq: 'monthly',
          priority: '0.5',
          dest: 'dist/'
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['**/*.html', '!**/google*.html', '!**/emails/*.html'],
        }]
      }
    },

    // Temporary until sitemap bug is fixed
    replace: {
      sitemap_dist: {
        src: 'dist/sitemap.xml',
        dest: 'dist/sitemap.xml',
        replacements: [{
          from: '/dist/',
          to: '/'
        }, {
          from: '<feed>',
          to: ''
        }, {
          from: '</feed>',
          to: ''
        }]
      }
    },

    // inlinecss: {
    //   main: {
    //     options: {
    //       removeStyleTags: false
    //     },
    //     files: [{
    //       src: 'dist/emails/letter-of-authority.html',
    //       dest: 'dist/emails/letter-of-authority-inline.html'
    //     }, {
    //       src: 'dist/emails/confirmation-email.html',
    //       dest: 'dist/emails/confirmation-email-inline.html'
    //     }]
    //   }
    // }

  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html-prettyprinter');
  // grunt.loadNpmTasks('grunt-inline-css');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-xml-sitemap');
  grunt.loadNpmTasks("grunt-handlebars-layouts");

  // Available commands
  grunt.registerTask('default', ['build', 'sitemap', 'serve']);
  grunt.registerTask('build', ['clean', 'copy', 'build-HTML', 'build-CSS', 'build-JS']);
  grunt.registerTask('build-HTML', ['handlebarslayouts']);
  grunt.registerTask('build-CSS', ['sass', 'postcss']);
  grunt.registerTask('build-JS', ['jshint', 'uglify', 'concat', 'clean:temp']);
  grunt.registerTask('sitemap', ['xml_sitemap', 'replace:sitemap_dist']);
  grunt.registerTask('serve', ['connect', 'watch']);

};
