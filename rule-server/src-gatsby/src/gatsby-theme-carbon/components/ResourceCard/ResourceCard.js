import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link } from 'gatsby';
import {
  Launch20,
  Download20,
  ArrowRight20,
  Error20,
  Email20,
} from '@carbon/icons-react';
import { settings } from 'carbon-components';

const { prefix } = settings;

export default class ResourceCard extends React.Component {
  static propTypes = {
    children: PropTypes.node,

    /**
     * Set url for card
     */
    href: PropTypes.string,

    /**
     * Smaller heading
     */
    subTitle: PropTypes.string,

    /**
     * Large heading
     */
    title: PropTypes.string,

    /**
     * Action icon, default is launch, options are Launch, ArrowRight, Download, Error
     */
    actionIcon: PropTypes.any,

    /**
     * Set card aspect ratio, default is 2:1, options are 1:1, 16:9, 4:3
     */
    aspectRatio: PropTypes.string,

    /**
     * set to "dark" for dark background card
     */
    color: PropTypes.string,

    /**
     * Use for disabled card
     */
    disabled: PropTypes.bool,

    /**
     * Specify a custom class
     */
    className: PropTypes.string,
  };

  static defaultProps = {
    color: 'light',
    disabled: false,
    aspectRatio: '2:1',
    actionIcon: 'launch',
  };

  render() {
    const {
      children,
      href,
      subTitle,
      title,
      color,
      disabled,
      aspectRatio,
      actionIcon,
      className,
      ...rest
    } = this.props;

    let isLink;
    if (href !== undefined) {
      isLink = href.charAt(0) === '/';
    }

    const ResourceCardClassNames = classnames([`${prefix}--resource-card`], {
      [className]: className,
      [`${prefix}--resource-card--disabled`]: disabled,
      [`${prefix}--resource-card--dark`]: color === 'dark',
    });

    const aspectRatioClassNames = classnames([`${prefix}--aspect-ratio`], {
      [`${prefix}--aspect-ratio--2x1`]: aspectRatio === '2:1',
      [`${prefix}--aspect-ratio--1x1`]: aspectRatio === '1:1',
      [`${prefix}--aspect-ratio--16x9`]: aspectRatio === '16:9',
      [`${prefix}--aspect-ratio--4x3`]: aspectRatio === '4:3',
    });

    const carbonTileclassNames = classnames([`${prefix}--tile`], {
      [`${prefix}--tile--clickable`]: href !== undefined,
    });

    const cardContent = (
      <React.Fragment>
        {title && (
          <h4 className={`${prefix}--resource-card__title`}>{title}</h4>
        )}
        {subTitle && (
          <div className={`${prefix}--resource-card__subtitle`}>{subTitle}</div>
        )}
        <div className={`${prefix}--resource-card__icon--img`}>{children}</div>
        <div className={`${prefix}--resource-card__icon--action`}>
            {typeof actionIcon === "string" && <React.Fragment>
                {actionIcon === 'launch' && !disabled ? (
                    <Launch20 aria-label="Open resource" />
                ) : null}
                {actionIcon === 'arrowRight' && !disabled ? (
                    <ArrowRight20 aria-label="Open resource" />
                ) : null}
                {actionIcon === 'download' && !disabled ? (
                    <Download20 aria-label="Download" />
                ) : null}
                {actionIcon === 'email' && !disabled ? (
                    <Email20 aria-label="Email" />
                ) : null}
                {actionIcon === 'disabled' || disabled === true ? (
                    <Error20 aria-label="disabled" />
                ) : null}
            </React.Fragment>}
            {typeof actionIcon !== "string" && actionIcon}
        </div>
      </React.Fragment>
    );

    let cardContainer;
    if (disabled === true || href === undefined) {
      cardContainer = <div className={carbonTileclassNames}>{cardContent}</div>;
    } else if (isLink === true) {
      cardContainer = (
        <Link to={href} className={carbonTileclassNames} {...rest}>
          {cardContent}
        </Link>
      );
    } else {
      cardContainer = (
        <a href={href} className={carbonTileclassNames} {...rest}>
          {cardContent}
        </a>
      );
    }

    return (
      <div className={ResourceCardClassNames}>
        <div className={aspectRatioClassNames}>
          <div className={`${prefix}--aspect-ratio--object`}>
            {cardContainer}
          </div>
        </div>
      </div>
    );
  }
}
