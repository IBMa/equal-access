import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { settings } from 'carbon-components';
import { Row, Column } from 'gatsby-theme-carbon/src/components/Grid';
import ResourceCard from 'gatsby-theme-carbon/src/components/ResourceCard';

const { prefix } = settings;
let uniqueCount = 0;
export default class FeatureCard extends React.Component {
    uniqueId = "fc_" + uniqueCount++;
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
        actionIcon: PropTypes.string,

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
        disabled: false,
        actionIcon: 'launch',
    };

    nav(id, to, e) {
        if (!e || e.key === 'Enter') {
            document.getElementById(id).querySelector("a").click();
        }
    }

    render() {
        const {
            children,
            href,
            subTitle,
            title,
            color,
            disabled,
            actionIcon,
            className,
        } = this.props;

        // let isLink;
        // if (href !== undefined) {
        //     isLink = href.charAt(0) === '/';
        // }

        const FeatureCardClassNames = classnames([`${prefix}--feature-card`], {
            [className]: className,
        });

        const cardContent = (
            <React.Fragment>
                <Row>
                    <Column noGutterMdLeft>
                        <div
                            className={`${prefix}--feature-card__img ${prefix}--aspect-ratio--1x1`}
                        >
                            <div className={`${prefix}--aspect-ratio--object`}>
                                {children}
                            </div>
                        </div>
                    </Column>
                </Row>
                <Row className={`${prefix}--feature-card__row`}>
                    <Column
                        colMd={4}
                        colLg={4}
                        offsetLg={8}
                        offsetMd={4}
                        noGutterMdLeft
                        className={`${prefix}--feature-card__column`}
                    >
                        <div id={this.uniqueId}>
                            <ResourceCard
                                title={title}
                                subTitle={subTitle}
                                aspectRatio="2:1"
                                href={href}
                                actionIcon={actionIcon}
                                color={color}
                                disabled={disabled}
                            />
                        </div>
                    </Column>
                </Row>
            </React.Fragment>
        );

        let cardContainer;
        if (disabled === true) {
            cardContainer = <div>{cardContent}</div>;
        } else {
            cardContainer = (
                <div style={{cursor:"pointer"}} className={`${prefix}--feature-card__link`}
                    onKeyDown={(e) => { this.nav(this.uniqueId, href, e) }}
                    onClick={() => this.nav(this.uniqueId, href, null)}
                    role='menuitem'
                    tabIndex={0}>
                    {cardContent}
                </div>
            );
        }

        return <div className={FeatureCardClassNames}>{cardContainer}</div>;
    }
}
