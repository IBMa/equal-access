import React, { useContext } from 'react';
// import { Link } from 'gatsby';
import {
  Header as ShellHeader,
  HeaderMenuButton,
  SkipToContent,
  HeaderGlobalBar,
  // HeaderGlobalAction,
  HeaderNavigation,
  // HeaderMenu,
  HeaderName
} from 'carbon-components-react/lib/components/UIShell';
// import { AppSwitcher20, Close20 } from '@carbon/icons-react';
import cx from 'classnames';

import GlobalSearch from 'gatsby-theme-carbon/src/components/GlobalSearch';
import NavContext from 'gatsby-theme-carbon/src/util/context/NavContext';
import useMetadata from 'gatsby-theme-carbon/src/util/hooks/useMetadata';
import { withPrefix } from "gatsby"
// import { keys, matches } from 'carbon-components-react/lib/internal/keyboard';

import {
  header,
  // switcherButtonOpen,
  skipToContent,
  headerName,
  collapsed,
  headerButton,
  // switcherButton,
} from 'gatsby-theme-carbon/src/components/Header/Header.module.scss';


const CustomHeader = ({ children,
  homepage,
  theme,
  is404Page,
  nav,
  topNav,
  ...rest }) => {
    const {
    leftNavIsOpen,
    toggleNavState,
    // switcherIsOpen,
    searchIsOpen    
  } = useContext(NavContext);
  const { isSearchEnabled } = useMetadata();
  let headerNav = <React.Fragment>
  </React.Fragment>;

  return (
    <React.Fragment>
      <ShellHeader aria-label="Header" className={header}>
        <SkipToContent className={skipToContent} />
        <HeaderMenuButton
          className={cx('bx--header__action--menu', headerButton)}
          aria-label="Open menu"
          onClick={() => {
            toggleNavState('leftNavIsOpen');
            toggleNavState('switcherIsOpen', 'close');
          }}
          isActive={leftNavIsOpen}
        />
        <HeaderName className={cx(headerName, {
            [collapsed]: searchIsOpen,
          })} href="https://ibm.com/able" prefix="IBM">
          Equal Access Accessibility Checker
        </HeaderName>
        <HeaderNavigation aria-label="IBM Equal Access Accessibility Checker">
          {headerNav}
        </HeaderNavigation>
        <HeaderGlobalBar>
          {isSearchEnabled && <GlobalSearch />}
          {/* <HeaderGlobalAction
            className={cx(headerButton, switcherButton, {
              [switcherButtonOpen]: switcherIsOpen,
            })}
            aria-label="Switch"
            onClick={() => {
              toggleNavState('switcherIsOpen');
              toggleNavState('searchIsOpen', 'close');
              toggleNavState('leftNavIsOpen', 'close');
            }}
          >
            {switcherIsOpen ? <Close20 /> : <AppSwitcher20 />}
          </HeaderGlobalAction> */}
        </HeaderGlobalBar>
      </ShellHeader>
    </React.Fragment>
  );
};

const DefaultHeaderText = () => (
  <React.Fragment>
    IBM <span>Equal Access</span> Accessibility Checker
  </React.Fragment>
);

CustomHeader.defaultProps = {
  children: <DefaultHeaderText />,
};

export default CustomHeader;
