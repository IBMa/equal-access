/******************************************************************************
    Copyright:: 2023- IBM, Inc

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
let fetch2: any = typeof fetch !== "undefined" ? fetch : null;;
if (!fetch2) {
    fetch2 = async (url) => {
        try {
            const resp = await new Promise<XMLHttpRequest>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onload = () => resolve(xhr);
                xhr.onerror = () => reject(new Error(`Request failed with status: ${xhr.status}`));
                xhr.send();
            });

            if (resp.status >= 200 && resp.status < 300) {
                return {
                    text: async () => resp.responseText,
                    json: async () => JSON.parse(resp.responseText)
                }
            } else {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    } 
}

export async function fetch_get(url: string) {
    const resp = await fetch2(url);
    return await resp.json();
}

export async function fetch_get_text(url: string) {
    const resp = await fetch2(url);
    return await resp.text();
}