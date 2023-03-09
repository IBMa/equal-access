declare module "\*.svg" {
    import React = require("react");
    export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
  }

  declare module '@carbon/charts-react';

  declare module '@carbon/react'; 
  declare module '@carbon/react/icons/lib/index'