import React from 'react';
import Footer from 'gatsby-theme-carbon/src/components/Footer';

const Content = () => (
  <React.Fragment>
    <p>Have questions? Please <a href="/contact">contact</a> us.</p>

      <p>Last updated September 16, 2019<br/>
      Copyright © 2019 IBM
    </p>
  </React.Fragment>
);

const links = {
  firstCol: [
    { href: 'https://www.ibm.com/privacy', linkText: 'Privacy' },
    { href: 'https://www.ibm.com/legal', linkText: 'Terms of Use' },
    { href: 'https://www.ibm.com/', linkText: 'IBM.com' },
  ],
  secondCol: [],
};

const CustomFooter = () => <Footer links={links} Content={Content} />;

export default CustomFooter;
