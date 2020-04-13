import React from 'react';
import slugify from 'slugify';
import { useStaticQuery, graphql } from 'gatsby';

import BackToTopBtn from 'gatsby-theme-carbon/src/components/BackToTopBtn';
import Layout from '../components/Layout';
import EditLink from 'gatsby-theme-carbon/src/components/EditLink';
// import NextPrevious from 'gatsby-theme-carbon/src/components/NextPrevious';
import PageTabs from 'gatsby-theme-carbon/src/components/PageTabs';
import "./DefaultNoHead.scss";

const DefaultNoHead = ({ pageContext, children, location, Title }) => {
  const { frontmatter = {}, relativePagePath, titleType } = pageContext;
  const { tabs, title, theme, description, keywords, nav } = frontmatter;
  // get the path prefix if it exists
  const {
    site: { pathPrefix },
  } = useStaticQuery(graphql`
    query PATH_PREFIX_QUERY3 {
      site {
        pathPrefix
      }
    }
  `);

  // let gatsby handle prefixing
  const slug = pathPrefix
    ? location.pathname.replace(pathPrefix, '')
    : location.pathname;

  const getCurrentTab = () => {
    if (!tabs) return '';
    return slug.split('/').slice(-1)[0] || slugify(tabs[0], { lower: true });
  };

  const currentTab = getCurrentTab();
  return (<div className="layoutNoHead">
    <Layout
      homepage={true}
      theme={theme}
      pageTitle={title}
      pageDescription={description}
      pageKeywords={keywords}
      titleType={titleType}
      nav = {nav}
    >
      {tabs && <PageTabs slug={slug} tabs={tabs} currentTab={currentTab} />}
      <main>
        {children}
        <EditLink relativePagePath={relativePagePath} />
      </main>
      {/* <NextPrevious
        pageContext={pageContext}
        location={location}
        slug={slug}
        tabs={tabs}
        currentTab={currentTab}
      /> */}
      <BackToTopBtn />
    </Layout>
    </div>  );
};

export default DefaultNoHead;