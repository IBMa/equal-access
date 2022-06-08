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

 import { Controller, Get, Route, Request, Response } from 'tsoa';
import * as express from 'express';
import { ApiError } from './apiError';

@Route('/hello')
export class UserV1Controller extends Controller {
    @Get('')
    @Response<ApiError>('500', 'Internal Server Error')
    public async hello(
        @Request() req:express.Request
    ) 
    {
        return "Hello World";
    }
}