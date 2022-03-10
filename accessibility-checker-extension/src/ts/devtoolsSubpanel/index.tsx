import * as React from 'react';
import ReactDOM from 'react-dom';
import DevToolsPanelApp from '../devtools/DevToolsPanelApp';

import "../styles/index.scss";
import "../styles/panel.scss";

ReactDOM.render(<DevToolsPanelApp layout="sub"  />
	, document.getElementById('devtoolsPanel-root'));
