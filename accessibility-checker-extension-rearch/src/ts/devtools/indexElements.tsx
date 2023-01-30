/******************************************************************************
  Copyright:: 2020- IBM, Inc

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*****************************************************************************/

import * as React from 'react';
import ReactDOM from 'react-dom';
import { getBGController } from '../background/backgroundController';
import { ISettings } from '../interfaces/interfaces';
    
import "../styles/index.scss";

let bgController = getBGController();
interface PageAppState {
    settings?: ISettings
}
class PageApp extends React.Component<{}, PageAppState> {
    state : PageAppState = {
    }
    componentDidMount(): void {
        bgController.getSettings().then((settings) => {
            this.setState({ settings });
        })
    }
    render() {
        return <React.Fragment>{JSON.stringify(this.state.settings)}</React.Fragment>
    }
}

ReactDOM.render(<PageApp />
    , document.getElementById('pageapp-root'));
    