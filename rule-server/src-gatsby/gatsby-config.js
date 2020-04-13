const path = require('path');

module.exports = {
  siteMetadata: {
    title: 'Gatsby Theme Carbon',
    description: 'A Gatsby theme for the carbon design system',
    keywords: 'gatsby,theme,carbon',
  },
  plugins: [`gatsby-transformer-yaml`,
  {
    resolve: 'gatsby-theme-carbon',
    options: {
      iconPath: './src/images/LeftNavIcon.svg'
    }
  },
  {
    resolve: `gatsby-source-filesystem`,
    // name: `MyNav`,
    options: {
      name:'src',
      path: `${__dirname}/src/`
    },
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `MyNav`,
      // name:'src',
      path: path.resolve(`./src/data/nav-items.yaml`),
      // path: `${__dirname}/src/`
    },
  },
  `gatsby-transformer-remark`,


],
  pathPrefix: `/rules`,
};
