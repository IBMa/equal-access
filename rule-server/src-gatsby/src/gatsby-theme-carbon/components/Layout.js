import React, { useLayoutEffect } from 'react';

import Meta from 'gatsby-theme-carbon/src/components/Meta';
import Header from './Header';
// import Switcher from 'gatsby-theme-carbon/src/components/Switcher';
// import Footer from 'gatsby-theme-carbon/src/components/Footer';
import Container from 'gatsby-theme-carbon/src/components/Container';

import 'gatsby-theme-carbon/src/styles/index.scss';

const Layout = ({
  children,
  homepage,
  theme,
  titleType,
  pageTitle,
  pageDescription,
  pageKeywords,
  nav,
  topNav,
  preFooter,
  ...rest
}) => {
  const is404 = children.key === null;

  useLayoutEffect(() => {
    // eslint-disable-next-line global-require
    require('smooth-scroll')('a[href*="#"]', {
      speed: 400,
      durationMin: 250,
      durationMax: 700,
      easing: 'easeInOutCubic',
      clip: true,
      offset: 48,
    });
  }, []);

  let container;
  if (!homepage) {
    container = <Container homepage={false} theme={theme}>
      {children}
      {preFooter}
      {/* <Footer /> */}
    </Container>
  } else {
    container = 
      <div style={{background: "var(--cds-ui-01, #f4f4f4)",
        width: "100%",
        marginLeft: "0",
    // -webkit-transition: 110ms ease;
        transition: "110ms ease",
        position: "relative",
        minHeight: "calc(100vh - 48px)",
        marginTop: "3rem"}}>
      {children}
      {preFooter}
      {/* <Footer /> */}
    </div>
  }
  return (
    <React.Fragment>
      <Meta
        titleType={titleType}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
        pageKeywords={pageKeywords}
      />
      <Header topNav={topNav} nav={nav} homepage={false} is404Page={is404} theme={theme} />
      {/* <Switcher /> */}
      {container}
    </React.Fragment>
  );
};

export default Layout;