import React from 'react';
import Layout from '../components/Layout';
// import { HomepageCallout } from 'gatsby-theme-carbon/src/components/Homepage';
// import Carbon from 'gatsby-theme-carbon/src/images/carbon.jpg';
// import Main from 'gatsby-theme-carbon/src/components/Main';
import Home1 from '../../images/home_1.png';
import { firstColumn } from 'gatsby-theme-carbon/src/components/Homepage/Callout.module.scss';
import { Column, Row } from 'gatsby-theme-carbon/src/components/Grid';
// import styled from '@emotion/styled';

import BackToTopBtn from 'gatsby-theme-carbon/src/components/BackToTopBtn';
// import NextPrevious from 'gatsby-theme-carbon/src/components/NextPrevious';

const Homepage = ({
  children,
  Banner,
  FirstCallout,
  SecondCallout,
  location,
  pageContext,
}) => {
  const { frontmatter = {}, titleType } = pageContext;
  const { title, description, keywords } = frontmatter;
  if (typeof document !== "undefined") {
    document.location.href = "https://ibm.com/able";
  }
  return (
    <Layout
      pageTitle={title}
      pageDescription={description}
      pageKeywords={keywords}
      titleType={titleType}
      homepage
      topNav={true}
    >
      {/* {Banner} */}
      {/* {FirstCallout} */}
      {/* <Main style={{backgroundColor:"white"}}>{children}</Main> */}
      {children}
      {/* {SecondCallout} */}
      {/* <NextPrevious location={location} pageContext={pageContext} /> */}
      <BackToTopBtn />
    </Layout>
  );
};
Homepage.defaultProps = {
  Banner: (
    <div style={{
      backgroundColor:"#1c1131",
      color:"white", 
      paddingLeft:"2rem",paddingRight:"0px", width: "100%", maxWidth: "100%"}}>
      <Row>
        <Column colLg={4} colMd={4} className={firstColumn}>
        <h1 style={{
            fontSize:"5rem",
            lineHeight:"5rem",
            fontWeight:"100",
            marginBottom:"2rem",
            marginTop:  "2rem",
            maxWidth:"400px"
          }}><span style={{color: "#ac89f8"}}>More</span>&nbsp;than compliant</h1>
          <div style={{maxWidth:"400px"}}>We are elevating accessibility to a mainstream
          practice, culture, and mindset that inspires
          and guides others to design and build delightful
          and inclusive experiences.</div>
        </Column>
        <Column colLg={8} colMd={4} noGutterMax noGutterLg noGutterMd noGutterSm noGutterXl>
        <div style={{textAlign:'right'}}><img alt="" src={Home1} style={{width:"600px", maxWidth:"85%"}}/></div>
        </Column>
      </Row>
    </div>
  ),
  FirstCallout: <React.Fragment></React.Fragment>,
  SecondCallout: <React.Fragment></React.Fragment>,
};

export default Homepage;
