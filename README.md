# Red Dust website

### What

The [website](http://www.reddust.org.au/) of a health development organisation in remote indigenous communities

### Highlights

- Design by [Hannah Sutton](http://hannahsuttondesign.com/)
- Code by [Jan Werkhoven](https://github.com/janwerkhoven) and [Richard Verheyen](https://github.com/richardverheyen)
- Built with Gulp 4, Nunjucks, SASS, JS, Atom and Git
- 100% Mobile responsive
- SSL encryption (HTTPS)
- Hosted on Ubuntu server with Nginx

### How to use

Before you can install you will need [NVM](https://github.com/creationix/nvm), [Yarn](https://yarnpkg.com/en/) and [Git](https://git-scm.com/).

Installation:

```
git clone https://github.com/janwerkhoven/reddust.org.au
cd reddust.org.au
nvm install
yarn install
```

Development:

```
gulp serve
open http://localhost:9000
```

Production build:

```
gulp build
```

Deploy to production server (requires authenticated SSH tokens):

```
./deploy.sh
```

### Issues

Found an issue with [reddust.org.au](https://reddust.org.au)? Create a [Github issue](https://github.com/janwerkhoven/reddust.org.au/issues).

### Contact

**Jan Werkhoven**  
Senior Web App Engineer  
Melbourne, Australia  
<a href="mailto:jw@nabu.io">jw@nabu.io</a>  
[GitHub](https://github.com/janwerkhoven), [LinkedIn](https://au.linkedin.com/pub/jan-werkhoven/10/64/b30), [Twitter](https://twitter.com/jan_werkhoven)
