import React from 'react';
import slugify from 'slugify';
import { useStaticQuery, graphql } from 'gatsby';

import BackToTopBtn from 'gatsby-theme-carbon/src/components/BackToTopBtn';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import EditLink from 'gatsby-theme-carbon/src/components/EditLink';
// import NextPrevious from 'gatsby-theme-carbon/src/components/NextPrevious';
import PageTabs from 'gatsby-theme-carbon/src/components/PageTabs';
import Main from 'gatsby-theme-carbon/src/components/Main';

const Default = ({ pageContext, children, location, Title, hideBanner, preFooter }) => {
    const {
        site: { pathPrefix },
    } = useStaticQuery(graphql`
        query PATH_PREFIX_QUERY2 {
          site {
            pathPrefix
          }
        }
      `);
    if (!pageContext) {
        return <React.Fragment>{children}</React.Fragment>
    }
    const { frontmatter = {}, relativePagePath, titleType } = pageContext;
    const { tabs, title, theme, description, keywords, nav } = frontmatter;
    if (frontmatter.redirect) {
        setTimeout(() => {
            if (typeof document !== "undefined") {
                document.location.href = frontmatter.redirect
            }
        },1);
        return <React.Fragment></React.Fragment>
    }
    // get the path prefix if it exists

    // let gatsby handle prefixing
    const slug = pathPrefix
        ? location.pathname.replace(pathPrefix, '')
        : location.pathname;

    const getCurrentTab = () => {
        if (!tabs) return '';
        return slug.split('/').slice(-1)[0] || slugify(tabs[0], { lower: true });
    };

    const currentTab = getCurrentTab();
    return (
        <Layout
            homepage={false}
            theme={theme}
            pageTitle={title}
            pageDescription={description}
            pageKeywords={keywords}
            titleType={titleType}
            nav={nav}
            preFooter={preFooter}
            topNav={true}
        >
            {!hideBanner && <PageHeader title={Title ? <Title /> : title} label="label" tabs={tabs} />}
            {tabs && <PageTabs slug={slug} tabs={tabs} currentTab={currentTab} />}
            <Main padded>
                {children}
                <EditLink relativePagePath={relativePagePath} />
            </Main>
            {/* <NextPrevious
        pageContext={pageContext}
        location={location}
        slug={slug}
        tabs={tabs}
        currentTab={currentTab}
      /> */}
            <BackToTopBtn />
        </Layout>
    );
};

export default Default;